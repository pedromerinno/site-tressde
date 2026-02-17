import * as React from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const copy =
  "TRESSDE is a studio built to imagine. Born in Brazil and built for the world. Our motion pieces combine bold aesthetics, precise 3D execution and a cultural perspective that brings stories to life.";

const words = copy.split(/\s+/);

export default function StudioSection() {
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const labelRef = React.useRef<HTMLParagraphElement | null>(null);
  const textContainerRef = React.useRef<HTMLParagraphElement | null>(null);
  const ctaRef = React.useRef<HTMLAnchorElement | null>(null);

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const label = labelRef.current;
    const textEl = textContainerRef.current;
    const cta = ctaRef.current;
    if (!section || !label || !textEl || !cta) return;

    const wordEls = Array.from(textEl.querySelectorAll<HTMLElement>(".studio-word"));
    if (wordEls.length === 0) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.set(wordEls, { opacity: 0.4 });
      gsap.set([label, textEl, cta], { autoAlpha: 0, y: 28 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.to(label, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      })
        .to(
          textEl,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .to(
          cta,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.2"
        );

      gsap.fromTo(
        wordEls,
        { opacity: 0.4 },
        {
          opacity: 1,
          duration: 1,
          stagger: 0.018,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 25%",
            end: "top 5%",
            scrub: 1,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="estudio" className="bg-background">
      <div className="px-6 md:px-10 lg:px-16 py-16 md:py-24 lg:py-32">
        <div className="w-full max-w-[1600px]">
          <p
            ref={labelRef}
            className="text-sm font-medium text-muted-foreground mb-6 md:mb-8"
          >
            O estúdio
          </p>
          <p
            ref={textContainerRef}
            className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-foreground leading-[1.3] max-w-full"
          >
            {words.map((word, i) => (
              <span key={i} className="studio-word inline">
                {word}
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </p>
          <Link
            ref={ctaRef}
            to="/#contato"
            className="mt-8 md:mt-10 inline-flex h-11 px-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Saiba mais
          </Link>
        </div>
      </div>
    </section>
  );
}
