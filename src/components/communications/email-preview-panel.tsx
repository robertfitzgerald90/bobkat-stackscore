"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type PreviewMode = "desktop" | "tablet" | "mobile" | "text" | "dark";

type EmailPreviewPanelProps = {
  html: string;
  text: string;
};

export function EmailPreviewPanel({ html, text }: EmailPreviewPanelProps) {
  const [mode, setMode] = useState<PreviewMode>("desktop");

  const modes: Array<{ id: PreviewMode; label: string }> = [
    { id: "desktop", label: "Desktop" },
    { id: "tablet", label: "Tablet" },
    { id: "mobile", label: "Mobile" },
    { id: "dark", label: "Dark Mode" },
    { id: "text", label: "Plain Text" },
  ];

  const frameWidth =
    mode === "mobile" ? "max-w-[390px]" : mode === "tablet" ? "max-w-[768px]" : "max-w-full";

  const frameHeight =
    mode === "mobile" ? "h-[780px]" : mode === "tablet" ? "h-[860px]" : "h-[920px]";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              mode === item.id
                ? "bg-[#082F5B] text-white shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-[#082F5B]/8 hover:text-[#082F5B]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "text" ? (
        <pre className="max-h-[920px] overflow-auto rounded-xl border border-[#1e3a5f]/10 bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {text}
        </pre>
      ) : (
        <div
          className={cn(
            "mx-auto w-full rounded-xl p-4 transition-colors duration-200",
            mode === "dark" ? "bg-[#0b1220]" : "bg-transparent",
          )}
        >
          <div className={cn("mx-auto w-full", frameWidth)}>
            <iframe
              title="Email preview"
              srcDoc={html}
              className={cn(
                "w-full rounded-xl border border-[#1e3a5f]/10 bg-white shadow-sm",
                frameHeight,
              )}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
