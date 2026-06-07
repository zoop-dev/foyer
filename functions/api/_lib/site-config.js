



export const SITE_DOMAIN = '{{DOMAIN}}';
export function canonHost(request) {
  if (SITE_DOMAIN && SITE_DOMAIN.indexOf('{{') < 0) return SITE_DOMAIN;
  try { return new URL(request.url).hostname; } catch (e) { return ''; }
}
