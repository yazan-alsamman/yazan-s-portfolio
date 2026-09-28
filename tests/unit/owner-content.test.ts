import { describe, expect, it } from 'vitest';
import {
  ownerEducation,
  ownerExperience,
  ownerProfile,
  publishCertificatesWithoutFiles,
  publishWebCv,
} from '@/cms/owner/owner-content';
import { socialLabel } from '@/lib/social';

/** Owner-confirmed decisions (2026-09-28): exactly what the owner stated, nothing inferred. */
describe('owner-confirmed content', () => {
  it('publishes the chosen email and exactly GitHub, LinkedIn and Instagram — never Facebook', () => {
    expect(ownerProfile.email).toBe('yazanalsaamman@gmail.com');
    expect(ownerProfile.socialLinks.map((l) => l.network)).toEqual(['github', 'linkedin', 'instagram']);
    expect(JSON.stringify(ownerProfile)).not.toMatch(/facebook/i);
    expect(JSON.stringify(ownerProfile)).not.toMatch(/yalsamman/); // the other legacy address
  });

  it('uses canonical profile URLs without share/tracking parameters', () => {
    for (const { url } of ownerProfile.socialLinks) {
      const u = new URL(url);
      expect(u.protocol).toBe('https:');
      expect(u.search).toBe('');
    }
    expect(ownerProfile.socialLinks[1]!.url).toBe('https://www.linkedin.com/in/yazan-alsamman-7541a434');
    expect(ownerProfile.socialLinks[2]!.url).toBe('https://www.instagram.com/yazan_al_samman');
  });

  it('represents the stated experience without dates, metrics or extra employers', () => {
    expect(ownerExperience).toHaveLength(1);
    const [cto] = ownerExperience;
    expect(cto).toMatchObject({ organization: 'VegaCORE', title: 'Chief Technology Officer (CTO)' });
    expect(cto).not.toHaveProperty('startDate');
    const text = cto!.description.join(' ');
    expect(text).toMatch(/more than four years/i);
    expect(text).not.toMatch(/\d/); // no numbers: no dates, team sizes, counts or metrics
  });

  it('applies the education correction with a year only', () => {
    expect(ownerEducation).toEqual({
      degree: 'Bachelor of Information Technology',
      institution: 'Arab International University (AIU)',
      graduationYear: 2026,
    });
  });

  it('records the publication decisions for certificates and the web CV', () => {
    expect(publishCertificatesWithoutFiles).toBe(true);
    expect(publishWebCv).toBe(true);
  });

  it('labels Instagram by name', () => {
    expect(socialLabel({ network: 'instagram', url: 'https://www.instagram.com/x' })).toBe('Instagram');
  });
});
