export interface SectionPosition {
  id: string;
  top: number;
  bottom: number;
}

/**
 * Determines which section is currently active based on current scroll position
 * and viewport offset.
 */
export function getActiveSectionId(
  scrollPosition: number,
  sections: SectionPosition[],
  viewportOffset = 180
): string {
  if (!sections || sections.length === 0) return 'home';

  const targetScroll = scrollPosition + viewportOffset;

  for (let i = sections.length - 1; i >= 0; i--) {
    const sec = sections[i];
    if (targetScroll >= sec.top) {
      return sec.id;
    }
  }

  return sections[0]?.id || 'home';
}
