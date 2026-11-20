/* Adapted from dev-sufyaan/Portfolio-Pitch-Black-Swiss (MIT).
 * Copyright (c) 2025 Sufyaan (dev-sufyaan). See licenses/pitch-black-swiss-MIT.txt. */
"use client";

export function NoiseOverlay() {
  return (
    <div
      className="noise-overlay pointer-events-none absolute inset-0 z-[9999]"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}
