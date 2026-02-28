import * as React from "react";

const DURATION_MS = 1800;
const HOLD_AT_100_MS = 400;

/** Ease-out: rápido no início, desacelera perto do fim */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

type Props = {
  isLoading: boolean;
  onComplete: () => void;
};

/**
 * Preload full screen: fundo da cor do bg, texto grande 0–100% no azul TRESSDE.
 * Sem transição — ao completar, mostra 100% e some.
 */
export default function PreloadScreen({ isLoading, onComplete }: Props) {
  const [progress, setProgress] = React.useState(0);
  const startRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const onCompleteRef = React.useRef(onComplete);
  onCompleteRef.current = onComplete;

  React.useEffect(() => {
    if (isLoading) {
      startRef.current = performance.now();
      setProgress(0);
    } else {
      setProgress(100);
      const t = setTimeout(() => onCompleteRef.current(), HOLD_AT_100_MS);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  React.useEffect(() => {
    if (!isLoading) return;

    const animate = (now: number) => {
      const start = startRef.current ?? now;
      const elapsed = now - start;
      const t = Math.min(elapsed / DURATION_MS, 1);
      const eased = easeOutCubic(t);
      setProgress(Math.floor(eased * 100));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [isLoading]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
      role="status"
      aria-label={`Carregando ${progress}%`}
    >
      <span
        className="font-sans font-normal tabular-nums text-primary"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "clamp(6rem, 22vw, 14rem)",
        }}
      >
        {progress}%
      </span>
    </div>
  );
}
