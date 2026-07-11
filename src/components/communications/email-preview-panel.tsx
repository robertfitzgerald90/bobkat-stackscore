"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type PreviewMode = "desktop" | "mobile" | "text";

type EmailPreviewPanelProps = {
  html: string;
  text: string;
};

export function EmailPreviewPanel({ html, text }: EmailPreviewPanelProps) {
  const [mode, setMode] = useState<PreviewMode>("desktop");

  const modes: Array<{ id: PreviewMode; label: string }> = [
    { id: "desktop", label: "Desktop" },
    { id: "mobile", label: "Mobile" },
    { id: "text", label: "Plain Text" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              mode === item.id
                ? "bg-accent-blue/15 text-accent-blue"
                : "bg-muted/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "text" ? (
        <pre className="max-h-[920px] overflow-auto rounded-xl border border-border bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {text}
        </pre>
      ) : (
        <div
          className={cn(
            "mx-auto w-full",
            mode === "mobile" ? "max-w-[390px]" : "max-w-full",
          )}
        >
          <iframe
            title="Email preview"
            srcDoc={html}
            className={cn(
              "w-full rounded-xl border border-border bg-white shadow-sm",
              mode === "mobile" ? "h-[780px]" : "h-[920px]",
            )}
            sandbox="allow-same-origin"
          />
        </div>
      )}
    </div>
  );
}
