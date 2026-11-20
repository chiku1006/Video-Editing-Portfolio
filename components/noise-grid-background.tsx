/* Adapted from dev-sufyaan/Portfolio-Pitch-Black-Swiss (MIT).
 * Copyright (c) 2025 Sufyaan (dev-sufyaan). See licenses/pitch-black-swiss-MIT.txt. */
"use client";

import { memo } from "react";

export const NoiseGridBackground = memo(function NoiseGridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base grid pattern */}
      <div className="absolute inset-0 hero-grid-pattern" />

      {/* Animated grid lines overlay */}
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full opacity-100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid pattern */}
            <pattern
              id="smallGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="largeGrid"
              width="200"
              height="200"
              patternUnits="userSpaceOnUse"
            >
              <rect width="200" height="200" fill="url(#smallGrid)" />
              <path
                d="M 200 0 L 0 0 0 200"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            </pattern>

            {/* Glow filter for accent lines */}
            <filter id="gridGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Main grid */}
          <rect width="100%" height="100%" fill="url(#largeGrid)" />

          {/* Accent horizontal lines with glow */}
          <g filter="url(#gridGlow)" className="animate-grid-pulse">
            <line
              x1="0"
              y1="25%"
              x2="100%"
              y2="25%"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="75%"
              x2="100%"
              y2="75%"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          </g>

          {/* Accent vertical lines with glow */}
          <g filter="url(#gridGlow)" className="animate-grid-pulse-delayed">
            <line
              x1="25%"
              y1="0"
              x2="25%"
              y2="100%"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
            <line
              x1="75%"
              y1="0"
              x2="75%"
              y2="100%"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          </g>

          {/* Grid intersection highlights */}
          <g className="animate-grid-intersect">
            <circle cx="25%" cy="25%" r="3" fill="rgba(255,255,255,0.1)" />
            <circle cx="75%" cy="25%" r="2" fill="rgba(255,255,255,0.08)" />
            <circle cx="25%" cy="75%" r="2" fill="rgba(255,255,255,0.08)" />
            <circle cx="75%" cy="75%" r="3" fill="rgba(255,255,255,0.1)" />
            <circle cx="50%" cy="50%" r="4" fill="rgba(255,255,255,0.06)" />
          </g>
        </svg>
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='256' height='256' viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Secondary film grain noise */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none animate-noise"
        style={{
          backgroundImage: "url(/textures/seamless-grain.svg)",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Subtle gradient overlays for depth */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 50%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(255,255,255,0.02) 0%, transparent 50%)",
        }}
      />
    </div>
  );
});
