# Self-hosted UI fonts

Latin WOFF2 files used by `next/font/local` so Turbopack builds do not depend on
live Google Fonts CSS responses (which intermittently return extensionless
`/l/font?kit=…&skey=…` URLs that break `next/font/google` — see
vercel/next.js#99114).

Source: [Fontsource](https://fontsource.org/) CDN (`cdn.jsdelivr.net/fontsource/fonts`), OFL-licensed families:

- Inter
- Space Grotesk
- Source Sans 3
- JetBrains Mono
