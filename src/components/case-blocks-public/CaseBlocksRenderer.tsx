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

type Props = {
  blocks: CaseBlock[];
  className?: string;
  onHover?: (target: PreviewHoverTarget) => void;
  active?: PreviewHoverTarget | null;
};

export default function CaseBlocksRenderer({
  blocks,
  className,
  onHover,
  active = null,
}: Props) {
  if (blocks.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block) => {
        switch (block.type) {
          case "container":
            return (
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
