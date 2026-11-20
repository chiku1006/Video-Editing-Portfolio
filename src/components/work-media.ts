let galleryPlaying = false;

export const galleryPlaybackChange = "work-gallery-playback-change";

export function isGalleryPlaying() {
  return galleryPlaying;
}

export function setGalleryPlaying(active: boolean) {
  if (galleryPlaying === active) return;
  galleryPlaying = active;
  document.dispatchEvent(new Event(galleryPlaybackChange));
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
