import type {
  ContainerContent,
  SlotContent,
  ContainerColumnItems,
  ImageContent,
  TextContent,
  VideoContent,
} from "@/lib/case-builder/types";
import { normalizeContainerContent } from "@/lib/case-builder/types";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";
import PublicImageBlock from "./PublicImageBlock";
import PublicTextBlock from "./PublicTextBlock";
import PublicVideoBlock from "./PublicVideoBlock";
import type { PreviewHoverTarget } from "./CaseBlocksRenderer";

function ItemRenderer({ item, noSpacing }: { item: SlotContent; noSpacing?: boolean }) {
  switch (item.type) {
    case "image":
      return <PublicImageBlock content={item.content as ImageContent} noSpacing={noSpacing} />;
    case "text":
      return <PublicTextBlock content={item.content as TextContent} noSpacing={noSpacing} />;
    case "video":
      return <PublicVideoBlock content={item.content as VideoContent} noSpacing={noSpacing} />;
    default:
      return null;
  }
}

type Props = {
  content: ContainerContent;
  /** Na página single case: remove espaços e preloads */
  noSpacing?: boolean;
  interactive?: {
    blockId: string;
    onHover: (target: PreviewHoverTarget) => void;
    active: PreviewHoverTarget | null;
  };
};

export default function PublicContainerBlock({ content, noSpacing, interactive }: Props) {
  const c = normalizeContainerContent(content);
  const bgColor = c.backgroundColor?.trim?.() || undefined;
  return (
    <div
      className="grid gap-0"
      style={{
        gridTemplateColumns: `repeat(${c.columns}, 1fr)`,
        ...(bgColor ? { backgroundColor: bgColor } : {}),
      }}
    >
      {c.slots.map((items: ContainerColumnItems, colIdx) => {
        const coverIndex = items.findIndex(
          (it) =>
            it?.type === "image" &&
            Boolean((it.content as ImageContent | undefined)?.cover),
        );
        const coverItem = coverIndex >= 0 ? (items[coverIndex] as SlotContent) : undefined;

        const rest = items
          .map((it, originalIndex) => ({ it, originalIndex }))
          .filter(({ it, originalIndex }) => Boolean(it) && originalIndex !== coverIndex) as Array<{
          it: SlotContent;
          originalIndex: number;
        }>;

        const hasOnlyCover = Boolean(coverItem) && rest.length === 0;

        return (
          <div
            key={colIdx}
            className={[
              "relative min-h-0",
              hasOnlyCover ? "min-h-[60vh]" : "",
            ].join(" ")}
          >
            {coverItem ? (
              <OptimizedImage
                src={
                  String((coverItem.content as ImageContent).url || "") ||
                  "/image-fallback.svg"
                }
                alt={(coverItem.content as ImageContent).alt || ""}
                preset="gallery"
                widths={[640, 960, 1280, 1920]}
                sizes="50vw"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : null}

            <div className={coverItem ? "relative z-10" : ""}>
              {/* If this column is cover-only, allow selecting it by hover */}
              {interactive && hasOnlyCover && coverIndex >= 0 ? (
                <div
                  className={cn(
                    "absolute inset-0 z-10",
                    "transition-shadow",
                    "hover:ring-2 hover:ring-primary/20 hover:ring-offset-2 hover:ring-offset-background",
                    interactive.active?.blockId === interactive.blockId &&
                      "columnIndex" in interactive.active &&
                      interactive.active.columnIndex === colIdx &&
                      interactive.active.itemIndex === coverIndex
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "",
                  )}
                  onMouseEnter={() =>
                    interactive.onHover({
                      blockId: interactive.blockId,
                      columnIndex: colIdx,
                      itemIndex: coverIndex,
                    })
                  }
                />
              ) : null}

              {rest.map(({ it: item, originalIndex }, itemIdx) => {
                const isActive =
                  Boolean(interactive) &&
                  interactive!.active?.blockId === interactive!.blockId &&
                  "columnIndex" in (interactive!.active ?? {}) &&
                  (interactive!.active as any).columnIndex === colIdx &&
                  (interactive!.active as any).itemIndex === originalIndex;
                return (
                  <div
                    key={originalIndex}
                    className={cn(
                      interactive
                        ? cn(
                            "relative cursor-pointer transition-shadow",
                            "hover:ring-2 hover:ring-primary/20 hover:ring-offset-2 hover:ring-offset-background",
                          )
                        : "",
                      isActive
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "",
                    )}
                    onMouseEnter={
                      interactive
                        ? () =>
                            interactive.onHover({
                              blockId: interactive.blockId,
                              columnIndex: colIdx,
                              itemIndex: originalIndex,
                            })
                        : undefined
                    }
                  >
                    <ItemRenderer item={item} noSpacing={noSpacing} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
