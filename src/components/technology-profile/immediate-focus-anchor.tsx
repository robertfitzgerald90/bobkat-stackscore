"use client";

import { useEffect } from "react";

/** Scrolls to Immediate Focus when the client workspace is opened from Portfolio. */
export function ImmediateFocusAnchor() {
  useEffect(() => {
    if (window.location.hash !== "#immediate-focus") return;

    const target = document.getElementById("immediate-focus");
    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return null;
}
