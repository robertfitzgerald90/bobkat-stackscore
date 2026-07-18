import Image from "next/image";
import { cn } from "@/lib/utils";

export const SERVICE_SCREENSHOT_FRAME_CLASS =
  "group relative min-w-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30 shadow-sm";

const SIZE_CLIP_CLASSES = {
  default: "relative aspect-[4/3] w-full overflow-hidden rounded-xl",
  large: "relative aspect-[4/3] w-full min-h-[240px] overflow-hidden rounded-xl sm:min-h-[300px] lg:min-h-[360px]",
  featured:
    "relative aspect-[16/10] w-full min-h-[260px] overflow-hidden rounded-xl sm:min-h-[340px] lg:min-h-[440px]",
} as const;

type ServiceScreenshotProps = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  size?: keyof typeof SIZE_CLIP_CLASSES;
  className?: string;
};

export function ServiceScreenshot({
  src,
  alt,
  fit = "contain",
  size = "default",
  className,
}: ServiceScreenshotProps) {
  return (
    <div className={cn(SERVICE_SCREENSHOT_FRAME_CLASS, className)}>
      <div className={SIZE_CLIP_CLASSES[size]}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={
            size === "featured"
              ? "(min-width: 1024px) 960px, 100vw"
              : "(min-width: 1024px) 52vw, 100vw"
          }
          className={cn(
            "transition-transform duration-500 group-hover:scale-[1.01] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
            fit === "contain" ? "object-contain p-2 sm:p-3 lg:p-4" : "object-cover",
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
