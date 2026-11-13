/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Resolves local and external asset URLs properly across:
 * 1. GitHub Pages (hosted at https://<username>.github.io/<repo>/ subpath)
 * 2. Local Vite development server
 * 3. AI Studio preview environment
 *
 * External URLs (https://, http://, data:, blob:) pass through untouched.
 * Local paths like '/assets/jabir_profile.png' are resolved against the
 * hosting base path (e.g. '/jaberportfolio/assets/jabir_profile.png' on GitHub Pages).
 */
export function resolveAssetUrl(url?: string | null, fallback = '/assets/jabir_profile.png'): string {
  const target = (url && typeof url === 'string' && url.trim()) ? url.trim() : fallback;

  if (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('data:') ||
    target.startsWith('blob:')
  ) {
    return target;
  }

  // Strip leading slashes to get pure relative path
  const cleanPath = target.replace(/^\/+/, '');

  if (typeof window !== 'undefined') {
    const { hostname, pathname } = window.location;
    // On GitHub Pages (*.github.io), check if hosted under a repo subpath (e.g. /jaberportfolio/)
    // vs root user site (https://<username>.github.io/).
    if (hostname.endsWith('github.io')) {
      const segments = pathname.split('/').filter(Boolean);
      const firstSegment = segments[0];
      const appRoutes = new Set(['about', 'videos', 'design', 'skills', 'contact', 'admin', 'index.html', 'assets', 'fonts']);
      if (firstSegment && !appRoutes.has(firstSegment.toLowerCase())) {
        return `/${firstSegment}/${cleanPath}`;
      }
      return `/${cleanPath}`;
    }
  }

  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${cleanPath}`;
}
