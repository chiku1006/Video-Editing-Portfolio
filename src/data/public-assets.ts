import { existsSync } from "node:fs";
import path from "node:path";
import { readMp4Duration } from "./mp4-duration";
import { featuredShowreel, type GalleryMedia } from "./projects";

export function hasPublicAsset(src: string) {
  return existsSync(path.join(process.cwd(), "public", src));
}

export function withMediaAvailability(item: GalleryMedia) {
  return {
    ...item,
    videoAvailable: hasPublicAsset(item.videoSrc),
    posterAvailable: hasPublicAsset(item.posterSrc),
  };
}

export function getShowreel() {
  return {
    ...withMediaAvailability(featuredShowreel),
    duration: readMp4Duration(featuredShowreel.videoSrc),
  };
}
