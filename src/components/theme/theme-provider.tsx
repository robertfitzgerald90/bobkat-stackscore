"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

const STORAGE_KEY = "stackscore-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      storageKey={STORAGE_KEY}
      themes={["light", "midnight", "system"]}
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

export { STORAGE_KEY as THEME_STORAGE_KEY };
