import { cn } from "@/lib/utils";

const skeletonBlock =
  "rounded-xl bg-gradient-to-br from-muted/90 to-muted/50 animate-pulse";

/**
 * Skeleton para a página single do case. Full height, não comprime;
 * mantém o footer embaixo enquanto case + blocos carregam.
 */
export default function CasePageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col w-full min-h-screen gap-4 py-1",
        className,
      )}
      role="status"
      aria-label="Carregando projeto"
    >
      {/* Hero block */}
      <div
        className={cn(
          skeletonBlock,
          "w-full flex-1 min-h-[40vh] max-h-[55vh]",
        )}
      />
      {/* Two columns */}
      <div className="w-full flex gap-4 min-h-[32vh]">
        <div className={cn(skeletonBlock, "flex-1 min-h-[28vh]")} />
        <div className={cn(skeletonBlock, "flex-1 min-h-[28vh]")} />
      </div>
      {/* Wide block */}
      <div className={cn(skeletonBlock, "w-full min-h-[24vh] max-h-[35vh]")} />
      {/* Video-ish block */}
      <div className={cn(skeletonBlock, "w-full min-h-[20vh] max-h-[28vh]")} />
      {/* Spacer so content + pb-28 is respected */}
      <div className="min-h-[2rem] flex-shrink-0" aria-hidden="true" />
    </div>
  );
}
