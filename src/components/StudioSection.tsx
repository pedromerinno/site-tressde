import * as React from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "@/i18n";

gsap.registerPlugin(ScrollTrigger);

export default function StudioSection() {
  const { t } = useTranslation();
  const copy = t("studioCopy");
  const words = copy.split(/\s+/);
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const textContainerRef = React.useRef<HTMLParagraphElement | null>(null);
  const ctaRef = React.useRef<HTMLAnchorElement | null>(null);

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const textEl = textContainerRef.current;
    const cta = ctaRef.current;
    if (!section || !textEl || !cta) return;

    const wordEls = Array.from(textEl.querySelectorAll<HTMLElement>(".studio-word"));
    if (wordEls.length === 0) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.set(wordEls, { opacity: 0.4 });
      gsap.set([textEl, cta], { autoAlpha: 0, y: 28 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.to(
          textEl,
          {
            autoAlpha: 1,
            y: 0,
          duration: 0.4,
          ease: "power3.out",
        }
      )
        .to(
          cta,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.3,
            ease: "power3.out",
          },
          "-=0.15"
        );

      gsap.fromTo(
        wordEls,
        { opacity: 0.4 },
        {
          opacity: 1,
          duration: 0.5,
          stagger: 0.03,
          ease: "power2.in",
          scrollTrigger: {
            trigger: section,
            start: "top 30%",
            end: "top 10%",
            scrub: 0.5,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [copy]);

  return (
    <section ref={sectionRef} id="estudio" className="bg-background">
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24 lg:py-32">
        <div className="w-full">
          <p
            ref={textContainerRef}
            className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-foreground max-w-full"
            style={{ lineHeight: '110%' }}
          >
            <span className="inline-block text-sm font-medium text-muted-foreground tracking-[0.025em] align-top mr-8 md:mr-12 lg:mr-16">{t("studioTheStudio")}</span>
            {words.map((word, i) => (
              <span
                key={i}
                className={`studio-word inline ${i === 0 ? "ml-16 md:ml-24 lg:ml-32" : ""}`}
              >
                {word}
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
            <span className="inline ml-4 md:ml-6 align-middle opacity-100">
              <Link
                ref={ctaRef}
                to="/#contato"
                className="inline-flex h-9 md:h-10 px-4 md:px-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(0,0%,100%)] text-sm font-semibold tracking-[0.01em] opacity-100 transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 align-middle"
              >
                {t("studioLearnMore")}
              </Link>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
