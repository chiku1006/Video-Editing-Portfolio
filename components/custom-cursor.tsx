"use client";

import { useEffect, useRef } from "react";

const pointerQuery =
  "(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)";
const nativeTargets =
  "input,textarea,select,[contenteditable]:not([contenteditable='false']),video[controls],iframe,dialog[open]";
const actionTargets = "a[href],button,[data-cursor]";

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
    if (!node.current || !word.current) return;
    const cursor = node.current;
    const label = word.current;
    const root = document.documentElement;
    const preference = window.matchMedia(pointerQuery);
    let magnet: Surface | null = null;
    let depth: Surface | null = null;
    let scene: Surface | null = null;
    let x = 0;
    let y = 0;
    let tracking = false;
    let visible = false;
    let frame = 0;
    let boundsChanged = false;

    function selectSurface(
      previous: Surface | null,
      element: HTMLElement | null,
      kind: SurfaceKind,
    ) {
      if (previous?.element === element) {
        if (boundsChanged) previous.box = element.getBoundingClientRect();
        return previous;
      }
      clearSurface(previous, kind);
      return element ? { element, box: element.getBoundingClientRect() } : null;
    }

    function setSurface(surface: Surface | null, kind: SurfaceKind) {
      if (!surface) return;
      const { element, box } = surface;
      const px = Math.max(
        -1,
        Math.min(1, ((x - box.left) / Math.max(box.width, 1)) * 2 - 1),
      );
      const py = Math.max(
        -1,
        Math.min(1, ((y - box.top) / Math.max(box.height, 1)) * 2 - 1),
      );
      element.style.setProperty("--" + kind + "-x", String(px));
      element.style.setProperty("--" + kind + "-y", String(py));
    }

    function setVisible(show: boolean) {
      if (visible === show) return;
      visible = show;
      root.classList.toggle("custom-cursor-active", show);
    }

    function hide() {
      clearSurface(magnet, "magnet");
      clearSurface(depth, "depth");
      clearSurface(scene, "scene");
      magnet = depth = scene = null;
      setVisible(false);
    }

    function reset() {
      hide();
      tracking = false;
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function draw() {
      frame = 0;
      // Scrolling and clicks can change what is under a stationary pointer.
      const target = document.elementFromPoint(x, y);
      if (
        !target ||
        target.closest(nativeTargets) ||
        document.fullscreenElement
      ) {
        hide();
        return;
      }
      const candidate = target.closest<HTMLElement>(actionTargets);
      const action = candidate?.matches(":disabled,[aria-disabled='true']")
        ? null
        : candidate;
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
      boundsChanged = false;
      setSurface(magnet, "magnet");
      setSurface(depth, "depth");
      setSurface(scene, "scene");

      const state = action?.dataset.cursor ?? (action ? "link" : "dot");
      if (cursor.dataset.state !== state) {
        cursor.dataset.state = state;
        if (state === "PLAY" || state === "DRAG") label.textContent = state;
      }
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      setVisible(true);
    }

    function scheduleDraw() {
      if (tracking && !frame) frame = requestAnimationFrame(draw);
    }

    function move(event: PointerEvent) {
      if (!preference.matches) return;
      if (event.pointerType !== "mouse" || event.buttons) {
        reset();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      tracking = true;
      scheduleDraw();
    }

    function down(event: PointerEvent) {
      if (event.pointerType !== "mouse") reset();
    }

    function refreshBounds() {
      boundsChanged = true;
      scheduleDraw();
    }

    const leave = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && !event.relatedTarget) reset();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Tab") reset();
    };
    const preferenceChanged = () => {
      if (!preference.matches) reset();
    };
    window.addEventListener("pointerover", move, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", move, { passive: true });
    window.addEventListener("pointerout", leave, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointercancel", reset, { passive: true });
    window.addEventListener("scroll", refreshBounds, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", refreshBounds);
    window.addEventListener("blur", reset);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", reset);
    preference.addEventListener("change", preferenceChanged);
    return () => {
      reset();
      window.removeEventListener("pointerover", move);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", move);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointercancel", reset);
      window.removeEventListener("scroll", refreshBounds, true);
      window.removeEventListener("resize", refreshBounds);
      window.removeEventListener("blur", reset);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", reset);
      preference.removeEventListener("change", preferenceChanged);
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
