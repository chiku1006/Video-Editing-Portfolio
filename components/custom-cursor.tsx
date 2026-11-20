"use client";

import { useEffect, useRef } from "react";

const pointerQuery =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const nativeTargets =
  "p,h1,h2,h3,h4,dd,dt,address,input,textarea,select,[contenteditable],dialog[open]";

type Surface = { element: HTMLElement; box: DOMRect };
type SurfaceKind = "magnet" | "depth" | "scene";

function clearSurface(surface: Surface | null, kind: SurfaceKind) {
  if (!surface) return;
  surface.element.style.removeProperty("--" + kind + "-x");
  surface.element.style.removeProperty("--" + kind + "-y");
}

export function CustomCursor() {
  const node = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = node.current;
    const label = word.current;
    if (!cursor || !label) return;
    const root = document.documentElement;
    const preference = window.matchMedia(pointerQuery);
    let magnet: Surface | null = null;
    let depth: Surface | null = null;
    let scene: Surface | null = null;
    let nextX = 0;
    let nextY = 0;
    let x = 0;
    let y = 0;
    let visible = false;
    let frame = 0;
    let moved = false;

    function selectSurface(
      previous: Surface | null,
      element: HTMLElement | null,
      kind: SurfaceKind,
    ) {
      if (previous?.element === element) return previous;
      clearSurface(previous, kind);
      return element ? { element, box: element.getBoundingClientRect() } : null;
    }

    function setSurface(surface: Surface | null, kind: SurfaceKind) {
      if (!surface) return;
      const { element, box } = surface;
      const px = Math.max(
        -1,
        Math.min(1, ((nextX - box.left) / Math.max(box.width, 1)) * 2 - 1),
      );
      const py = Math.max(
        -1,
        Math.min(1, ((nextY - box.top) / Math.max(box.height, 1)) * 2 - 1),
      );
      element.style.setProperty("--" + kind + "-x", String(px));
      element.style.setProperty("--" + kind + "-y", String(py));
    }

    function draw() {
      frame = 0;
      if (moved) {
        moved = false;
        setSurface(magnet, "magnet");
        setSurface(depth, "depth");
        setSurface(scene, "scene");
      }
      if (!visible) return;
      const dx = nextX - x;
      const dy = nextY - y;
      const damping = Math.min(0.78, 0.48 + Math.hypot(dx, dy) * 0.0012);
      x += dx * damping;
      y += dy * damping;
      cursor!.style.transform =
        "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0)";
      if (Math.abs(dx) + Math.abs(dy) > 0.25)
        frame = requestAnimationFrame(draw);
    }

    function reset() {
      clearSurface(magnet, "magnet");
      clearSurface(depth, "depth");
      clearSurface(scene, "scene");
      magnet = depth = scene = null;
      visible = moved = false;
      cancelAnimationFrame(frame);
      frame = 0;
      root.classList.remove("custom-cursor-active");
      cursor!.removeAttribute("data-visible");
    }

    function move(event: PointerEvent) {
      if (
        !preference.matches ||
        event.pointerType !== "mouse" ||
        !(event.target instanceof Element)
      )
        return;
      const target = event.target;
      const action = target.closest<HTMLElement>("a,button,[data-cursor]");
      const native = target.closest(
        "dialog[open],input,textarea,select,[contenteditable]",
      );
      const useNative = Boolean(
        native || (!action && target.closest(nativeTargets)),
      );
      const showCursor = !useNative && event.buttons === 0;
      if (native || event.buttons) {
        reset();
        return;
      }
      magnet = selectSurface(
        magnet,
        action?.closest<HTMLElement>("[data-magnetic]") ?? null,
        "magnet",
      );
      depth = selectSurface(
        depth,
        target.closest<HTMLElement>("[data-depth]"),
        "depth",
      );
      scene = selectSurface(
        scene,
        target.closest<HTMLElement>("[data-scene]"),
        "scene",
      );
      nextX = event.clientX;
      nextY = event.clientY;
      moved = true;
      if (showCursor !== visible) {
        visible = showCursor;
        root.classList.toggle("custom-cursor-active", showCursor);
        cursor!.toggleAttribute("data-visible", showCursor);
        if (showCursor) {
          x = nextX;
          y = nextY;
        }
      }
      if (showCursor) {
        const state = action?.dataset.cursor ?? (action ? "link" : "dot");
        cursor!.dataset.state = state;
        const nextLabel = state === "PLAY" || state === "DRAG" ? state : "";
        if (label!.textContent !== nextLabel) label!.textContent = nextLabel;
      }
      if (!frame) frame = requestAnimationFrame(draw);
    }

    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) reset();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Tab") reset();
    };
    const clearBounds = () => {
      if (magnet) magnet.box = magnet.element.getBoundingClientRect();
      if (depth) depth.box = depth.element.getBoundingClientRect();
      if (scene) scene.box = scene.element.getBoundingClientRect();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("pointerdown", reset, { passive: true });
    window.addEventListener("scroll", clearBounds, { passive: true });
    window.addEventListener("resize", clearBounds);
    window.addEventListener("blur", reset);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", reset);
    preference.addEventListener("change", reset);
    return () => {
      reset();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("pointerdown", reset);
      window.removeEventListener("scroll", clearBounds);
      window.removeEventListener("resize", clearBounds);
      window.removeEventListener("blur", reset);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", reset);
      preference.removeEventListener("change", reset);
    };
  }, []);

  return (
    <div className="studio-cursor" ref={node} aria-hidden="true">
      <span className="studio-cursor-core">
        <span ref={word} />
      </span>
    </div>
  );
}
