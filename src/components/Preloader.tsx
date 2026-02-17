import * as React from "react";
import gsap from "gsap";

type Props = {
  /**
   * When true, the preloader won't render.
   * Useful for routes like /admin.
   */
  disabled?: boolean;
};

export default function Preloader({ disabled }: Props) {
  const [done, setDone] = React.useState(Boolean(disabled));
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const wordmarkRef = React.useRef<HTMLSpanElement | null>(null);

  React.useLayoutEffect(() => {
    if (disabled) return;
    if (done) return;

    const overlayEl = overlayRef.current;
    const wordmarkEl = wordmarkRef.current;
    if (!overlayEl || !wordmarkEl) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(overlayEl, { autoAlpha: 1, yPercent: 0, willChange: "transform, opacity" });
      const letters = Array.from(
        wordmarkEl.querySelectorAll<HTMLElement>("[data-preloader-letter]"),
      );
      gsap.set(wordmarkEl, { autoAlpha: 1 });
      gsap.set(letters, {
        autoAlpha: 0,
        y: 26,
        willChange: "transform, opacity",
      });

      if (prefersReducedMotion) {
        gsap.set(letters, { autoAlpha: 1, y: 0, willChange: "auto" });
        gsap.to(overlayEl, {
          autoAlpha: 0,
          duration: 0.2,
          onComplete: () => setDone(true),
        });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => setDone(true),
      });

      tl.to(letters, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
      })
        .to({}, { duration: 0.45 }) // small hold
        .to(overlayEl, {
          yPercent: -110,
          duration: 0.7,
          ease: "power3.inOut",
        }, "<")
        .to(overlayEl, {
          autoAlpha: 0,
          duration: 0.25,
          ease: "power1.out",
        }, "-=0.15");

      return () => {
        tl.kill();
        gsap.set(letters, { willChange: "auto" });
      };
    }, overlayEl);

    return () => {
      ctx.revert();
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [disabled, done]);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      className={[
        "fixed inset-0 z-[9999]",
        "bg-primary",
        "flex items-center justify-center",
        "text-primary-foreground",
        "select-none",
      ].join(" ")}
      role="status"
      aria-label="Carregando TRESSDE"
    >
      <div className="text-center leading-none">
        <span
          ref={wordmarkRef}
          className={[
            "block",
            "font-body font-semibold",
            "tracking-[-0.04em]",
            "text-[clamp(5rem,18vw,14rem)]",
          ].join(" ")}
        >
          <span className="sr-only">TRESSDE®</span>
          {Array.from("TRESSDE®").map((ch, idx) => (
            <span
              key={`${ch}-${idx}`}
              data-preloader-letter
              className="inline-block"
              aria-hidden="true"
            >
              {ch}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

