import type {
  CaseBlock,
  ContainerContent,
  SpacerContent,
} from "@/lib/case-builder/types";
import PublicContainerBlock from "./PublicContainerBlock";
import PublicSpacerBlock from "./PublicSpacerBlock";
import { cn } from "@/lib/utils";

export type PreviewHoverTarget =
  | { blockId: string }
  | { blockId: string; columnIndex: number; itemIndex: number };

/** Case-level layout settings (from `cases` table). */
export type CaseLayout = {
  /** Padding around the entire block list (px). */
  containerPadding?: number;
  /** Border-radius on each container block wrapper (px). */
  containerRadius?: number;
  /** Vertical gap between blocks (px). */
  containerGap?: number;
};

type Props = {
  blocks: CaseBlock[];
  className?: string;
  layout?: CaseLayout;
  onHover?: (target: PreviewHoverTarget) => void;
  active?: PreviewHoverTarget | null;
};

export default function CaseBlocksRenderer({
  blocks,
  className,
  layout,
  onHover,
  active = null,
}: Props) {
  if (blocks.length === 0) return null;

  const padding = layout?.containerPadding ?? 0;
  const gap = layout?.containerGap ?? 0;
  const radius = layout?.containerRadius ?? 0;

  return (
    <div
      className={cn("flex flex-col", className)}
      style={{
        padding: padding > 0 ? padding : undefined,
        gap: gap > 0 ? gap : undefined,
      }}
    >
      {blocks.map((block) => {
        switch (block.type) {
          case "container": {
            const containerEl = (
              <PublicContainerBlock
                key={block.id}
                content={block.content as ContainerContent}
                interactive={
                  onHover
                    ? {
                        blockId: block.id,
                        onHover,
                        active,
                      }
                    : undefined
                }
              />
            );

            if (radius > 0) {
              return (
                <div
                  key={block.id}
                  style={{
                    borderRadius: radius,
                    overflow: "hidden",
                  }}
                >
                  {containerEl}
                </div>
              );
            }

            return containerEl;
          }
          case "spacer":
            return (
              <div
                key={block.id}
                onMouseEnter={
                  onHover
                    ? () => {
                        onHover({ blockId: block.id });
                      }
                    : undefined
                }
              >
                <PublicSpacerBlock content={block.content as SpacerContent} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
