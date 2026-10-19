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

/**
 * Base URL for pre-rendered card images stored on Cloudflare R2
 */
export const R2_RENDERED_CARDS_BASE_URL = 'https://pub-0bf9a87cec964ff49bfd058873c948c3.r2.dev/cartas_renderizadas';

/**
 * Returns the direct URL of a pre-rendered full card image from Cloudflare R2.
 * e.g. carta_001.png, carta_002.png, ...
 */
export const getRenderedCardUrl = (cardNumber: string | number): string => {
  const numStr = String(cardNumber || '1').padStart(3, '0');
  return `${R2_RENDERED_CARDS_BASE_URL}/carta_${numStr}.png`;
};
