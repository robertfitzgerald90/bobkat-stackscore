export function OfferHeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-0 h-[520px] w-[min(100%,960px)] -translate-x-1/2 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(35,135,255,0.14),transparent_62%)]" />
      <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(35,135,255,0.08),transparent_68%)] blur-2xl" />
      <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(8,47,91,0.18),transparent_70%)] blur-2xl" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(70,120,255,0.18)] to-transparent" />
    </div>
  );
}
