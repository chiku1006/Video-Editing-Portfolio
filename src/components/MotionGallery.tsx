"use client";

import Image from "next/image";
import { Play, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import type { GalleryMedia } from "@/src/data/projects";
import { VideoPlayer } from "./VideoPlayer";
import { formatTime, setGalleryPlaying } from "./work-media";
import "./motion-gallery.css";

const hoverQuery =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

export type GalleryItem = GalleryMedia & {
  videoAvailable: boolean;
  posterAvailable: boolean;
  duration?: number;
};

function MotionDialog({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => {
      if (element?.open) element.close();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="motion-dialog"
      aria-labelledby={titleId}
      onClose={(event) => {
        if (!event.currentTarget.open) {
          event.currentTarget.querySelector("video")?.pause();
          onClose();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="motion-dialog-panel" ref={panel}>
        <header className="motion-dialog-header">
          <h2 id={titleId}>{item.title}</h2>
          <button
            type="button"
            className="work-controlButton"
            aria-label="Close video"
            onClick={() => dialog.current?.close()}
            autoFocus
          >
            <X size={21} aria-hidden="true" />
          </button>
        </header>
        <VideoPlayer
          title={item.title}
          videoSrc={item.videoSrc}
          videoAvailable={item.videoAvailable}
          fullscreenTarget={panel}
        />
      </div>
    </dialog>
  );
}

function MotionCard({
  id,
  item,
  sizes,
  featured = false,
  onPreview,
  onStop,
  onOpen,
  onPlaying,
  onError,
}: {
  id: string;
  item: GalleryItem;
  sizes?: string;
  featured?: boolean;
  onPreview: (event: PointerEvent<HTMLButtonElement>, src: string) => void;
  onStop: () => void;
  onOpen: (button: HTMLButtonElement, item: GalleryItem) => void;
  onPlaying: (video: HTMLVideoElement) => void;
  onError: (video: HTMLVideoElement) => void;
}) {
  return (
    <article
      id={id}
      className={featured ? "motion-tile motion-tile-featured" : "motion-tile"}
      data-scroll-reveal
    >
      <button
        type="button"
        className="motion-card"
        data-no-poster={!item.posterAvailable || undefined}
        data-depth=""
        data-cursor={item.videoAvailable ? "PLAY" : undefined}
        aria-label={
          item.videoAvailable
            ? `Play ${item.title}`
            : `${item.title} — video unavailable`
        }
        aria-haspopup={item.videoAvailable ? "dialog" : undefined}
        disabled={!item.videoAvailable}
        onPointerEnter={(event) => onPreview(event, item.videoSrc)}
        onPointerLeave={onStop}
        onPointerCancel={onStop}
        onClick={(event) => onOpen(event.currentTarget, item)}
      >
        {item.posterAvailable && (
          <Image
            className="motion-poster"
            src={item.posterSrc}
            alt={item.posterAlt}
            sizes={
              sizes ??
              (featured
                ? "(max-width: 640px) 100vw, 1280px"
                : "(max-width: 640px) 100vw, 55vw")
            }
            fill
            preload={featured}
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
          />
        )}
        {item.videoAvailable && (
          <video
            className="motion-preview"
            preload="none"
            muted
            loop
            playsInline
            aria-hidden="true"
            onPlaying={(event) => onPlaying(event.currentTarget)}
            onError={(event) => onError(event.currentTarget)}
          />
        )}
        {featured && <span className="motion-badge">★ FEATURED SHOWREEL</span>}
        {item.videoAvailable && (
          <span className="motion-play" aria-hidden="true">
            <Play
              size={featured ? 24 : 17}
              fill="currentColor"
              strokeWidth={0}
            />
          </span>
        )}
        <span className="motion-caption">
          <span>
            <span className="motion-label">
              {featured ? "Showreel" : "Motion Graphics"}
            </span>
            <span className="motion-title">{item.title}</span>
          </span>
          {featured && item.duration !== undefined && (
            <span className="motion-duration">{formatTime(item.duration)}</span>
          )}
          {!item.videoAvailable && (
            <span className="motion-duration">Unavailable</span>
          )}
        </span>
      </button>
    </article>
  );
}

export function MotionGallery({
  showreel,
  projects,
  variant,
}: {
  showreel?: GalleryItem;
  projects: readonly GalleryItem[];
  variant?: "hero" | "portrait";
}) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const modalOpen = useRef(false);
  const preview = useRef<HTMLVideoElement | null>(null);
  const previewTimer = useRef<number | undefined>(undefined);

  const stopPreview = useCallback(() => {
    window.clearTimeout(previewTimer.current);
    previewTimer.current = undefined;
    const clip = preview.current;
    preview.current = null;
    if (clip) {
      clip.removeAttribute("data-playing");
      clip.pause();
      if (clip.readyState > 0) clip.currentTime = 0;
      if (clip.hasAttribute("src")) {
        clip.removeAttribute("src");
        clip.load();
      }
    }
    if (!modalOpen.current) setGalleryPlaying(false);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia(hoverQuery);
    const onPreferenceChange = () => {
      if (!preference.matches) stopPreview();
    };
    const onVisibilityChange = () => {
      if (document.hidden) stopPreview();
    };
    preference.addEventListener("change", onPreferenceChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      preference.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      modalOpen.current = false;
      stopPreview();
    };
  }, [stopPreview]);

  function startPreview(event: PointerEvent<HTMLButtonElement>, src: string) {
    if (
      modalOpen.current ||
      event.pointerType !== "mouse" ||
      !window.matchMedia(hoverQuery).matches
    )
      return;
    const clip = event.currentTarget.querySelector("video");
    if (!clip || preview.current === clip) return;
    stopPreview();
    preview.current = clip;
    const timer = window.setTimeout(() => {
      if (document.hidden || preview.current !== clip) return;
      setGalleryPlaying(true);
      clip.muted = true;
      clip.src = src;
      void clip.play().catch(() => {
        if (previewTimer.current === timer) stopPreview();
      });
    }, 140);
    previewTimer.current = timer;
  }

  const cardHandlers = {
    onPreview: startPreview,
    onStop: stopPreview,
    onOpen: (button: HTMLButtonElement, item: GalleryItem) => {
      opener.current = button;
      modalOpen.current = true;
      stopPreview();
      setGalleryPlaying(true);
      setSelected(item);
    },
    onPlaying: (video: HTMLVideoElement) => {
      if (preview.current === video) video.setAttribute("data-playing", "");
    },
    onError: (video: HTMLVideoElement) => {
      if (preview.current === video) stopPreview();
    },
  };

  const rows = (
    <div
      className={
        variant === "portrait"
          ? "motion-portrait-grid"
          : showreel
            ? "motion-rows"
            : "motion-rows featured-grid"
      }
    >
      {Array.from({ length: Math.ceil(projects.length / 2) }, (_, row) => (
        <div className="motion-row" key={row}>
          {projects.slice(row * 2, row * 2 + 2).map((item) => (
            <div className="motion-cell" key={item.id}>
              <MotionCard
                id={
                  showreel || variant === "portrait"
                    ? item.id
                    : `featured-${item.id}`
                }
                item={item}
                sizes={
                  variant === "portrait"
                    ? "(max-width: 400px) 90vw, 350px"
                    : undefined
                }
                {...cardHandlers}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={
        variant ? `motion-gallery motion-gallery-${variant}` : "motion-gallery"
      }
    >
      {showreel && variant === "hero" ? (
        <MotionCard
          id={`hero-${showreel.id}`}
          item={showreel}
          sizes="(max-width: 660px) 95vw, (max-width: 900px) 56vw, 60vw"
          featured
          {...cardHandlers}
        />
      ) : showreel ? (
        <>
          <MotionCard
            id={showreel.id}
            item={showreel}
            featured
            {...cardHandlers}
          />
          <section className="motion-projects" aria-labelledby="category-0">
            <header className="work-categoryHeader">
              <span className="work-categoryIndex" aria-hidden="true">
                01
              </span>
              <h2 id="category-0">Motion Graphics</h2>
              <span className="work-categoryCount">
                {String(projects.length).padStart(2, "0")} PROJECTS
              </span>
            </header>
            {rows}
          </section>
        </>
      ) : (
        rows
      )}
      {selected && (
        <MotionDialog
          item={selected}
          onClose={() => {
            modalOpen.current = false;
            setSelected(null);
            setGalleryPlaying(false);
            opener.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </div>
  );
}
