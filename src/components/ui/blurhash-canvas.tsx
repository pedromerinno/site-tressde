import * as React from "react";
import { decode } from "blurhash";

interface BlurhashCanvasProps extends React.HTMLAttributes<HTMLCanvasElement> {
  hash: string;
  /** Decode resolution (not display size). Defaults to 32. */
  width?: number;
  height?: number;
  /** When true, fades out the canvas. */
  hidden?: boolean;
}

/**
 * Renders a blurhash string into a tiny canvas that CSS scales to fill its container.
 * Use `hidden` prop to trigger a fade-out transition when the real content is ready.
 */
export function BlurhashCanvas({
  hash,
  width = 32,
  height = 32,
  hidden = false,
  className,
  style,
  ...rest
}: BlurhashCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const pixels = decode(hash, width, height);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const imageData = ctx.createImageData(width, height);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
    } catch {
      // invalid hash — silently ignore
    }
  }, [hash, width, height]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        transition: "opacity 0.4s ease-out",
        opacity: hidden ? 0 : 1,
        ...style,
      }}
      {...rest}
    />
  );
}
