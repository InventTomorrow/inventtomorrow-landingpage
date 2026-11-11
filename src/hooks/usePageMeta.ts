import { useEffect } from 'react';
import type { PageMeta } from '../content/pages';
import { absoluteUrl } from '../utils/navigation';

function setHeadTag(selector: string, create: () => HTMLMetaElement | HTMLLinkElement, value: string | null) {
  let tag = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (value === null) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = create();
    document.head.appendChild(tag);
  }
  if (tag instanceof HTMLLinkElement) tag.href = value;
  else tag.content = value;
}

function createMeta(attribute: 'name' | 'property', key: string) {
  return () => {
    const tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    return tag;
  };
}

function createCanonical() {
  const tag = document.createElement('link');
  tag.rel = 'canonical';
  return tag;
}

// Keeps the tab title, description, canonical link and share tags in step with the page after in-app navigation.
// Built pages already ship these in their HTML (scripts/prerender.ts).
export function usePageMeta({ path, title, description, isIndexable = true }: PageMeta) {
  useEffect(() => {
    const url = absoluteUrl(path);
    document.title = title;
    setHeadTag('meta[name="description"]', createMeta('name', 'description'), description);
    setHeadTag('link[rel="canonical"]', createCanonical, isIndexable ? url : null);
    setHeadTag('meta[name="robots"]', createMeta('name', 'robots'), isIndexable ? null : 'noindex');
    setHeadTag('meta[property="og:title"]', createMeta('property', 'og:title'), title);
    setHeadTag('meta[property="og:description"]', createMeta('property', 'og:description'), description);
    setHeadTag('meta[property="og:url"]', createMeta('property', 'og:url'), url);
  }, [path, title, description, isIndexable]);
}
