/** TIP-only density tokens — tighter than shared report defaults for executive print. */
export const TIP_PDF_TYPOGRAPHY = {
  coverTitle: 28,
  coverClient: 20,
  sectionTitle: 19,
  sectionSubtitle: 9,
  initiativeTitle: 17,
  findingTitle: 15,
  body: 10,
  bodySmall: 9,
  label: 9,
  badge: 7,
  kpiValue: 18,
  kpiLabel: 8,
  footer: 8,
  tableHeader: 8,
} as const;

export const TIP_PDF_SPACING = {
  pagePaddingX: 44,
  pagePaddingBottom: 54,
  headerReserve: 46,
  section: 22,
  block: 12,
  cardPadding: 14,
  paragraph: 8,
  fieldGap: 6,
  badgeGap: 4,
} as const;

/** Minimum space (pt) required below an element before breaking. */
export const TIP_PAGINATION = {
  sectionTitle: 56,
  sectionWithSubtitle: 72,
  findingCard: 128,
  initiativeCard: 112,
  initiativeHeader: 48,
  fieldBlock: 36,
  nextStepCard: 72,
  investmentBlock: 96,
  table: 88,
} as const;
