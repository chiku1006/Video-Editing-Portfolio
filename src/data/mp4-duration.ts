import { closeSync, fstatSync, openSync, readSync } from "node:fs";
import path from "node:path";

// Read container headers only so the gallery never fetches a video for its time label.
export function readMp4Duration(src: string): number | undefined {
  let fd: number | undefined;
  try {
    const file = openSync(path.join(process.cwd(), "public", src), "r");
    fd = file;
    const bytes = Buffer.alloc(32);
    const fileSize = fstatSync(file).size;

    function findBox(start: number, end: number, type: string) {
      for (let offset = start; offset + 8 <= end;) {
        if (readSync(file, bytes, 0, 8, offset) !== 8) break;
        const name = bytes.toString("ascii", 4, 8);
        let size = bytes.readUInt32BE(0);
        let header = 8;
        if (size === 1) {
          if (
            offset + 16 > end ||
            readSync(file, bytes, 0, 8, offset + 8) !== 8
          )
            break;
          size = Number(bytes.readBigUInt64BE(0));
          header = 16;
        } else if (size === 0) {
          size = end - offset;
        }
        if (!Number.isSafeInteger(size) || size < header || size > end - offset)
          break;
        if (name === type)
          return { start: offset + header, end: offset + size };
        offset += size;
      }
    }

    const moov = findBox(0, fileSize, "moov");
    const mvhd = moov && findBox(moov.start, moov.end, "mvhd");
    if (!mvhd || mvhd.end - mvhd.start < 20) return;
    const length = Math.min(bytes.length, mvhd.end - mvhd.start);
    if (readSync(file, bytes, 0, length, mvhd.start) !== length) return;
    const version = bytes[0];
    if (version !== 0 && (version !== 1 || length < 32)) return;
    const scale = bytes.readUInt32BE(version === 1 ? 20 : 12);
    const duration =
      version === 1
        ? Number(bytes.readBigUInt64BE(24))
        : bytes.readUInt32BE(16);
    if (
      scale > 0 &&
      duration > 0 &&
      Number.isSafeInteger(duration) &&
      !(version === 0 && duration === 0xffffffff)
    ) {
      return duration / scale;
    }
  } catch {
    // Unavailable or unreadable media has no duration badge.
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}
