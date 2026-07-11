export function OfferHeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <div className="absolute left-1/2 top-0 h-[480px] w-[min(100%,900px)] -translate-x-1/2 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(8,47,91,0.14),transparent)]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
