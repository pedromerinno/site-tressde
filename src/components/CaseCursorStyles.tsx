import * as React from "react";
import { createPortal } from "react-dom";

const CURSOR_SIZE = 96;

/** Ícone + minimal */
const PlusIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0 opacity-70"
  >
    <path
      d="M16 8 v16 M8 16 h16"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export function CaseCursorStyles() {
  const [state, setState] = React.useState({ visible: false, x: 0, y: 0 });
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const overCase = document.body.contains(target) && (target as Element).closest?.(".cursor-case");
      if (!overCase) {
        setState((s) => (s.visible ? { ...s, visible: false } : s));
        return;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setState({ visible: true, x: e.clientX, y: e.clientY });
        rafRef.current = null;
      });
    };

    const onLeave = (e: MouseEvent) => {
      const related = (e as MouseEvent & { relatedTarget?: Node }).relatedTarget as Node | null;
      if (!related || !document.body.contains(related)) {
        setState((s) => (s.visible ? { ...s, visible: false } : s));
        return;
      }
      const overCase = (related as Element).closest?.(".cursor-case");
      if (!overCase) {
        setState((s) => (s.visible ? { ...s, visible: false } : s));
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseout", onLeave, { passive: true });
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (state.visible) {
      document.body.classList.add("custom-case-cursor-active");
    } else {
      document.body.classList.remove("custom-case-cursor-active");
    }
    return () => document.body.classList.remove("custom-case-cursor-active");
  }, [state.visible]);

  const cursor = state.visible
    ? createPortal(
        <div
          aria-hidden
          className="pointer-events-none fixed z-[9999] flex items-center justify-center rounded-full"
          style={{
            left: state.x,
            top: state.y,
            width: CURSOR_SIZE,
            height: CURSOR_SIZE,
            transform: "translate(-50%, -50%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            backgroundColor: "rgba(0, 0, 0, 0.35)",
          }}
        >
          <PlusIcon />
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .custom-case-cursor-active .cursor-case,
            .custom-case-cursor-active .cursor-case *,
            .custom-case-cursor-active .cursor-case mux-player,
            .custom-case-cursor-active .cursor-case video {
              cursor: none !important;
            }
          `,
        }}
      />
      {cursor}
    </>
  );
}
