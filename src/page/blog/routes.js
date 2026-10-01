const ARTICLE_ROUTE = /^#article\/(.+)$/;

export function articleHref(slug) {
  return `#article/${encodeURIComponent(slug)}`;
}

export function articleSlugFromHash(hash) {
  const match = hash.match(ARTICLE_ROUTE);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}
