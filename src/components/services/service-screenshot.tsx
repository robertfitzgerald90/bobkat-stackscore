import Image from "next/image";
import { cn } from "@/lib/utils";

export const SERVICE_SCREENSHOT_FRAME_CLASS =
  "group relative min-w-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30 shadow-sm";

export const SERVICE_SCREENSHOT_CLIP_CLASS =
  "relative aspect-[3/2] w-full overflow-hidden rounded-xl";

type ServiceScreenshotProps = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  className?: string;
};

export function ServiceScreenshot({
  src,
  alt,
  fit = "cover",
  className,
}: ServiceScreenshotProps) {
  return (
    <div className={cn(SERVICE_SCREENSHOT_FRAME_CLASS, className)}>
      <div className={SERVICE_SCREENSHOT_CLIP_CLASS}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 44vw, 100vw"
          className={cn(
            "transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
            fit === "contain" ? "object-contain p-3 sm:p-4" : "object-cover",
          )}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-70"
        aria-hidden
      />
    </div>
  );
}
