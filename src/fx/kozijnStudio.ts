// @ts-nocheck
/* ==================================================================
   KozijnStudio – interactieve 3D-montage van een kunststof kozijn
   in een Nederlandse spouwmuur (renovatie: oud houten kozijn eruit).
   Ported from the Betrouw Bouw artifact; Three.js r128.
   ================================================================== */
import * as THREE from 'three';

export function createKozijnStudio(host: any, opts: any): any {
  var T: any = THREE;
  var renderer;
  try{ renderer = new T.WebGLRenderer({antialias:true, alpha:true, powerPreference:'high-performance'}); }catch(e){ return null; }
  if(!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  host.insertBefore(renderer.domElement, host.firstChild);
  var cv = renderer.domElement;
  var scene = new T.Scene();
  var cam = new T.PerspectiveCamera(32, 1, 0.05, 80);
  var maxAniso = renderer.capabilities.getMaxAnisotropy();
  function rand(a,b){ return a + Math.random()*(b-a); }
  function cl(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function eo(x){ return 1 - Math.pow(1 - x, 3); }
  function eio(x){ return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3)/2; }
  function ss(x){ return x*x*(3 - 2*x); }
  function eback(x){ var c1 = 1.5, c3 = c1 + 1; return 1 + c3*Math.pow(x-1,3) + c1*Math.pow(x-1,2); }

  /* ---------- omgeving (reflecties) ---------- */
  (function(){
    var pm = new T.PMREMGenerator(renderer), es = new T.Scene();
    var sg = new T.SphereGeometry(20, 48, 24), pa = sg.attributes.position, cols = [];
    var zen = new T.Color(0x4a6b8f), hor = new T.Color(0xe9e2d6), gnd = new T.Color(0x2a2420);
    for(var i=0;i<pa.count;i++){ var y = pa.getY(i)/20, c = y >= 0 ? hor.clone().lerp(zen, Math.pow(y,0.55)) : hor.clone().lerp(gnd, Math.min(1,-y*4)); cols.push(c.r,c.g,c.b); }
    sg.setAttribute('color', new T.Float32BufferAttribute(cols,3));
    es.add(new T.Mesh(sg, new T.MeshBasicMaterial({side:T.BackSide, vertexColors:true})));
    function panel(w,h,x,y,z,k){ var m = new T.Mesh(new T.PlaneGeometry(w,h), new T.MeshBasicMaterial({color:new T.Color(k,k*.97,k*.92), side:T.DoubleSide})); m.position.set(x,y,z); m.lookAt(0,0,0); es.add(m); }
    panel(9,3.5,-5,7,9,5); panel(3,7,9,2,5,2.5); panel(6,1,0,-2,10,1.6); panel(6,4,0,4,-9,2.2);
    scene.environment = pm.fromScene(es, 0.03).texture; pm.dispose();
  })();

  /* ---------- texturen ---------- */
  function canvas(w,h){ var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  var brickC = (function(){
    var S = 1024, cols = 8, rows = 16, bw = S/cols, bh = S/rows, m = 6, c = canvas(S,S), g = c.getContext('2d'), b = canvas(S,S), gb = b.getContext('2d');
    g.fillStyle = '#8b857a'; g.fillRect(0,0,S,S); gb.fillStyle = '#2a2a2a'; gb.fillRect(0,0,S,S);
    for(var i=0;i<14000;i++){ g.fillStyle = Math.random()>.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.09)'; g.fillRect(Math.random()*S, Math.random()*S, 2, 2); }
    for(var r=0;r<rows;r++){ var off = (r%2) ? bw/2 : 0;
      for(var k=-1;k<=cols;k++){
        var x = k*bw + off + m/2, y = r*bh + m/2, w = bw - m, h = bh - m, hue = rand(6,20), sat = rand(34,52), li = rand(21,33);
        g.fillStyle = 'hsl('+hue+','+sat+'%,'+li+'%)'; g.fillRect(x,y,w,h);
        for(var s=0;s<90;s++){ g.fillStyle = 'hsla('+(hue+rand(-4,4))+','+sat+'%,'+(li+rand(-9,9))+'%,.55)'; g.fillRect(x+Math.random()*w, y+Math.random()*h, rand(1,4), rand(1,2.5)); }
        var gr = g.createLinearGradient(0,y,0,y+h); gr.addColorStop(0,'rgba(255,240,220,.08)'); gr.addColorStop(1,'rgba(0,0,0,.22)'); g.fillStyle = gr; g.fillRect(x,y,w,h);
        var gv = Math.round(rand(190,225)); gb.fillStyle = 'rgb('+gv+','+gv+','+gv+')'; gb.fillRect(x,y,w,h);
      } }
    return {c:c, b:b};
  })();
  var ksC = (function(){ // kalkzandsteen elementen
    var c = canvas(512,512), g = c.getContext('2d');
    g.fillStyle = '#d4d0c7'; g.fillRect(0,0,512,512);
    for(var i=0;i<9000;i++){ g.fillStyle = Math.random()>.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.06)'; g.fillRect(Math.random()*512, Math.random()*512, 2, 2); }
    g.strokeStyle = 'rgba(90,85,78,.45)'; g.lineWidth = 3;
    for(var r=0;r<2;r++){ g.beginPath(); g.moveTo(0,r*256+1); g.lineTo(512,r*256+1); g.stroke(); var off = r%2 ? 128 : 0; for(var k=0;k<3;k++){ g.beginPath(); g.moveTo(off+k*256+1, r*256); g.lineTo(off+k*256+1, r*256+256); g.stroke(); } }
    return c;
  })();
  var woolC = (function(){ // minerale wol
    var c = canvas(256,256), g = c.getContext('2d');
    g.fillStyle = '#d8b24a'; g.fillRect(0,0,256,256);
    for(var i=0;i<2600;i++){ g.strokeStyle = 'rgba(' + (Math.random()>.5 ? '255,236,170' : '150,110,30') + ',' + rand(.15,.4) + ')'; g.lineWidth = rand(.5,1.5); var x = Math.random()*256, y = Math.random()*256; g.beginPath(); g.moveTo(x,y); g.lineTo(x+rand(-14,14), y+rand(-3,3)); g.stroke(); }
    return c;
  })();
  var oldPaintC = (function(){ // oud geschilderd hout
    var c = canvas(512,128), g = c.getContext('2d');
    g.fillStyle = '#e7e0cf'; g.fillRect(0,0,512,128);
    for(var i=0;i<60;i++){ g.fillStyle = 'rgba(' + (Math.random()>.4 ? '110,85,60' : '160,150,130') + ',' + rand(.25,.6) + ')'; var x = Math.random()*512, y = Math.random()*128; g.beginPath(); g.ellipse(x, y, rand(4,26), rand(2,7), rand(0,3), 0, Math.PI*2); g.fill(); }
    g.strokeStyle = 'rgba(90,70,50,.35)'; for(var j=0;j<40;j++){ g.beginPath(); var x0 = Math.random()*512, y0 = Math.random()*128; g.moveTo(x0,y0); g.lineTo(x0+rand(-40,40), y0+rand(-4,4)); g.stroke(); }
    for(var k=0;k<2000;k++){ g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(Math.random()*512, Math.random()*128, 2, 2); }
    return c;
  })();
  function tex(c, rx, ry, srgb){ var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = maxAniso; if(srgb !== false) t.encoding = T.sRGBEncoding; return t; }
  // materiaal per vlak met juiste schaal (meters per tegel = tw x th)
  function layerMats(kind, w, h, d){
    function m(rx, ry){
      if(kind === 'brick') return new T.MeshStandardMaterial({map:tex(brickC.c, rx/1.8, ry/1.2), bumpMap:tex(brickC.b, rx/1.8, ry/1.2, false), bumpScale:.006, roughness:.93, envMapIntensity:.45});
      if(kind === 'ks') return new T.MeshStandardMaterial({map:tex(ksC, rx/1.8, ry/1.2), roughness:.9, envMapIntensity:.5});
      if(kind === 'wool') return new T.MeshStandardMaterial({map:tex(woolC, rx/0.6, ry/0.6), roughness:1, envMapIntensity:.4});
      return new T.MeshStandardMaterial({color:0xefebe4, roughness:.85, envMapIntensity:.5});
    }
    return [m(d,h), m(d,h), m(w,d), m(w,d), m(w,h), m(w,h)];
  }

  /* ---------- maten (meter) ---------- */
  var OW = 1.2, OH = 1.5;                 // sparing 1200 x 1500
  var WX = 1.3, YB = -1.25, YT = 1.45;    // wanddeel
  var LAY = [ {k:'brick', z0:0, z1:-0.1, n:'Buitenblad (baksteen)'}, {k:'wool', z0:-0.1, z1:-0.22, n:'Spouwisolatie'}, {k:'ks', z0:-0.22, z1:-0.32, n:'Binnenblad (kalkzandsteen)'}, {k:'plaster', z0:-0.32, z1:-0.335, n:'Stucwerk'} ];

  /* ---------- wand (doorsnede) ---------- */
  var wall = new T.Group(); scene.add(wall);
  var cutaway = []; // delen die wegvallen in opengewerkte weergave
  LAY.forEach(function(L){
    var d = L.z0 - L.z1, zc = (L.z0 + L.z1)/2;
    [[-WX, -OW/2, YB, YT, false], [OW/2, WX, YB, YT, true], [-OW/2, OW/2, OH/2, YT, true], [-OW/2, OW/2, YB, -OH/2, false]].forEach(function(b){
      var w = b[1]-b[0], h = b[3]-b[2], mats = layerMats(L.k, w, h, d);
      var m = new T.Mesh(new T.BoxGeometry(w, h, d), mats);
      m.position.set((b[0]+b[1])/2, (b[2]+b[3])/2, zc); m.castShadow = m.receiveShadow = true; wall.add(m);
      if(b[4]){ mats.forEach(function(mt){ mt.transparent = true; }); cutaway.push(m); }
    });
  });
  // rollaag boven de sparing
  var roll = (function(){
    var c = canvas(1440,216), g = c.getContext('2d'); g.fillStyle = '#857f74'; g.fillRect(0,0,1440,216);
    for(var i=0;i<19;i++){ var bw = 1440/19, hue = rand(5,16), sat = rand(30,45), li = rand(18,27); g.fillStyle = 'hsl('+hue+','+sat+'%,'+li+'%)'; g.fillRect(i*bw+5,5,bw-10,206); for(var s=0;s<120;s++){ g.fillStyle = 'hsla('+hue+','+sat+'%,'+(li+rand(-8,8))+'%,.5)'; g.fillRect(i*bw+5+Math.random()*(bw-10), 5+Math.random()*206, rand(1,3), rand(1,3)); } }
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = maxAniso;
    var m = new T.Mesh(new T.PlaneGeometry(1.44, 0.216), new T.MeshStandardMaterial({map:t, roughness:.92, envMapIntensity:.45}));
    m.position.set(0, OH/2 + 0.108, 0.002); m.receiveShadow = true; wall.add(m); return m;
  })();
  // stalen latei
  var steelDark = new T.MeshStandardMaterial({color:0x3a3d40, metalness:.6, roughness:.5});
  var latei = new T.Group();
  var l1 = new T.Mesh(new T.BoxGeometry(1.7, 0.008, 0.1), steelDark); l1.position.set(0, OH/2 + 0.004, -0.05); latei.add(l1);
  var l2 = new T.Mesh(new T.BoxGeometry(1.7, 0.16, 0.008), steelDark); l2.position.set(0, OH/2 + 0.08, -0.104); latei.add(l2);
  latei.traverse(function(o){ if(o.isMesh){ o.castShadow = o.receiveShadow = true; } }); wall.add(latei);
  // raamdorpelsteen (hardsteen)
  var sill = new T.Mesh(new T.BoxGeometry(1.44, 0.06, 0.16), new T.MeshStandardMaterial({color:0x32363a, roughness:.45, metalness:.05}));
  sill.position.set(0, -OH/2 - 0.03, -0.03); sill.rotation.x = 0.05; sill.castShadow = sill.receiveShadow = true; wall.add(sill);
  // vloer met schaduw
  var floor = new T.Mesh(new T.PlaneGeometry(30, 30), new T.ShadowMaterial({opacity:.35}));
  floor.rotation.x = -Math.PI/2; floor.position.y = YB; floor.receiveShadow = true; scene.add(floor);

  /* ---------- hulpfuncties ---------- */
  function ring(w,h,p,d,mat){
    var g = new T.Group();
    function add(bw,bh,x,y){ var m = new T.Mesh(new T.BoxGeometry(bw,bh,d), mat); m.position.set(x,y,0); m.castShadow = m.receiveShadow = true; g.add(m); }
    add(w,p,0,h/2-p/2); add(w,p,0,-h/2+p/2); add(p,h-2*p,-w/2+p/2,0); add(p,h-2*p,w/2-p/2,0);
    return g;
  }
  function comp(obj, base, ex, name, anchor){ obj.userData.base = base; obj.userData.ex = ex; obj.userData.name = name; obj.userData.anchor = anchor || new T.Vector3(); scene.add(obj); return obj; }
  var V = function(x,y,z){ return new T.Vector3(x,y,z); };

  /* ---------- materialen ---------- */
  var antra = new T.MeshStandardMaterial({color:0x363b40, roughness:.42, metalness:.08, envMapIntensity:1});
  var antraLight = new T.MeshStandardMaterial({color:0x4a5056, roughness:.45, envMapIntensity:.9});
  var rubber = new T.MeshStandardMaterial({color:0x151617, roughness:.8});
  var steel = new T.MeshStandardMaterial({color:0xc9cdd1, metalness:.9, roughness:.28});
  var oldWood = new T.MeshStandardMaterial({map:tex(oldPaintC, 1, 1), roughness:.75, envMapIntensity:.6});
  var glassMat = new T.MeshPhysicalMaterial({color:0xa3bfca, roughness:.03, transparent:true, opacity:.12, envMapIntensity:1.4, clearcoat:1, clearcoatRoughness:.03, depthWrite:false});
  var mirrorMat = new T.MeshStandardMaterial({color:0xffffff, metalness:1, roughness:.06, transparent:true, opacity:.1, envMapIntensity:1.2, depthWrite:false});
  var oldGlassMat = new T.MeshPhysicalMaterial({color:0xb6c9a8, roughness:.12, transparent:true, opacity:.22, envMapIntensity:1, depthWrite:false});

  /* ---------- OUD kozijn ---------- */
  var oldFrame = comp(ring(1.19, 1.49, 0.09, 0.11, oldWood), V(0,0,-0.065), V(0,0,0.65), 'Oud houten kozijn', V(-0.55,0.62,0.06));
  var oldSash = new T.Group();
  oldSash.add(ring(1.01, 1.31, 0.07, 0.06, oldWood));
  var roedeV = new T.Mesh(new T.BoxGeometry(0.035, 1.17, 0.04), oldWood); oldSash.add(roedeV);
  var roedeH = new T.Mesh(new T.BoxGeometry(0.87, 0.035, 0.04), oldWood); oldSash.add(roedeH);
  var og = new T.Mesh(new T.BoxGeometry(0.88, 1.18, 0.004), oldGlassMat); og.renderOrder = 2; oldSash.add(og);
  oldSash.traverse(function(o){ if(o.isMesh && o !== og){ o.castShadow = true; } });
  comp(oldSash, V(0,0,-0.06), V(0,0,0.25), 'Oud raam met enkel glas', V(0.2,0.3,0.04));

  /* ---------- meten ---------- */
  var laserMat = new T.MeshBasicMaterial({color:0xff3326, transparent:true});
  function line(len){ var g = new T.BoxGeometry(len, 0.005, 0.005); g.translate(len/2, 0, 0); return new T.Mesh(g, laserMat); }
  var laser = new T.Group(); scene.add(laser);
  var lzW = line(OW); lzW.position.set(-OW/2, -0.2, 0.04); laser.add(lzW);
  var lzH = line(OH); lzH.rotation.z = Math.PI/2; lzH.position.set(0.3, -OH/2, 0.04); laser.add(lzH);
  var dg = Math.sqrt(OW*OW + OH*OH), ang = Math.atan2(OH, OW);
  var lzD1 = line(dg); lzD1.rotation.z = ang; lzD1.position.set(-OW/2, -OH/2, 0.045); laser.add(lzD1);
  var lzD2 = line(dg); lzD2.rotation.z = Math.PI - ang; lzD2.position.set(OW/2, -OH/2, 0.045); laser.add(lzD2);

  /* ---------- NIEUW: waterkering, stelblokjes ---------- */
  var epdm = comp(new T.Mesh(new T.BoxGeometry(1.3, 0.004, 0.24), rubber), V(0, -OH/2 + 0.002, -0.09), V(0,-0.1,0.35), 'EPDM waterkering', V(-0.5,0,0.1));
  epdm.receiveShadow = true;
  var blocks = new T.Group();
  [-0.45, 0, 0.45].forEach(function(x){ var b = new T.Mesh(new T.BoxGeometry(0.06, 0.01, 0.08), new T.MeshStandardMaterial({color:0x2f5fb3, roughness:.6})); b.position.set(x, 0, 0); b.castShadow = true; blocks.add(b); });
  comp(blocks, V(0, -OH/2 + 0.009, -0.08), V(0,-0.18,0.7), 'Stelblokjes', V(0.45,0,0.04));

  /* ---------- NIEUW: kunststof kozijn ---------- */
  var FW = 1.18, FH = 1.48, FP = 0.07, FD = 0.1, FZ = -0.08, FY = 0.005;
  var frame = new T.Group();
  frame.add(ring(FW, FH, FP, FD, antra));
  var fl = ring(FW-2*FP+0.02, FH-2*FP+0.02, 0.012, 0.03, antraLight); fl.position.z = -0.02; frame.add(fl);
  var fg = ring(FW-2*FP+0.004, FH-2*FP+0.004, 0.006, 0.01, rubber); fg.position.z = FD/2 - 0.012; frame.add(fg);
  // waterafvoer-kapjes onder
  [-0.35, 0.35].forEach(function(x){ var k = new T.Mesh(new T.BoxGeometry(0.04, 0.008, 0.006), rubber); k.position.set(x, -FH/2 + 0.02, FD/2 + 0.002); frame.add(k); });
  comp(frame, V(0, FY, FZ), V(0, 0, 0.75), 'Kunststof kozijn', V(-FW/2, FH/2 - 0.05, FD/2));

  // compriband (eigen groep, beweegt mee met kozijn)
  var compri = new T.Group();
  var cbMat = new T.MeshStandardMaterial({color:0x5b5f63, roughness:.95});
  var cbL = new T.Mesh(new T.BoxGeometry(1, FH - 0.02, 0.02), cbMat); cbL.position.set(-FW/2, 0, FD/2 - 0.02); compri.add(cbL);
  var cbR = cbL.clone(); cbR.position.x = FW/2; compri.add(cbR);
  var cbT = new T.Mesh(new T.BoxGeometry(FW - 0.02, 1, 0.02), cbMat); cbT.position.set(0, FH/2, FD/2 - 0.02); compri.add(cbT);
  comp(compri, V(0, FY, FZ), V(0, 0, 1.05), 'Compriband', V(FW/2, 0.3, FD/2));

  // kozijnschroeven
  var screws = [];
  [-1, 1].forEach(function(sx){ [-0.5, 0.05, 0.58].forEach(function(y){
    var g = new T.Group();
    var head = new T.Mesh(new T.CylinderGeometry(0.009, 0.009, 0.004, 18), steel); head.rotation.z = Math.PI/2; g.add(head);
    var shaft = new T.Mesh(new T.CylinderGeometry(0.0035, 0.0035, 0.16, 10), steel); shaft.rotation.z = Math.PI/2; shaft.position.x = sx*0.08; g.add(shaft);
    g.userData.sx = sx;
    comp(g, V(sx*(FW/2 - FP) , FY + y, FZ), V(sx*0.32, 0, 0.75), 'Kozijnschroeven', V(0,0,0));
    screws.push(g);
  }); });

  // purschuim (binnenzijde)
  var purMat = new T.MeshStandardMaterial({color:0xe6cf7c, roughness:.95});
  function bead(len, r, mat){ var g = new T.CylinderGeometry(r, r, len, 10); g.translate(0, len/2, 0); var m = new T.Mesh(g, mat); m.castShadow = true; return m; }
  var pur = new T.Group(), purParts = [];
  var p1 = bead(OH, 0.014, purMat); p1.position.set(-OW/2 + 0.006, -OH/2, 0); pur.add(p1); purParts.push(p1);
  var p2 = bead(OW, 0.014, purMat); p2.rotation.z = -Math.PI/2; p2.position.set(-OW/2, OH/2 - 0.006, 0); pur.add(p2); purParts.push(p2);
  var p3 = bead(OH, 0.014, purMat); p3.rotation.z = Math.PI; p3.position.set(OW/2 - 0.006, OH/2, 0); pur.add(p3); purParts.push(p3);
  comp(pur, V(0, 0, -0.145), V(0, 0, -1.35), 'Purschuim', V(-OW/2, 0.35, 0));

  /* ---------- draaikiepraam + beglazing ---------- */
  var SW = 1.04, SH = 1.34, SP = 0.08, SD = 0.075;
  var sashPivot = new T.Group();
  var sash = new T.Group(); sash.position.y = SH/2; sashPivot.add(sash);
  sash.add(ring(SW, SH, SP, SD, antra));
  var sg2 = ring(SW-2*SP+0.004, SH-2*SP+0.004, 0.005, 0.008, rubber); sg2.position.z = SD/2 + 0.004; sash.add(sg2);
  // greep (binnenzijde)
  var handle = new T.Group();
  var hb = new T.Mesh(new T.BoxGeometry(0.03, 0.075, 0.012), steel); handle.add(hb);
  var hl = new T.Mesh(new T.BoxGeometry(0.02, 0.14, 0.018), steel); hl.position.set(0, -0.06, -0.018); handle.add(hl);
  handle.position.set(SW/2 - 0.04, 0, -SD/2 - 0.006); sash.add(handle);
  handle.traverse(function(o){ if(o.isMesh) o.castShadow = true; });
  comp(sashPivot, V(0, FY - SH/2, -0.083), V(0, 0, -0.3), 'Draaikiepraam', V(SW/2, SH - 0.1, -SD/2));
  sashPivot.userData.anchor = V(SW/2 - 0.05, SH - 0.08, -SD/2);

  var glass = new T.Group(); sash.add(glass);
  var GW = 0.9, GH = 1.2;
  [0.012, -0.012].forEach(function(z){ var p = new T.Mesh(new T.BoxGeometry(GW, GH, 0.004), glassMat); p.position.z = z; p.renderOrder = 2; glass.add(p); });
  var refl = new T.Mesh(new T.PlaneGeometry(GW, GH), mirrorMat); refl.position.z = 0.0145; refl.renderOrder = 3; glass.add(refl);
  glass.add(ring(GW-0.02, GH-0.02, 0.012, 0.02, new T.MeshStandardMaterial({color:0x111214, roughness:.6})));
  var gblocks = new T.Group(); sash.add(gblocks);
  [-0.3, 0.3].forEach(function(x){ var b = new T.Mesh(new T.BoxGeometry(0.08, 0.006, 0.026), new T.MeshStandardMaterial({color:0x1d1e20})); b.position.set(x, -GH/2 - 0.003, 0); gblocks.add(b); });
  var latten = new T.Group(); sash.add(latten);
  var lat = [];
  [[GW+0.04, 0.022, 0, GH/2 + 0.009], [GW+0.04, 0.022, 0, -GH/2 - 0.009], [0.022, GH, -GW/2 - 0.009, 0], [0.022, GH, GW/2 + 0.009, 0]].forEach(function(a){
    var m = new T.Mesh(new T.BoxGeometry(a[0], a[1], 0.02), antraLight); m.position.set(a[2], a[3], -SD/2 + 0.004); m.castShadow = true; latten.add(m); lat.push(m);
  });

  /* ---------- afwerking ---------- */
  var kitMat = new T.MeshStandardMaterial({color:0x56595c, roughness:.5});
  var kits = [];
  var kz = -0.027, kx = OW/2 - 0.005, ky = OH/2 - 0.004;
  var kitG = new T.Group();
  var k1 = bead(OW, 0.0075, kitMat); k1.rotation.z = -Math.PI/2; k1.position.set(-OW/2, ky, 0); kitG.add(k1); kits.push(k1);
  var k2 = bead(OH, 0.0075, kitMat); k2.rotation.z = Math.PI; k2.position.set(kx, OH/2, 0); kitG.add(k2); kits.push(k2);
  var k3 = bead(OW, 0.0075, kitMat); k3.rotation.z = Math.PI/2; k3.position.set(OW/2, -ky + 0.006, 0); kitG.add(k3); kits.push(k3);
  var k4 = bead(OH, 0.0075, kitMat); k4.position.set(-kx, -OH/2, 0); kitG.add(k4); kits.push(k4);
  comp(kitG, V(0, 0, kz), V(0, 0, 1.35), 'Kitvoeg buiten', V(-OW/2, -0.35, 0));

  var white = new T.MeshStandardMaterial({color:0xf3f1ec, roughness:.35});
  var dag = new T.Group();
  var dL = new T.Mesh(new T.BoxGeometry(0.012, OH, 0.2), white); dL.position.set(-OW/2 + 0.006, 0, 0); dag.add(dL);
  var dR = dL.clone(); dR.position.x = OW/2 - 0.006; dag.add(dR);
  var dT = new T.Mesh(new T.BoxGeometry(OW, 0.012, 0.2), white); dT.position.set(0, OH/2 - 0.006, 0); dag.add(dT);
  dag.traverse(function(o){ if(o.isMesh){ o.receiveShadow = true; o.castShadow = true; } });
  comp(dag, V(0, 0, -0.235), V(0, 0, -1.6), 'Dagkantafwerking', V(OW/2, 0.4, -0.1));
  var vb = new T.Mesh(new T.BoxGeometry(OW + 0.02, 0.022, 0.24), new T.MeshStandardMaterial({color:0xf6f4ef, roughness:.3}));
  vb.castShadow = vb.receiveShadow = true;
  comp(vb, V(0, -OH/2 + 0.004, -0.245), V(0, -0.12, -1.85), 'Vensterbank', V(-0.4, 0.01, -0.12));

  /* waterpas */
  var level = new T.Group();
  var yellow = new T.MeshStandardMaterial({color:0xf2c12e, roughness:.38, metalness:.35});
  level.add(new T.Mesh(new T.BoxGeometry(0.6, 0.05, 0.026), yellow));
  [-0.31, 0.31].forEach(function(x){ var e = new T.Mesh(new T.BoxGeometry(0.022, 0.054, 0.03), rubber); e.position.x = x; level.add(e); });
  var vial = new T.Mesh(new T.CylinderGeometry(0.009, 0.009, 0.06, 16), new T.MeshStandardMaterial({color:0x9fe07a, transparent:true, opacity:.8, emissive:0x3a6a1e, emissiveIntensity:.6})); vial.rotation.z = Math.PI/2; vial.position.z = 0.019; level.add(vial);
  var bubble = new T.Mesh(new T.SphereGeometry(0.0065, 12, 8), new T.MeshBasicMaterial({color:0xf4ffe6})); bubble.position.z = 0.026; level.add(bubble);
  level.traverse(function(o){ if(o.isMesh) o.castShadow = true; });
  scene.add(level);

  /* ---------- licht ---------- */
  scene.add(new T.HemisphereLight(0xd6e0ea, 0x2b221c, 0.55));
  var sun = new T.DirectionalLight(0xffe3c2, 2.3); sun.position.set(-2.6, 3.4, 3.4); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); var sc = sun.shadow.camera; sc.left = -2.4; sc.right = 2.4; sc.top = 2.4; sc.bottom = -2.4; sc.near = .5; sc.far = 12; sun.shadow.bias = -.0004; sun.shadow.normalBias = .015; scene.add(sun);
  var back = new T.DirectionalLight(0xcfe0ff, 0.9); back.position.set(2.2, 2.4, -3.5); scene.add(back);
  var fill = new T.DirectionalLight(0xbcd2ff, 0.3); fill.position.set(3, 1, 2); scene.add(fill);

  /* ==================================================================
     TIJDLIJN: 10 hoofdstukken, t loopt van 0 tot 10
     ================================================================== */
  var CH = 10, ex = 0, exTarget = 0;
  var tmp = new T.Vector3();
  function place(obj, ax, ay, az){ var b = obj.userData.base, e = obj.userData.ex; obj.position.set(b.x + ax + e.x*ex, b.y + ay + e.y*ex, b.z + az + e.z*ex); }
  function apply(t){
    function P(a,b){ return cl((t - a)/(b - a)); }
    // 0 · inmeten
    var m1 = eo(P(0.15, 0.55)), m2 = eo(P(0.35, 0.75)), m3 = eo(P(0.55, 0.9));
    lzW.scale.x = Math.max(.001, m1); lzH.scale.x = Math.max(.001, m2); lzD1.scale.x = lzD2.scale.x = Math.max(.001, m3);
    laser.visible = t > 0.12 && t < 1.15 && ex < .5; laserMat.opacity = 1 - P(0.95, 1.15);
    // 1 · oud kozijn eruit
    var r1 = eio(P(1.05, 1.45)), r2 = eio(P(1.45, 1.95));
    oldSash.visible = t < 1.5 || ex > .01 && t < 2;
    place(oldSash, 0.9*r1, 0.1*r1, -1.2*r1); oldSash.rotation.y = 0.6*r1;
    oldFrame.visible = t < 2;
    place(oldFrame, 0, 0, 0);
    oldFrame.children.forEach(function(p, i){ // in vier delen uitnemen
      var dir = [[0,1],[0,-1],[-1,0],[1,0]][i];
      p.position.set([0,0,-1.19/2+0.045,1.19/2-0.045][i] + dir[0]*0.55*r2, [1.49/2-0.045,-1.49/2+0.045,0,0][i] + dir[1]*0.35*r2 - 0.4*r2*r2, 1.1*r2);
      p.rotation.set(0.6*r2*dir[0], 0, 0.5*r2*(i%2 ? -1 : 1));
    });
    // 2 · sparing voorbereiden
    var w1 = eo(P(2.2, 2.7));
    epdm.visible = t >= 2.2; epdm.scale.set(Math.max(.001, w1), 1, 1); place(epdm, 0, 0, 0);
    // 3 · plaatsen en stellen
    blocks.visible = t >= 3.0; blocks.scale.setScalar(Math.max(.001, eback(P(3.0, 3.25)))); place(blocks, 0, 0, 0);
    var f = eio(P(3.2, 3.95));
    frame.visible = compri.visible = t >= 3.2;
    place(frame, 0.25*(1-f), 0.3*(1-f), 2.0*(1-f)); frame.rotation.set(0.1*(1-f), -0.6*(1-f), 0.04*(1-f));
    place(compri, 0.25*(1-f), 0.3*(1-f), 2.0*(1-f)); compri.rotation.copy(frame.rotation);
    var cbx = 0.008 + 0.006*eo(P(5.5, 5.95));
    cbL.scale.x = cbR.scale.x = cbx; cbT.scale.y = cbx;
    var lv = P(3.95, 4.2), lvOut = P(4.9, 5.1);
    level.visible = t >= 3.95 && t < 5.1 && ex < .5;
    level.position.set(0, FY - FH/2 + FP + 0.025 + 0.25*(1-eo(lv)) + 0.3*lvOut, FZ);
    var bp = P(4.15, 4.9); bubble.position.x = bp <= 0 ? -0.022 : -0.022*Math.exp(-4.2*bp)*Math.cos(bp*13)*(1-bp);
    // 4 · verankeren
    screws.forEach(function(s, i){
      var a = 4.05 + i*0.12, p = eo(P(a, a + 0.45));
      s.visible = t >= a; place(s, -s.userData.sx*0.16*(1-p), 0, 0); s.rotation.x = p*14;
    });
    // 5 · isoleren en afdichten
    var pp = P(5.05, 5.6)*3;
    purParts.forEach(function(m, i){ var v = cl(pp - i); m.visible = v > 0; m.scale.y = Math.max(.001, v); var sw = 1 + 0.35*eo(P(5.6, 5.9)); m.scale.x = m.scale.z = sw; });
    pur.visible = t >= 5.05; place(pur, 0, 0, 0);
    // 6 · raam afhangen
    var s6 = eio(P(6.05, 6.75));
    sashPivot.visible = t >= 6.05;
    var tilt = -0.15*(eio(P(9.15, 9.5)) - eio(P(9.75, 10.0)));
    place(sashPivot, -0.25*(1-s6), 0.08*(1-s6), -1.5*(1-s6));
    sashPivot.rotation.set(tilt, -0.5*(1-s6), 0);
    handle.visible = t >= 6.8; handle.scale.setScalar(Math.max(.001, eback(P(6.8, 7.0))));
    handle.rotation.z = -Math.PI/2*(eio(P(9.0, 9.12)) - eio(P(9.95, 10.0)));
    // 7 · beglazen (glas komt van binnen)
    gblocks.visible = t >= 7.05; gblocks.scale.setScalar(Math.max(.001, eback(P(7.05, 7.25))));
    var g7 = eio(P(7.2, 7.75));
    glass.visible = t >= 7.2; glass.position.set(0, 0.15*(1-g7), -1.0*(1-g7) - 0.35*ex);
    lat.forEach(function(m, i){ var a = 7.75 + i*0.05, p = eio(P(a, a + 0.2)); m.visible = t >= a; m.position.z = -SD/2 + 0.004 - 0.25*(1-p) - 0.55*ex; });
    gblocks.position.z = -0.2*ex;
    handle.position.z = -SD/2 - 0.006 - 0.15*ex;
    // 8 · afkitten en afwerken
    var kp = P(8.05, 8.45)*4;
    kits.forEach(function(k, i){ var v = cl(kp - i); k.visible = v > 0; k.scale.y = Math.max(.001, v); });
    kitG.visible = t >= 8.05; place(kitG, 0, 0, 0);
    var d8 = eio(P(8.55, 8.85)), v8 = eio(P(8.7, 9.0));
    dag.visible = t >= 8.55; place(dag, 0, 0, -0.4*(1-d8));
    vb.visible = t >= 8.7; place(vb, 0, 0, -0.5*(1-v8));
    // wand wegsnijden bij opengewerkt
    var o = 1 - 0.9*ex;
    cutaway.forEach(function(m){ m.material.forEach(function(mt){ mt.opacity = o; mt.depthWrite = o > .95; }); m.castShadow = o > .5; });
    roll.material.transparent = true; roll.material.opacity = o; roll.visible = o > .05;
    latei.visible = true;
  }

  /* ---------- camera ---------- */
  var KEYS = [ // t, hoek (0 = recht van buiten, PI = binnen), afstand, camera y, kijkpunt x,y,z
    [0.0, 0.5, 6.6, 0.9, 0, 0.05, -0.15],
    [0.9, 0.32, 5.2, 0.5, 0, 0.0, -0.1],
    [1.9, 0.62, 5.8, 0.7, 0, 0.0, -0.1],
    [2.8, 0.38, 4.0, 0.15, 0, -0.5, -0.1],
    [3.9, 0.58, 5.4, 0.6, 0, 0.0, -0.1],
    [4.9, 0.9, 4.0, 0.35, 0.15, 0.05, -0.1],
    [5.5, 2.35, 5.2, 0.6, 0, 0.0, -0.2],
    [6.9, 3.6, 5.4, 0.55, 0, 0.0, -0.2],
    [7.9, 2.6, 4.6, 0.4, 0, 0.0, -0.2],
    [8.4, 0.55, 4.8, 0.3, 0, -0.1, -0.1],
    [8.95, 2.5, 5.2, 0.35, 0, -0.25, -0.2],
    [9.6, 0.4, 6.2, 0.8, 0, 0.05, -0.15],
    [10.0, 0.62, 6.6, 0.95, 0, 0.05, -0.15]
  ];
  var EXK = [0, 1.0, 7.4, 2.1, 0, -0.1, -0.35]; // opengewerkte weergave
  var user = {yaw:0, pitch:0, zoom:1, tyaw:0, tpitch:0, tzoom:1};
  var look = new T.Vector3();
  function lerpAng(a, b, k){ return a + (b - a)*k; }
  function camKey(t){
    for(var i=0;i<KEYS.length-1;i++){
      var a = KEYS[i], b = KEYS[i+1];
      if(t <= b[0]){ var k = ss(cl((t - a[0])/(b[0] - a[0]))); return a.map(function(v, j){ return j === 0 ? t : lerpAng(v, b[j], k); }); }
    }
    return KEYS[KEYS.length-1].slice();
  }
  var narrow = false, idle = 0;
  function placeCam(t, dt){
    user.yaw += (user.tyaw - user.yaw)*0.12; user.pitch += (user.tpitch - user.pitch)*0.12; user.zoom += (user.tzoom - user.zoom)*0.12;
    var k = camKey(t), e = ss(ex);
    var c = k.map(function(v, j){ return j === 0 ? v : v + (EXK[j] - v)*e; });
    var ang = c[1] + user.yaw + 0.05*Math.sin(clock*0.25)*(1 - e);
    var dist = c[2]*user.zoom*(narrow ? (W/H < 1 ? 1.5 : 1.15) : 1);
    var py = c[3] + user.pitch;
    cam.position.set(Math.sin(ang)*dist + c[4], py, Math.cos(ang)*dist + c[6]);
    look.set(c[4], c[5], c[6]);
    cam.lookAt(look); cam.updateMatrixWorld();
  }

  /* ---------- labels ---------- */
  var LABELED = [oldFrame, oldSash, epdm, blocks, frame, compri, screws[1], pur, sashPivot, kitG, dag, vb];
  var WALLTAGS = [ {n:'Buitenblad (baksteen)', p:V(1.3, 1.1, -0.05)}, {n:'Spouwisolatie', p:V(1.3, 0.85, -0.16)}, {n:'Binnenblad (kalkzandsteen)', p:V(1.3, 0.6, -0.27)}, {n:'Stalen latei', p:V(0.7, OH/2 + 0.02, -0.05)}, {n:'Raamdorpelsteen', p:V(0.65, -OH/2 - 0.03, 0.05)} ];
  var FOCUS = [ [], [oldFrame, oldSash], [epdm], [blocks, frame, compri], [screws[1]], [pur, compri], [sashPivot], [], [kitG, vb, dag], [] ];
  var tagEls = [];
  function mkTag(txt){ txt = (opts.labels && opts.labels[txt]) || txt; var el = document.createElement('div'); el.className = 'tag'; el.innerHTML = '<i></i><em></em><span>' + txt + '</span>'; opts.tags.appendChild(el); tagEls.push(el); return el; }
  LABELED.forEach(function(o){ o.userData.tag = mkTag(o.userData.name); });
  WALLTAGS.forEach(function(w){ w.el = mkTag(w.n); });
  var glassTag = mkTag('HR++ isolatieglas'), lattenTag = mkTag('Glaslatten'), dimTags = [mkTag('1200 mm'), mkTag('1500 mm'), mkTag('Diagonalen 1921 mm')];
  var pv = new T.Vector3();
  function putTag(el, wp, show){
    el.classList.toggle('show', show); if(!show) return;
    pv.copy(wp).project(cam); if(pv.z > 1){ el.classList.remove('show'); return; }
    var x = (pv.x*.5 + .5)*W, y = (-pv.y*.5 + .5)*H, left = x > W*0.62;
    el.classList.toggle('left', left);
    el.style.transform = left ? 'translate(calc(' + (x + 5) + 'px - 100%),' + (y - 14) + 'px)' : 'translate(' + (x - 5) + 'px,' + (y - 14) + 'px)';
  }
  function chapterOf(t){ return Math.min(CH - 1, Math.floor(t)); }
  function placeTags(t){
    var ch = chapterOf(t), within = t - ch, exOn = ex > .6;
    LABELED.forEach(function(o){
      var show = o.visible && (exOn || (within > .55 && FOCUS[ch].indexOf(o) > -1));
      if(o === screws[1]) show = show && screws[1].visible;
      putTag(o.userData.tag, o.localToWorld(tmp.copy(o.userData.anchor)), show);
    });
    WALLTAGS.forEach(function(w){ putTag(w.el, w.p, exOn && !narrow); });
    putTag(glassTag, glass.localToWorld(tmp.set(-0.2, 0.3, 0)), glass.visible && (exOn || (ch === 7 && within > .7)));
    putTag(lattenTag, lat[3].localToWorld(tmp.set(0, -0.3, 0)), lat[3].visible && (exOn || (ch === 7 && within > .85)));
    var dimOn = laser.visible && !exOn;
    putTag(dimTags[0], tmp.set(-0.05, -0.2, 0.05), dimOn && t > 0.5);
    putTag(dimTags[1], tmp.set(0.3, 0.35, 0.05), dimOn && t > 0.7);
    putTag(dimTags[2], tmp.set(-0.25, 0.3, 0.05), dimOn && t > 0.88);
  }

  /* ---------- interactie ---------- */
  var drag = null;
  host.addEventListener('pointerdown', function(e){ if(e.target.closest('button')) return; drag = {x:e.clientX, y:e.clientY, yaw:user.tyaw, pitch:user.tpitch}; host.setPointerCapture(e.pointerId); host.classList.add('grabbing'); idle = 0; if(opts.onInteract) opts.onInteract(); });
  host.addEventListener('pointermove', function(e){ if(!drag) return; user.tyaw = drag.yaw - (e.clientX - drag.x)*0.008; user.tpitch = Math.max(-1.4, Math.min(2.2, drag.pitch + (e.clientY - drag.y)*0.006)); });
  function endDrag(){ drag = null; host.classList.remove('grabbing'); }
  host.addEventListener('pointerup', endDrag); host.addEventListener('pointercancel', endDrag);

  /* ---------- render & afspelen ---------- */
  var W = 0, H = 0;
  function resize(){ W = host.clientWidth; H = host.clientHeight; if(!W || !H) return; narrow = W < 640; renderer.setSize(W, H, false); cam.aspect = W/H; cam.updateProjectionMatrix(); }
  resize();
  var ro = null;
  if('ResizeObserver' in window){ ro = new ResizeObserver(function(){ resize(); if(!running) draw(0); }); ro.observe(host); }

  var t = opts.reduce ? 10 : 10, playing = !opts.reduce, running = false, raf = 0, last = 0, clock = 0, hold = 0, target = null, speed = 1/4.2;
  var lastCh = -1;
  function emit(){ var ch = chapterOf(t); if(opts.onFrame) opts.onFrame(ch, t - ch, t); if(ch !== lastCh){ lastCh = ch; if(opts.onChapter) opts.onChapter(ch); } }
  function draw(dt){
    ex += (exTarget - ex)*Math.min(1, dt*5 || 1);
    if(Math.abs(exTarget - ex) < .001) ex = exTarget;
    apply(t); placeCam(t, dt); placeTags(t);
    renderer.render(scene, cam);
  }
  function loop(now){
    raf = requestAnimationFrame(loop);
    var dt = last ? Math.min(0.05, (now - last)/1000) : 0.016; last = now; clock += dt;
    if(target !== null){
      var d = target - t, step = Math.max(Math.abs(d)*dt*3.2, dt*1.2);
      if(Math.abs(d) <= step){ t = target; target = null; } else t += Math.sign(d)*step;
    } else if(playing && ex < .02){
      if(t >= CH){ hold += dt; if(hold > 3.5){ hold = 0; t = 0; } }
      else t = Math.min(CH, t + dt*speed);
    }
    emit(); draw(dt);
  }
  var api = {
    start: function(){ if(running) return; running = true; last = 0; raf = requestAnimationFrame(loop); },
    stop: function(){ running = false; cancelAnimationFrame(raf); },
    play: function(){ playing = true; if(t >= CH){ t = 0; } emit(); },
    pause: function(){ playing = false; emit(); },
    isPlaying: function(){ return playing; },
    go: function(ch){ exTarget = 0; target = null; t = ch; playing = true; hold = 0; emit(); if(!running) draw(0); },
    voorNa: function(which){ playing = false; exTarget = 0; target = which === 'voor' ? 0.05 : CH; emit(); },
    explode: function(on){ exTarget = on ? 1 : 0; if(on) playing = false; if(!running) draw(0.2); },
    isExploded: function(){ return exTarget > .5; },
    zoom: function(f){ user.tzoom = Math.max(.55, Math.min(1.6, user.tzoom*f)); },
    reset: function(){ user.tyaw = 0; user.tpitch = 0; user.tzoom = 1; },
    time: function(){ return t; },
    destroy: function(){ running = false; cancelAnimationFrame(raf); if(ro) ro.disconnect(); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss(); if(cv.parentNode) cv.parentNode.removeChild(cv); opts.tags.innerHTML = ''; },
    seek: function(x, e){ t = x; playing = false; target = null; if(e !== undefined){ ex = exTarget = e; } emit(); draw(0); }
  };
  emit(); draw(0.016);
  if(opts.onReady) opts.onReady();
  return api;
}
