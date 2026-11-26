/**
 * Browser-side image optimisation: resize and convert to WebP *before* upload.
 * Why: phone photos are 3–10 MB; the optimised file is typically 100–300 KB, so the dashboard uploads fast on mobile data,
 * the server does no image processing, and the storefront loads quickly.
 */

export interface OptimizeOptions {
  /** Longest side in pixels (never upscales). */
  maxSize: number;
  /** WebP quality 0–1. */
  quality?: number;
}

export interface OptimizeResult {
  file: File;
  originalBytes: number;
  width: number;
  height: number;
}

/** Scale (w,h) down so the longest side is at most `max`; never enlarges. */
export function fitWithin(w: number, h: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(w, h));
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

/** "photo.final.PNG" → "photo.final.webp" */
export function renamedWith(name: string, ext: string): string {
  const base = name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}.${ext}`;
}

export const formatBytes = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const load = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode"));
    img.src = url;
  });

export async function optimizeImage(file: File, { maxSize, quality = 0.82 }: OptimizeOptions): Promise<OptimizeResult> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") throw new Error("unsupported");

  const url = URL.createObjectURL(file);
  try {
    // Browsers apply the photo's EXIF rotation when decoding, so phone pictures keep their orientation.
    const img = await load(url);
    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, maxSize);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    // WebP keeps transparency (logos) at a fraction of PNG/JPEG size. Very old browsers cannot encode it: fall back to JPEG.
    let blob = await toBlob(canvas, "image/webp", quality);
    let ext = "webp";
    if (!blob || blob.type !== "image/webp") {
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      blob = await toBlob(canvas, "image/jpeg", quality);
      ext = "jpg";
    }
    if (!blob) throw new Error("encode");

    // Already small and within the size limit: keep the original bytes instead of re-encoding (avoids quality loss).
    const unchangedSize = width === img.naturalWidth && height === img.naturalHeight;
    if (unchangedSize && (file.type === "image/webp" || file.type === "image/jpeg") && file.size <= blob.size) {
      return { file, originalBytes: file.size, width, height };
    }
    return { file: new File([blob], renamedWith(file.name, ext), { type: blob.type, lastModified: Date.now() }), originalBytes: file.size, width, height };
  } finally {
    URL.revokeObjectURL(url);
  }
}
