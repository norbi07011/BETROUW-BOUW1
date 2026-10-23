import { useEffect, useRef } from 'react';
import { reducedMotion, isMobile, scrollState } from './core';

/* ──────────────────────────  WebGL animated smoke shader  ──────────────────────────
 * Full-screen domain-warped fbm noise tinted in Betrouw gold. Rendered at a
 * fraction of the screen resolution (smoke is soft anyway) and paused when
 * the tab is hidden. Reacts to the cursor (warm glow) and to scrolling. */

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uBoost;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}
  return v;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  vec2 p=vec2((uv.x-.5)*asp,uv.y-.5);
  float t=uTime*.055;
  vec2 m=vec2((uMouse.x-.5)*asp,uMouse.y-.5);
  p.y-=uScroll*.25;
  vec2 q=vec2(fbm(p*1.5+vec2(0.,t)),fbm(p*1.5+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(p*1.7+3.*q+vec2(1.7,9.2)+t*1.3),fbm(p*1.7+3.*q+vec2(8.3,2.8)-t*.9));
  float f=fbm(p*1.3+3.4*r+(m-p)*.15);
  float md=length(vec2(uv.x*asp,uv.y)-vec2(uMouse.x*asp,uMouse.y));
  float glow=exp(-md*md*4.5);
  vec3 col=mix(vec3(.0),vec3(.16,.09,.02),clamp(f*f*2.2,0.,1.));
  col=mix(col,vec3(.52,.32,.05),clamp(length(q)*f*.55,0.,1.)*.5);
  col+=vec3(.95,.58,.12)*glow*f*(.32+uBoost*.25);
  col*=.75+.35*smoothstep(1.2,.0,length(uv-vec2(.5,.75)));
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.03;
  gl_FragColor=vec4(col,1.);
}`;

export function SmokeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uMouse = gl.getUniformLocation(prog, 'uMouse');
    const uScroll = gl.getUniformLocation(prog, 'uScroll');
    const uBoost = gl.getUniformLocation(prog, 'uBoost');

    const scale = isMobile() ? 0.3 : 0.45;
    const resize = () => {
      canvas.width = Math.max(1, Math.floor(window.innerWidth * scale));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    let boost = 0;
    const start = performance.now();
    const frame = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      boost += (Math.min(1, Math.abs(scrollState.velocity) / 40) - boost) * 0.08;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, scrollState.progress);
      gl.uniform1f(uBoost, boost);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    if (reducedMotion()) frame(start + 4000);
    else raf = requestAnimationFrame(frame);

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reducedMotion()) raf = requestAnimationFrame(frame);
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none"
      style={{ viewTransitionName: 'smoke' } as React.CSSProperties}
    />
  );
}

/* ──────────────────────────  Volumetric spotlights  ────────────────────────── */

export function Spotlights({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <div className="bb-beam bb-beam-1" />
      <div className="bb-beam bb-beam-2" />
      <div className="bb-beam bb-beam-3" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}

/* ──────────────────────────  Dust particles in the light  ────────────────────────── */

export function Dust({ count = 90, className = '' }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const n = isMobile() ? Math.round(count * 0.5) : count;
    const ps = Array.from({ length: n }, () => ({
      x: Math.random(), y: Math.random(), z: Math.random(),
      vx: (Math.random() - 0.5) * 0.00025, vy: -0.0001 - Math.random() * 0.00035,
      ph: Math.random() * Math.PI * 2,
    }));
    let raf = 0;
    const loop = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const vel = scrollState.velocity * 0.00004;
      for (const p of ps) {
        p.x += p.vx + Math.sin(now / 2000 + p.ph) * 0.00015;
        p.y += p.vy - vel;
        if (p.y < -0.02) p.y = 1.02;
        if (p.y > 1.02) p.y = -0.02;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        const tw = 0.5 + 0.5 * Math.sin(now / 600 + p.ph * 3);
        const r = 0.6 + p.z * 1.8;
        ctx.globalAlpha = (0.15 + p.z * 0.55) * tw;
        ctx.fillStyle = p.z > 0.7 ? '#fde68a' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    if (!reducedMotion()) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [count]);
  return <canvas ref={ref} aria-hidden="true" className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} />;
}
