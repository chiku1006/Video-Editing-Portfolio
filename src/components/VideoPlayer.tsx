"use client";

import { Maximize, Minimize } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import {
  formatTime,
  galleryPlaybackChange,
  isGalleryPlaying,
} from "./work-media";
import "./work.css";

interface Props {
  title: string;
  videoSrc: string;
  posterSrc?: string;
  videoAvailable: boolean;
  portrait?: boolean;
  fullscreenTarget?: RefObject<HTMLDivElement | null>;
}

function PlayerIcon({ name }: { name: "play" | "pause" | "muted" | "sound" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "play" && (
        <path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none" />
      )}
      {name === "pause" && (
        <>
          <path d="M8 5v14M16 5v14" strokeWidth="3" />
        </>
      )}
      {(name === "sound" || name === "muted") && (
        <>
          <path d="m11 4-5 4H3v8h3l5 4Z" />
          {name === "muted" ? (
            <path d="m16 9 6 6m0-6-6 6" />
          ) : (
            <>
              <path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" />
            </>
          )}
        </>
      )}
    </svg>
  );
}

export function VideoPlayer({
  title,
  videoSrc,
  posterSrc,
  videoAvailable,
  portrait = false,
  fullscreenTarget,
}: Props) {
  const expanded = Boolean(fullscreenTarget);
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useRef<HTMLInputElement>(null);
  const clock = useRef<HTMLOutputElement>(null);
  const manuallyPaused = useRef(false);
  const visible = useRef(false);
  const manualPlayback = useRef(false);
  const reducedMotion = useRef(false);
  const [nearby, setNearby] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(!expanded);
  const [volume, setVolume] = useState(1);
  const [mediaRatio, setMediaRatio] = useState(16 / 9);
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(!videoAvailable);
  const [notice, setNotice] = useState("");

  // Update only the timeline DOM during playback, rather than rerendering cards.
  function updateTimeline() {
    const media = video.current;
    if (!media) return;
    const time = media.currentTime;
    if (progress.current) {
      progress.current.value = String(time);
      progress.current.style.setProperty(
        "--progress",
        `${media.duration ? (time / media.duration) * 100 : 0}%`,
      );
      progress.current.setAttribute(
        "aria-valuetext",
        `${formatTime(time)} of ${formatTime(media.duration)}`,
      );
    }
    if (clock.current) clock.current.textContent = formatTime(time);
  }

  function startPlayback(manual = false) {
    const media = video.current;
    if (!media) return;
    if (manual) {
      manuallyPaused.current = false;
      manualPlayback.current = true;
    }
    setNotice("");
    void media
      .play()
      .then(() => {
        // A delayed play promise must not revive an offscreen or manually paused video.
        if (
          !visible.current ||
          manuallyPaused.current ||
          document.hidden ||
          (!expanded && isGalleryPlaying())
        )
          media.pause();
      })
      .catch(() => {
        if (visible.current && !manuallyPaused.current)
          setNotice("Press play to preview.");
      });
  }

  useEffect(() => {
    const element = container.current;
    if (!element || !videoAvailable) return;
    const mediaAtMount = video.current;
    if (expanded) {
      visible.current = true;
      void mediaAtMount?.play().catch(() => {
        // The play button remains available if the browser blocks autoplay.
      });
      const syncFullscreen = () =>
        setFullscreen(document.fullscreenElement === fullscreenTarget?.current);
      const pauseWhenHidden = () => {
        if (document.hidden) mediaAtMount?.pause();
      };
      document.addEventListener("fullscreenchange", syncFullscreen);
      document.addEventListener("visibilitychange", pauseWhenHidden);
      return () => {
        visible.current = false;
        mediaAtMount?.pause();
        document.removeEventListener("fullscreenchange", syncFullscreen);
        document.removeEventListener("visibilitychange", pauseWhenHidden);
      };
    }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = preference.matches;
    const preferenceChanged = () => {
      reducedMotion.current = preference.matches;
      if (preference.matches && !manualPlayback.current) video.current?.pause();
    };
    const nearObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setNearby(true);
          nearObserver.disconnect();
        }
      },
      { rootMargin: "250px 0px" },
    );
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        visible.current =
          entry.isIntersecting && entry.intersectionRatio >= 0.2;
        const media = video.current;
        if (!media) return;
        if (!visible.current) media.pause();
        else if (
          !manuallyPaused.current &&
          !document.hidden &&
          !isGalleryPlaying() &&
          (!reducedMotion.current || manualPlayback.current)
        ) {
          void media.play().catch(() => {
            /* Manual play remains available if autoplay is blocked. */
          });
        }
      },
      { threshold: [0, 0.2] },
    );
    const tabChanged = () => {
      const media = video.current;
      if (!media) return;
      if (document.hidden || isGalleryPlaying()) media.pause();
      else if (
        visible.current &&
        !manuallyPaused.current &&
        (!reducedMotion.current || manualPlayback.current)
      ) {
        void media.play().catch(() => {});
      }
    };
    nearObserver.observe(element);
    visibilityObserver.observe(element);
    preference.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", tabChanged);
    document.addEventListener(galleryPlaybackChange, tabChanged);
    return () => {
      nearObserver.disconnect();
      visibilityObserver.disconnect();
      preference.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", tabChanged);
      document.removeEventListener(galleryPlaybackChange, tabChanged);
      mediaAtMount?.pause();
    };
  }, [videoAvailable, expanded, fullscreenTarget]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    function tick() {
      updateTimeline();
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  function togglePlayback() {
    const media = video.current;
    if (!media) return;
    if (media.paused) startPlayback(true);
    else {
      manuallyPaused.current = true;
      media.pause();
    }
  }

  function seek(time: number) {
    const media = video.current;
    if (!media || !Number.isFinite(media.duration)) return;
    media.currentTime = Math.min(media.duration, Math.max(0, time));
    updateTimeline();
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.fullscreenEnabled)
        await fullscreenTarget?.current?.requestFullscreen();
      else {
        const media = video.current as
          (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
        media?.webkitEnterFullscreen?.();
      }
    } catch {
      setNotice("Fullscreen is unavailable in this browser.");
    }
  }

  return (
    <div
      ref={container}
      className={
        expanded
          ? "work-player work-expanded"
          : portrait
            ? "work-player work-portrait"
            : "work-player"
      }
      style={
        expanded
          ? ({ "--work-media-ratio": mediaRatio } as CSSProperties)
          : undefined
      }
      role="group"
      aria-label={`${title} video player`}
    >
      <div className="work-viewport">
        {!failed ? (
          <video
            ref={video}
            className="work-video"
            src={expanded || nearby ? videoSrc : undefined}
            poster={posterSrc}
            preload={expanded || nearby ? "metadata" : "none"}
            muted={muted}
            playsInline
            loop={!expanded}
            aria-label={title}
            onLoadedMetadata={() => {
              const media = video.current;
              if (!media) return;
              setDuration(Number.isFinite(media.duration) ? media.duration : 0);
              if (expanded && media.videoWidth && media.videoHeight)
                setMediaRatio(media.videoWidth / media.videoHeight);
              updateTimeline();
              if (
                !expanded &&
                visible.current &&
                !manuallyPaused.current &&
                !reducedMotion.current &&
                !document.hidden &&
                !isGalleryPlaying()
              )
                startPlayback();
            }}
            onPlay={() => {
              if (
                !visible.current ||
                manuallyPaused.current ||
                document.hidden ||
                (!expanded && isGalleryPlaying())
              )
                video.current?.pause();
              else setPlaying(true);
            }}
            onPause={() => setPlaying(false)}
            onTimeUpdate={updateTimeline}
            onSeeked={updateTimeline}
            onVolumeChange={() => {
              setMuted(video.current?.muted ?? true);
              if (expanded) setVolume(video.current?.volume ?? 1);
            }}
            onError={() => {
              setFailed(true);
              setPlaying(false);
            }}
          />
        ) : (
          <div className="work-fallback" role="status">
            <PlayerIcon name="play" />
            <span>Preview unavailable</span>
            <p>{title}</p>
          </div>
        )}
        {!failed && duration === 0 && (
          <div className="work-previewLabel" aria-hidden="true">
            <PlayerIcon name="play" />
            <span>{title}</span>
          </div>
        )}
      </div>
      {!failed && (
        <div className="work-controls">
          <button
            type="button"
            className="work-controlButton"
            aria-label={`${playing ? "Pause" : "Play"} ${title}`}
            onClick={togglePlayback}
            disabled={!expanded && !nearby}
          >
            <PlayerIcon name={playing ? "pause" : "play"} />
          </button>
          <button
            type="button"
            className="work-controlButton"
            aria-label={`Seek backward 5 seconds in ${title}`}
            onClick={() => seek((video.current?.currentTime ?? 0) - 5)}
            disabled={!duration}
          >
            <span aria-hidden="true">-5</span>
          </button>
          <button
            type="button"
            className="work-controlButton"
            aria-label={`Seek forward 5 seconds in ${title}`}
            onClick={() => seek((video.current?.currentTime ?? 0) + 5)}
            disabled={!duration}
          >
            <span aria-hidden="true">+5</span>
          </button>
          <div className="work-timeline">
            <input
              ref={progress}
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              defaultValue="0"
              disabled={!duration}
              aria-label={`Seek ${title}`}
              aria-valuetext={`0:00 of ${formatTime(duration)}`}
              onChange={(event) => seek(Number(event.target.value))}
            />
          </div>
          <div className="work-time">
            <output ref={clock} aria-label="Current playback time">
              0:00
            </output>
            <span aria-hidden="true"> / </span>
            <span aria-label="Total duration">{formatTime(duration)}</span>
          </div>
          <button
            type="button"
            className="work-controlButton"
            aria-label={`${muted ? "Unmute" : "Mute"} ${title}`}
            aria-pressed={!muted}
            onClick={() => {
              const media = video.current;
              if (media) {
                media.muted = !media.muted;
                setMuted(media.muted);
              }
            }}
          >
            <PlayerIcon name={muted ? "muted" : "sound"} />
          </button>
          {expanded && (
            <>
              <input
                className="work-volume"
                aria-label={`Volume for ${title}`}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => {
                  const media = video.current;
                  if (!media) return;
                  const nextVolume = Number(event.target.value);
                  media.volume = nextVolume;
                  setVolume(nextVolume);
                  if (nextVolume > 0) media.muted = false;
                }}
              />
              <button
                type="button"
                className="work-controlButton"
                aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                onClick={toggleFullscreen}
              >
                {fullscreen ? (
                  <Minimize size={16} aria-hidden="true" />
                ) : (
                  <Maximize size={16} aria-hidden="true" />
                )}
              </button>
            </>
          )}
        </div>
      )}
      {notice && !failed && (
        <p className="work-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
