
// Fixed architectural bays: narrow joints, medium subdivisions, and wider spans.
const verticalLines = [72, 116, 244, 316, 352, 526, 614, 660, 846, 938, 976, 1152, 1234, 1370];
const horizontalLines = [46, 86, 188, 252, 284, 422, 498, 536, 672, 742, 778, 864];

const gridMask = `
  radial-gradient(
    ellipse 65% 75% at 50% 34%,
    black 0%,
    rgba(0,0,0,0.9) 30%,
    rgba(0,0,0,0.5) 60%,
    transparent 100%
  ),
  linear-gradient(
    to bottom,
    black 68%,
    rgba(0,0,0,0.82) 76%,
    rgba(0,0,0,0.48) 85%,
    rgba(0,0,0,0.15) 93%,
    transparent 100%
  )
`;

export function HeroBackground() {
  return (
    <div
      className="swiss-hero-background"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.15,

          WebkitMaskImage: gridMask,
          WebkitMaskComposite: "source-in",
          maskImage: gridMask,
          maskComposite: "intersect",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1"
          shapeRendering="crispEdges"
          aria-hidden="true"
          focusable="false"
        >
          {verticalLines.map((x) => (
            <line key={`vertical-${x}`} x1={x} y1="0" x2={x} y2="900" vectorEffect="non-scaling-stroke" />
          ))}
          {horizontalLines.map((y) => (
            <line key={`horizontal-${y}`} x1="0" y1={y} x2="1440" y2={y} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>
    </div>
  );
}
