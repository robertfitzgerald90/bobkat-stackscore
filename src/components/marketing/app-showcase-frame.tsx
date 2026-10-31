import Image from "next/image";
import { CornerBrackets } from "@/components/design-system/instrument/corner-brackets";
import type { AppShowcaseScreenshot } from "@/lib/marketing/app-showcase";
import { MARKETING_HERO_SCREENSHOT } from "@/lib/marketing/tokens";
import { cn } from "@/lib/utils";

type AppShowcaseFrameProps = {
  image: AppShowcaseScreenshot;
  priority?: boolean;
  className?: string;
};

/** Framed landscape application screenshot — purple-first marketing chrome without obscuring UI. */
export function AppShowcaseFrame({ image, priority = false, className }: AppShowcaseFrameProps) {
  return (
    <CornerBrackets corners="four" className={cn("w-full", className)}>
      <div
        className={cn(
          "overflow-hidden border border-primary/20 bg-card/40 shadow-[0_0_0_1px_rgba(109,40,217,0.08)]",
          MARKETING_HERO_SCREENSHOT,
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, 1120px"
          className="h-auto w-full object-cover object-top"
        />
      </div>
    </CornerBrackets>
  );
}
