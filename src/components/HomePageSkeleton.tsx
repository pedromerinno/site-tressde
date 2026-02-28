import { cn } from "@/lib/utils";

const shimmerBase =
  "relative overflow-hidden rounded-xl bg-stone-300/90 dark:bg-black/45 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-foreground/8 before:to-transparent motion-safe:before:animate-[shimmer_1.8s_ease-in-out_infinite]";

/**
 * Skeleton da home que espelha o layout real: header, grid hero, seção estúdio, portfolio.
 * Usa shimmer sutil para feedback visual elegante durante o carregamento.
 */
export default function HomePageSkeleton() {
  return (
    <main
      className="bg-background text-foreground min-h-screen flex flex-col"
      role="status"
      aria-label="Carregando"
    >
      {/* Header */}
      <header className="bg-background shrink-0">
        <div className="px-6 md:px-10 lg:px-16 pt-8 md:pt-10 pb-10 md:pb-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-12">
            <div className={cn(shimmerBase, "h-9 w-32 md:w-36")} />
            <div className={cn(shimmerBase, "h-4 w-24 mx-auto md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2")} />
            <div className="flex gap-3 shrink-0 justify-center md:justify-end">
              <div className={cn(shimmerBase, "h-10 w-20 rounded-full")} />
              <div className={cn(shimmerBase, "h-10 w-28 rounded-full")} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero grid — 3 cards */}
      <section className="px-4 md:px-6 pb-8 md:pb-12">
        <div className="w-full max-w-[min(98vw,2200px)] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className={cn(shimmerBase, "aspect-square w-full")} />
                <div className={cn(shimmerBase, "h-4 w-3/4")} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio section */}
      <section className="px-6 md:px-10 lg:px-16 py-16 md:py-24 lg:py-32">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col gap-4">
            <div className={cn(shimmerBase, "h-4 w-20")} />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className={cn(
                    shimmerBase,
                    "h-10 md:h-12",
                    i === 1 ? "w-24 md:w-32" : "w-16 md:w-24",
                  )}
                />
              ))}
            </div>
            <div className={cn(shimmerBase, "h-10 w-28 rounded-full mt-2")} />
          </div>
        </div>
      </section>

      {/* Portfolio grid */}
      <section className="px-6 md:px-10 lg:px-16 pt-4 md:pt-6 lg:pt-8 pb-28 md:pb-32 lg:pb-36">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn(shimmerBase, "aspect-[4/3] w-full")} />
          ))}
        </div>
      </section>

      {/* Footer placeholder */}
      <footer className="mt-auto bg-stone-300/70 dark:bg-black/35">
        <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20">
          <div className={cn(shimmerBase, "h-24 w-48 mx-auto")} />
        </div>
      </footer>
    </main>
  );
}
