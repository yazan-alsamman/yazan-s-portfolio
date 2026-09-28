/** Display name for an owner-confirmed social profile (brand names are not translated). */
export function socialLabel(link: { network: string; url: string }): string {
  if (link.network === 'github') return 'GitHub';
  if (link.network === 'linkedin') return 'LinkedIn';
  if (link.network === 'instagram') return 'Instagram';
  try {
    return new URL(link.url).hostname.replace(/^www\./, '');
  } catch {
    return link.url;
  }
}
