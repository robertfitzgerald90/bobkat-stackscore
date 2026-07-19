export function SectionLoadingSkeleton({ minHeight = "min-h-[28rem]" }: { minHeight?: string }) {
  return (
    <div
      className={`${minHeight} animate-pulse border-t border-border/70 bg-muted/5 px-4 py-10 motion-reduce:animate-none sm:px-6 sm:py-12`}
      aria-hidden
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-10 w-2/3 max-w-xl rounded bg-muted" />
        <div className="h-20 max-w-2xl rounded bg-muted/70" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 rounded-xl bg-muted/60" />
          <div className="h-40 rounded-xl bg-muted/60" />
        </div>
      </div>
    </div>
  );
}
