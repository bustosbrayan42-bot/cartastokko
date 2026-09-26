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
