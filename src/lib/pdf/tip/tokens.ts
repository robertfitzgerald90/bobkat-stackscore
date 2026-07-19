/** TIP-only density tokens — tighter executive print layout. */
export const TIP_PDF_TYPOGRAPHY = {
  coverTitle: 26,
  coverClient: 18,
  sectionTitle: 16,
  sectionSubtitle: 8.5,
  initiativeTitle: 13,
  findingTitle: 12,
  body: 9.25,
  bodySmall: 8.25,
  label: 9,
  badge: 7.5,
  kpiValue: 16,
  kpiLabel: 7.5,
  footer: 7.5,
  tableHeader: 7.5,
} as const;

export const TIP_PDF_SPACING = {
  /** Horizontal page inset (~0.58in at 72dpi). */
  pagePaddingX: 42,
  /** Bottom inset must clear the fixed footer block. */
  pagePaddingBottom: 48,
  /** Top inset reserved for the fixed repeating header. */
  headerReserve: 42,
  section: 16,
  block: 8,
  cardPaddingY: 12,
  cardPaddingX: 14,
  /** @deprecated Prefer cardPaddingY / cardPaddingX */
  cardPadding: 12,
  paragraph: 5,
  fieldGap: 8,
  badgeGap: 6,
  titleGap: 6,
  badgeToContent: 8,
} as const;

/**
 * Letter page content height available between fixed header/footer reserves.
 * Used to decide whether a card can stay unbroken.
 */
export const TIP_PDF_PAGE = {
  letterHeight: 792,
  get printableContentHeight() {
    return (
      this.letterHeight -
      TIP_PDF_SPACING.headerReserve -
      TIP_PDF_SPACING.pagePaddingBottom
    );
  },
} as const;

/**
 * Pagination thresholds for @react-pdf/renderer.
 *
 * `minPresenceAhead` keeps an element with the following sibling content within
 * N points — it is NOT “remaining page height”. Use it on titles/labels so they
 * are not orphaned from the paragraph or list that follows.
 *
 * `wrap={false}` on a card moves the whole card when it does not fit.
 */
export const TIP_PAGINATION = {
  sectionTitle: 64,
  sectionWithSubtitle: 80,
  /** Typical intact initiative card — do not start unless this much follows. */
  initiativeCard: 200,
  initiativeHeader: 56,
  initiativeFirstField: 72,
  fieldBlock: 40,
  findingCard: 140,
  /** Lead fragment of a split finding card (title + badges + first field). */
  findingLeadFragment: 100,
  /** Lead fragment of a split initiative card. */
  initiativeLeadFragment: 88,
  nextStepCard: 64,
  investmentBlock: 88,
  table: 72,
  tableRow: 28,
  /** Cards taller than this share of the printable area may split by group. */
  maxUnbrokenCardRatio: 0.9,
  /** Intro groups taller than this share use minPresenceAhead only (not wrap={false}). */
  maxIntroRatio: 0.45,
} as const;
