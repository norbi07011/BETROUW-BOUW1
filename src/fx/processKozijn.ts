// @ts-nocheck
/* ==================================================================
   Process kozijn – scroll-driven Three.js scene for "Onze Werkwijze".
   One window frame tells the four steps of the process:
     0.00–0.25  Offerte     – technical drawing: champagne edges + dimensions
     0.25–0.50  Advies      – material appears (anthracite aluminium)
     0.50–0.75  Montage     – a wall rises around it, frame slides in, glass set
     0.75–1.00  Oplevering  – a warm light sweep runs across the glass
   Realistic reflections come from three's RoomEnvironment (no HDRI download).
   ================================================================== */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const cl = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const seg = (p, a, b) => cl((p - a) / (b - a));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

export function createProcessScene(host: HTMLElement) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const cv = renderer.domElement;
  cv.style.width = '100%';
  cv.style.height = '100%';
  cv.style.display = 'block';
  host.appendChild(cv);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

  /* ---------- materials ---------- */
  const CHAMPAGNE = 0xcbb084;
  const alu = new THREE.MeshStandardMaterial({ color: 0x111214, metalness: 0.6, roughness: 0.32, envMapIntensity: 0.3, transparent: true, opacity: 0 });
  const aluInner = new THREE.MeshStandardMaterial({ color: 0x0f1011, metalness: 0.55, roughness: 0.38, envMapIntensity: 0.28, transparent: true, opacity: 0 });
  const gasket = new THREE.MeshStandardMaterial({ color: 0x0e0f10, roughness: 0.85, transparent: true, opacity: 0 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a46c, metalness: 1, roughness: 0.22, transparent: true, opacity: 0 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xd9e4e6, metalness: 0, roughness: 0.03, transparent: true, opacity: 0,
    envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: 0.02, depthWrite: false,
  });
  const brickTex = (() => {
    const S = 512, cols = 8, rows = 16, bw = S / cols, bh = S / rows, m = 3;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    g.fillStyle = '#3b3631'; g.fillRect(0, 0, S, S);
    for (let r = 0; r < rows; r++) {
      const off = r % 2 ? bw / 2 : 0;
      for (let k = -1; k <= cols; k++) {
        const li = 11 + Math.random() * 7, hue = 18 + Math.random() * 12, sat = 6 + Math.random() * 8;
        g.fillStyle = `hsl(${hue},${sat}%,${li}%)`;
        g.fillRect(k * bw + off + m / 2, r * bh + m / 2, bw - m, bh - m);
        for (let n = 0; n < 40; n++) {
          g.fillStyle = `hsla(${hue},${sat}%,${li + (Math.random() * 10 - 5)}%,.5)`;
          g.fillRect(k * bw + off + Math.random() * bw, r * bh + Math.random() * bh, 2, 1.5);
        }
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  })();
  const wallMats = [];
  const makeWallMat = (w, h) => {
    const t = brickTex.clone();
    t.needsUpdate = true;
    t.repeat.set(w / 0.9, h / 0.9);
    const m = new THREE.MeshStandardMaterial({ map: t, color: 0xffffff, roughness: 0.95, metalness: 0, envMapIntensity: 0.25, transparent: true, opacity: 0 });
    wallMats.push(m);
    return m;
  };
  const revealMat = new THREE.MeshStandardMaterial({ color: 0x3a352f, roughness: 0.9, transparent: true, opacity: 0 });
  const edgeMat = new THREE.LineBasicMaterial({ color: CHAMPAGNE, transparent: true, opacity: 1, toneMapped: false });
  const dimMat = new THREE.LineBasicMaterial({ color: CHAMPAGNE, transparent: true, opacity: 0.8, toneMapped: false });
  const solids = [alu, aluInner, gasket, brass];

  /* ---------- geometry helpers ---------- */
  const W = 1.2, H = 1.5, P = 0.072, D = 0.11; // frame width/height, profile face, depth
  const win = new THREE.Group();
  const edges = new THREE.Group();
  win.add(edges);

  /** Bar with softly bevelled edges (catches highlights like real aluminium). */
  function bar(w, h, d, mat, x, y, z) {
    const r = Math.min(0.006, w / 4, h / 4);
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - 0.008, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.004, bevelSegments: 2, curveSegments: 3 });
    g.translate(0, 0, -(d - 0.008) / 2);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    win.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), edgeMat);
    e.position.copy(m.position);
    edges.add(e);
    return m;
  }

  // outer frame (kozijn)
  bar(W, P, D, alu, 0, H / 2 - P / 2, 0);
  bar(W, P, D, alu, 0, -H / 2 + P / 2, 0);
  bar(P, H - 2 * P, D, alu, -W / 2 + P / 2, 0, 0);
  bar(P, H - 2 * P, D, alu, W / 2 - P / 2, 0, 0);
  // mullion + transom
  const MW = P * 0.85, TY = H * 0.17;
  bar(MW, H - 2 * P, D * 0.9, alu, 0, 0, 0);
  bar(W - 2 * P, MW, D * 0.9, alu, 0, TY, 0);

  // sashes (inner frames) + glass + gaskets per lite
  const lites = [];
  const inW = (W - 2 * P - MW) / 2;
  const topH = H / 2 - P - TY - MW / 2;
  const botH = TY - MW / 2 - (-H / 2 + P);
  const cells = [
    { cx: -(MW / 2 + inW / 2), cy: TY + MW / 2 + topH / 2, w: inW, h: topH },
    { cx: MW / 2 + inW / 2, cy: TY + MW / 2 + topH / 2, w: inW, h: topH },
    { cx: -(MW / 2 + inW / 2), cy: -H / 2 + P + botH / 2, w: inW, h: botH, sash: true },
    { cx: MW / 2 + inW / 2, cy: -H / 2 + P + botH / 2, w: inW, h: botH, sash: true, handle: true },
  ];
  const SP = 0.05, SD = 0.07, SZ = 0.012;
  for (const c of cells) {
    if (c.sash) {
      bar(c.w - 0.008, SP, SD, aluInner, c.cx, c.cy + c.h / 2 - SP / 2 - 0.004, SZ);
      bar(c.w - 0.008, SP, SD, aluInner, c.cx, c.cy - c.h / 2 + SP / 2 + 0.004, SZ);
      bar(SP, c.h - 2 * SP - 0.008, SD, aluInner, c.cx - c.w / 2 + SP / 2 + 0.004, c.cy, SZ);
      bar(SP, c.h - 2 * SP - 0.008, SD, aluInner, c.cx + c.w / 2 - SP / 2 - 0.004, c.cy, SZ);
    }
    const inset = c.sash ? SP + 0.004 : 0.004;
    const gw = c.w - 2 * inset, gh = c.h - 2 * inset;
    const gm = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, 0.024), glass);
    gm.position.set(c.cx, c.cy, SZ);
    gm.renderOrder = 2;
    gm.userData.home = gm.position.clone();
    win.add(gm);
    lites.push(gm);
    // thin black gasket around the pane (4 strips, not a filled panel)
    const G = 0.008;
    [[gw + 2 * G, G, 0, gh / 2 + G / 2], [gw + 2 * G, G, 0, -gh / 2 - G / 2], [G, gh, -gw / 2 - G / 2, 0], [G, gh, gw / 2 + G / 2, 0]].forEach(([bw, bh, dx, dy]) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.03), gasket);
      strip.position.set(c.cx + dx, c.cy + dy, SZ);
      win.add(strip);
    });
    if (c.handle) {
      const hx = c.cx - c.w / 2 + 0.03, hy = c.cy + 0.02, hz = SZ + SD / 2 + 0.012;
      const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 24), brass);
      rose.rotation.x = Math.PI / 2;
      rose.position.set(hx, hy, hz);
      win.add(rose);
      const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.13, 16), brass);
      lever.position.set(hx, hy - 0.06, hz + 0.022);
      win.add(lever);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 16), brass);
      neck.rotation.x = Math.PI / 2;
      neck.position.set(hx, hy, hz + 0.012);
      win.add(neck);
      lever.castShadow = rose.castShadow = true;
    }
  }

  /* ---------- dimension lines (technical drawing) ---------- */
  const dims = new THREE.Group();
  function dimLine(a, b, tickDir) {
    const pts = [a, b];
    const t = tickDir.clone().multiplyScalar(0.05);
    pts.push(a.clone().sub(t), a.clone().add(t), b.clone().sub(t), b.clone().add(t));
    const g = new THREE.BufferGeometry().setFromPoints([pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]]);
    dims.add(new THREE.LineSegments(g, dimMat));
  }
  dimLine(new THREE.Vector3(-W / 2, -H / 2 - 0.16, 0), new THREE.Vector3(W / 2, -H / 2 - 0.16, 0), new THREE.Vector3(0, 1, 0));
  dimLine(new THREE.Vector3(W / 2 + 0.16, -H / 2, 0), new THREE.Vector3(W / 2 + 0.16, H / 2, 0), new THREE.Vector3(1, 0, 0));
  win.add(dims);

  /* ---------- wall with opening (appears at "Montage") ---------- */
  const wall = new THREE.Group();
  const WT = 0.3, WM = 1.8; // wall thickness, margin around the opening
  const gap = 0.012;
  function wallBox(w, h, x, y) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, WT), makeWallMat(w, h));
    m.position.set(x, y, -WT / 2 + D / 2 - 0.02);
    m.receiveShadow = true;
    m.castShadow = true;
    wall.add(m);
  }
  const ow = W + gap * 2, oh = H + gap * 2;
  wallBox(ow + WM * 2, WM, 0, oh / 2 + WM / 2);
  wallBox(ow + WM * 2, WM, 0, -oh / 2 - WM / 2);
  wallBox(WM, oh, -ow / 2 - WM / 2, 0);
  wallBox(WM, oh, ow / 2 + WM / 2, 0);
  // stone sill
  const sill = new THREE.Mesh(new THREE.BoxGeometry(ow + 0.12, 0.05, 0.2), revealMat);
  sill.position.set(0, -oh / 2 - 0.025, D / 2 + 0.06);
  sill.castShadow = sill.receiveShadow = true;
  wall.add(sill);
  scene.add(wall);
  scene.add(win);

  /* ---------- light sweep across the glass ---------- */
  const sweepTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 8;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, 'rgba(255,236,200,0)');
    gr.addColorStop(0.45, 'rgba(255,236,200,0.0)');
    gr.addColorStop(0.5, 'rgba(255,240,215,0.9)');
    gr.addColorStop(0.55, 'rgba(255,236,200,0.0)');
    gr.addColorStop(1, 'rgba(255,236,200,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 8);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  })();
  const sweepMat = new THREE.MeshBasicMaterial({ map: sweepTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const sweep = new THREE.Mesh(new THREE.PlaneGeometry(1.1, H * 1.2), sweepMat);
  sweep.rotation.z = -0.35;
  sweep.position.z = SZ + 0.02;
  sweep.renderOrder = 3;
  const sweepClip = new THREE.Group();
  sweepClip.add(sweep);
  win.add(sweepClip);

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0xf1e6d6, 0x1a1612, 0.35));
  const key = new THREE.DirectionalLight(0xffe2bf, 1.9);
  key.position.set(-2.4, 3.2, 3.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -2.5; key.shadow.camera.right = 2.5;
  key.shadow.camera.top = 2.5; key.shadow.camera.bottom = -2.5;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(CHAMPAGNE, 1.4);
  rim.position.set(3, 1.5, -3);
  scene.add(rim);
  const fill = new THREE.PointLight(0xffd9a8, 0.0, 6);
  fill.position.set(0.4, 0.2, 1.6);
  scene.add(fill);

  /* ---------- state + render ---------- */
  let target = 0, cur = 0;
  let w = 0, h = 0;
  let raf = 0, visible = true, disposed = false;
  const t0 = performance.now();

  function resize() {
    const r = host.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    // keep the whole window (and wall margin) in frame on narrow screens
    const fitDist = (H * 1.55) / (2 * Math.tan((cam.fov * Math.PI) / 360));
    cam.userData.base = Math.max(fitDist, fitDist / Math.min(1, cam.aspect * 1.05));
    cam.updateProjectionMatrix();
  }

  function apply(p) {
    const time = (performance.now() - t0) / 1000;
    // 0 Offerte — blueprint
    const solid = ease(seg(p, 0.18, 0.42));
    for (const m of solids) m.opacity = solid;
    edgeMat.opacity = lerp(0.95, 0.0, ease(seg(p, 0.22, 0.45)));
    dimMat.opacity = lerp(0.85, 0, ease(seg(p, 0.12, 0.28)));
    dims.visible = dimMat.opacity > 0.01;
    edges.visible = edgeMat.opacity > 0.01;
    // rotation: shows depth while drawing, settles frontal for delivery
    const turn = ease(seg(p, 0, 0.5));
    const settle = ease(seg(p, 0.5, 0.8));
    win.rotation.y = lerp(lerp(-0.75, 0.42, turn), -0.12, settle);
    win.rotation.x = lerp(0.12, 0.02, settle);
    wall.rotation.copy(win.rotation);
    // 2 Montage — wall rises, frame slides into the opening, glass set
    const wallIn = ease(seg(p, 0.5, 0.62));
    for (const m of wallMats) m.opacity = wallIn;
    revealMat.opacity = wallIn;
    wall.visible = wallIn > 0.01;
    wall.position.y = lerp(-0.25, 0, wallIn);
    const slide = ease(seg(p, 0.56, 0.72));
    win.position.z = lerp(0.9, 0, slide);
    const glassIn = ease(seg(p, 0.62, 0.76));
    glass.opacity = lerp(0, 0.2, glassIn);
    for (const g of lites) g.position.z = g.userData.home.z + (1 - glassIn) * 0.35;
    // 3 Oplevering — warm light sweep + glow
    const sw = seg(p, 0.8, 0.97);
    sweep.position.x = lerp(-1.1, 1.1, ease(sw));
    sweepMat.opacity = Math.sin(sw * Math.PI) * 0.9;
    fill.intensity = lerp(0, 1.2, ease(seg(p, 0.78, 0.92)));
    // camera: slow dolly-in, gentle idle float
    const base = cam.userData.base || 4;
    const dist = lerp(base * 1.08, base * (p > 0.5 ? 1.12 : 0.98), ease(seg(p, 0, 0.5)));
    cam.position.set(Math.sin(time * 0.25) * 0.05, 0.06 + Math.cos(time * 0.3) * 0.03, dist);
    cam.lookAt(0, -0.02, 0);
  }

  function frame() {
    raf = 0;
    if (disposed) return;
    cur += (target - cur) * 0.12;
    apply(cur);
    renderer.render(scene, cam);
    if (visible) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && !disposed) raf = requestAnimationFrame(frame); };

  const io = new IntersectionObserver((ents) => {
    visible = ents[0]?.isIntersecting ?? true;
    if (visible) kick();
  });
  io.observe(host);
  const ro = new ResizeObserver(() => { resize(); kick(); });
  ro.observe(host);
  resize();
  kick();

  return {
    setProgress(p) { target = cl(p); kick(); },
    jump(p) { target = cur = cl(p); kick(); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
      [alu, aluInner, gasket, brass, glass, revealMat, edgeMat, dimMat, sweepMat, ...wallMats].forEach((m) => { m.map?.dispose(); m.dispose(); });
      brickTex.dispose();
      sweepTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      cv.remove();
    },
  };
}
