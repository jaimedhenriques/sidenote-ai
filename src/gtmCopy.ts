export const SIDENOTE_GTM = {
  quotaLine:
    "When a hosted AI notes tool hits its monthly quota, SideNote still runs locally. No new spend.",
  pricingNote:
    "Free local MVP. No account, payment card, or $10 hosted SKU.",
  ctaTargetId: "new-meeting",
  ctaHref: "#new-meeting",
  ctaLabel: "Start a private meeting note",
} as const;

export function sidenoteGtmText(): string {
  return `${SIDENOTE_GTM.quotaLine}\n${SIDENOTE_GTM.pricingNote}`;
}

export function goToSidenoteCtaTarget(): void {
  document.getElementById(SIDENOTE_GTM.ctaTargetId)?.scrollIntoView();
  window.location.hash = SIDENOTE_GTM.ctaHref;
}
