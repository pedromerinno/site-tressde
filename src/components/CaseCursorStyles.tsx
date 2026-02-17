import * as React from "react";
import cursorCase from "@/assets/cursor-case.png";

export function CaseCursorStyles() {
  const css = React.useMemo(
    () => `
      .cursor-case,
      .cursor-case *,
      .cursor-case mux-player,
      .cursor-case video {
        cursor: url("${cursorCase}") 16 16, pointer !important;
      }
      .cursor-case .mux-no-controls mux-player {
        cursor: url("${cursorCase}") 16 16, pointer !important;
      }
    `,
    []
  );

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
