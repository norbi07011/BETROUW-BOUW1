import type { CSSProperties, ReactNode } from 'react';

/* A window frame (kozijn) built entirely with CSS 3D transforms.
 * Every profile is a real cuboid (6 faces) so the frame keeps its depth
 * when the scene rotates. Layers can be toggled via CSS variables:
 *   --bb-glass   (0..1) glass opacity
 *   --bb-measure (0..1) measuring lines overlay
 *   --bb-solid   (0..1) frame material (0 = wireframe, 1 = finished)
 *   --bb-shine   (0..1) light sweep over the glass                         */

type CuboidProps = { w: number; h: number; d: number; x?: number; y?: number; z?: number; face?: string };

export function Cuboid({ w, h, d, x = 0, y = 0, z = 0, face = 'bb-face' }: CuboidProps) {
  const base: CSSProperties = { position: 'absolute', left: 0, top: 0, backfaceVisibility: 'visible' };
  return (
    <div
      style={{
        position: 'absolute', left: '50%', top: '50%', width: 0, height: 0,
        transformStyle: 'preserve-3d', transform: `translate3d(${x}px, ${y}px, ${z}px)`,
      }}
    >
      <div className={`${face} ${face}-front`} style={{ ...base, width: w, height: h, transform: `translate(${-w / 2}px, ${-h / 2}px) translateZ(${d / 2}px)` }} />
      <div className={`${face} ${face}-back`} style={{ ...base, width: w, height: h, transform: `translate(${-w / 2}px, ${-h / 2}px) rotateY(180deg) translateZ(${d / 2}px)` }} />
      <div className={`${face} ${face}-side`} style={{ ...base, width: d, height: h, transform: `translate(${-d / 2}px, ${-h / 2}px) rotateY(90deg) translateZ(${w / 2}px)` }} />
      <div className={`${face} ${face}-side`} style={{ ...base, width: d, height: h, transform: `translate(${-d / 2}px, ${-h / 2}px) rotateY(-90deg) translateZ(${w / 2}px)` }} />
      <div className={`${face} ${face}-top`} style={{ ...base, width: w, height: d, transform: `translate(${-w / 2}px, ${-d / 2}px) rotateX(90deg) translateZ(${h / 2}px)` }} />
      <div className={`${face} ${face}-top`} style={{ ...base, width: w, height: d, transform: `translate(${-w / 2}px, ${-d / 2}px) rotateX(-90deg) translateZ(${h / 2}px)` }} />
    </div>
  );
}

type WindowProps = {
  width?: number;
  height?: number;
  profile?: number; // frame profile thickness
  depth?: number;
  mullion?: 'cross' | 'vertical' | 'none';
  className?: string;
  style?: CSSProperties;
  view?: ReactNode; // what you see through the glass
  showMeasure?: boolean;
};

export function Window3D({
  width = 300, height = 400, profile = 22, depth = 70, mullion = 'cross',
  className = '', style, view, showMeasure = true,
}: WindowProps) {
  const W = width, H = height, t = profile, D = depth;
  const innerW = W - t * 2, innerH = H - t * 2;
  const transomY = -H / 2 + t + innerH * 0.36; // upper light (bovenlicht)
  return (
    <div
      className={`relative ${className}`}
      style={{ width: W, height: H, transformStyle: 'preserve-3d', ...style }}
    >
      {/* view behind the glass */}
      {view && (
        <div
          className="absolute overflow-hidden"
          style={{ left: t, top: t, width: innerW, height: innerH, transform: `translateZ(${-D * 0.15}px)` }}
        >
          {view}
        </div>
      )}

      {/* glass pane */}
      <div
        className="bb-glass absolute"
        style={{ left: t, top: t, width: innerW, height: innerH, transform: 'translateZ(0px)' }}
      >
        <div className="bb-glass-shine" />
      </div>

      {/* outer frame – 4 profiles */}
      <Cuboid w={W} h={t} d={D} y={-H / 2 + t / 2} />
      <Cuboid w={W} h={t} d={D} y={H / 2 - t / 2} />
      <Cuboid w={t} h={H - t * 2} d={D} x={-W / 2 + t / 2} />
      <Cuboid w={t} h={H - t * 2} d={D} x={W / 2 - t / 2} />

      {/* window sill (vensterbank) */}
      <Cuboid w={W + 40} h={10} d={D + 40} y={H / 2 + 5} z={10} face="bb-sill" />

      {/* mullions / transom */}
      {mullion !== 'none' && (
        <Cuboid w={t * 0.8} h={innerH} d={D * 0.8} x={0} />
      )}
      {mullion === 'cross' && (
        <Cuboid w={innerW} h={t * 0.8} d={D * 0.8} y={transomY} />
      )}

      {/* handle */}
      <Cuboid w={6} h={36} d={10} x={t * 0.4 + 12} y={H * 0.12} z={D / 2 + 8} face="bb-handle" />

      {/* measuring lines (inmeten) */}
      {showMeasure && (
        <div className="bb-measure absolute inset-0 pointer-events-none" style={{ transform: `translateZ(${D / 2 + 30}px)` }}>
          <div className="absolute left-0 right-0 -top-10 flex items-center">
            <span className="h-3 w-px bg-amber-400" />
            <span className="flex-1 h-px bg-amber-400/80" />
            <span className="px-2 text-[11px] font-mono text-amber-300 bg-black/70 rounded">{Math.round(W * 4)} mm</span>
            <span className="flex-1 h-px bg-amber-400/80" />
            <span className="h-3 w-px bg-amber-400" />
          </div>
          <div className="absolute top-0 bottom-0 -right-12 flex flex-col items-center">
            <span className="w-3 h-px bg-amber-400" />
            <span className="flex-1 w-px bg-amber-400/80" />
            <span className="py-2 text-[11px] font-mono text-amber-300 bg-black/70 rounded [writing-mode:vertical-rl]">{Math.round(H * 4)} mm</span>
            <span className="flex-1 w-px bg-amber-400/80" />
            <span className="w-3 h-px bg-amber-400" />
          </div>
          {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cy], i) => (
            <span
              key={i}
              className="absolute w-5 h-5 border-amber-400"
              style={{
                left: cx ? undefined : -10, right: cx ? -10 : undefined,
                top: cy ? undefined : -10, bottom: cy ? -10 : undefined,
                borderLeftWidth: cx ? 0 : 2, borderRightWidth: cx ? 2 : 0,
                borderTopWidth: cy ? 0 : 2, borderBottomWidth: cy ? 2 : 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
