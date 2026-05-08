export const colors = {
  /** Feed background from the provided Figma frame */
  background: '#F2F4F7',
  /** Post detail outer screen — Figma node «Детальный пост» (1:4108) */
  postDetailScreenBackground: '#F5F8FD',
  surface: '#FFFFFF',
  textPrimary: '#111416',
  textSecondary: '#111416',
  textTertiary: '#AEAEB2',
  border: '#D1D1D6',
  borderSubtle: '#E6EBF0',
  accent: '#4F46E5',
  accentText: '#FFFFFF',
  danger: '#DC2626',
  imagePlaceholder: '#E5E5EA',
  /** Paid/locked post — Figma donate CTA + icon */
  paidDonatePrimary: '#6115CD',
  paidLockedSkeleton: 'rgba(238, 239, 241, 0.8)',
  paidLockedOverlayDim: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000',
  pillBackground: '#EFF2F7',
  pillIconLike: '#57626F',
  /** Active like pill — Figma liked state (63×36 pill asset) */
  likePillActiveBackground: '#FF2B75',
  likePillActiveContent: '#FFEAF1',
  pillIconComment: '#57626F',
  pillMetric: '#57626F',
  /** Comments block title — Figma bottom_sheet label secondary */
  postDetailCommentsLabel: '#68727D',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
  round: 999,
};

export const typography = {
  title: 18,
  body: 14,
  caption: 12,
  screenTitle: 28,
  screenTitleLineHeight: 34,
  postTitle: 18,
  postTitleLineHeight: 26,
  authorName: 15,
  authorNameLineHeight: 20,
  handle: 13,
  handleLineHeight: 18,
  preview: 15,
  previewLineHeight: 22,
  paidCalloutTitle: 15,
  paidCalloutTitleLineHeight: 22,
  meta: 13,
  metaLineHeight: 18,
  previewSecondary: 15,
  previewSecondaryLineHeight: 20,
  pillMetric: 13,
  pillMetricLineHeight: 18,
};

/** Layout numbers not tied to font scale */
export const layout = {
  /** The card media in the target Figma frame is square */
  postCoverMediaAspectRatio: 1,
};

/** Feed tier tabs — Test Assignment (Figma scroll-news tabs) */
export const feedTierFilter = {
  trackHeight: 38,
  trackPadding: 4,
  /** Active segment — brand purple from Figma */
  activeBackground: colors.paidDonatePrimary,
  activeLabel: '#FFFFFF',
  inactiveLabel: '#57626F',
  trackBackground: '#FFFFFF',
};

/** Post detail — Figma «Детальный пост» scroll-news_content */
export const postDetail = {
  cardRadius: 12,
  cardPaddingV: 12,
  contentPaddingH: 16,
  /** Main vertical stack inside card (author / media / buttons / comments) */
  sectionGap: 16,
  /** Image → title → body */
  mediaBlockGap: 8,
  /** Avatar row: gap between avatar and name */
  authorAvatarGap: 12,
  bodyFontSize: 15,
  bodyLineHeight: 20,
  commentRowPaddingV: 8,
  commentBlockGap: 12,
  commentNameBodyGap: 2,
};

/** Card + action row — values aligned to 8pt grid / typical Figma RN feed */

export const feedCard = {
  cardRadius: 12,
  contentPaddingH: 16,
  headerPaddingTop: 12,
  headerPaddingBottom: 0,
  titleMarginTop: 8,
  previewMarginTop: 8,
  actionsMarginTop: 16,
  actionsMarginBottom: 12,
  pillPaddingH: 12,
  pillPaddingV: 6,
  pillIconGap: 4,
  pillRowGap: 8,
  pillIconSize: 20,
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
};
