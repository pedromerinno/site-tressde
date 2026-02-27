import { encode } from "blurhash";

const ENCODE_W = 32;
const ENCODE_H = 32;
const COMPONENTS_X = 4;
const COMPONENTS_Y = 3;

/** Load an image file into an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/** Extract pixel data from an image at a small resolution. */
function getPixels(img: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = ENCODE_W;
  canvas.height = ENCODE_H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, ENCODE_W, ENCODE_H);
  return ctx.getImageData(0, 0, ENCODE_W, ENCODE_H);
}

/** Generate a blurhash string from a File (image). */
export async function generateBlurhash(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const imageData = getPixels(img);
    return encode(imageData.data, ENCODE_W, ENCODE_H, COMPONENTS_X, COMPONENTS_Y);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Generate a blurhash string from a public image URL. */
export async function generateBlurhashFromUrl(url: string): Promise<string> {
  const img = await loadImage(url);
  const imageData = getPixels(img);
  return encode(imageData.data, ENCODE_W, ENCODE_H, COMPONENTS_X, COMPONENTS_Y);
}
