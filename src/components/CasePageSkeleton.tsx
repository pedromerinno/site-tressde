import { cn } from "@/lib/utils";

const shimmerBase =
  "relative overflow-hidden rounded-xl bg-stone-300/90 dark:bg-black/45 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-foreground/8 before:to-transparent motion-safe:before:animate-[shimmer_1.8s_ease-in-out_infinite]";

/**
 * Skeleton para a página single do case. Full height, não comprime;
 * mantém o footer embaixo enquanto case + blocos carregam.
 * Usa os mesmos tons escuros da HomePageSkeleton.
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
          shimmerBase,
          "w-full flex-1 min-h-[40vh] max-h-[55vh]",
        )}
      />
      {/* Two columns */}
      <div className="w-full flex gap-4 min-h-[32vh]">
        <div className={cn(shimmerBase, "flex-1 min-h-[28vh]")} />
        <div className={cn(shimmerBase, "flex-1 min-h-[28vh]")} />
      </div>
      {/* Wide block */}
      <div className={cn(shimmerBase, "w-full min-h-[24vh] max-h-[35vh]")} />
      {/* Video-ish block */}
      <div className={cn(shimmerBase, "w-full min-h-[20vh] max-h-[28vh]")} />
      {/* Spacer so content + pb-28 is respected */}
      <div className="min-h-[2rem] flex-shrink-0" aria-hidden="true" />
    </div>
  );
}
