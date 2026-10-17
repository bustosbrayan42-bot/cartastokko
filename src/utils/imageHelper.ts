/**
 * Resolves an image URL so it works correctly under subpath deployments like GitHub Pages.
 * - If it's an external URL (http://, https://, data:, blob:), returns it as is.
 * - If it's a local public path (e.g. /cards/tokkii_photographer.jpg), prepends import.meta.env.BASE_URL
 */
export const resolveImageUrl = (src?: string): string => {
  if (!src) return '';
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src;
  }

  const baseUrl = import.meta.env.BASE_URL || '/';
  // Remove leading slash if base URL ends with slash
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return `${cleanBase}${cleanSrc}`;
};

/**
 * Resolves a card image to its ultra-fast optimized WebP thumbnail (~35KB).
 * Used in album spreads and card grids to eliminate GPU VRAM and bandwidth bottlenecks.
 */
export const resolveCardThumbnailUrl = (src?: string): string => {
  if (!src) return '';
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src;
  }

  const clean = src.startsWith('/') ? src.slice(1) : src;
  if (clean.startsWith('cards/') && !clean.startsWith('cards/thumbs/')) {
    const fileName = clean.slice('cards/'.length);
    const dotIdx = fileName.lastIndexOf('.');
    const baseName = dotIdx !== -1 ? fileName.slice(0, dotIdx) : fileName;
    return resolveImageUrl(`cards/thumbs/${baseName}.webp`);
  }

  return resolveImageUrl(src);
};
