/**
 * `pnpm cms:import-portrait` — owner-run, idempotent (Phase 6).
 * Copies the approved portrait.jpg into the Media library unmodified (SHA-256 verified) with
 * EN/AR alt text and a focal point. Does NOT change the Profile: select it in the dashboard
 * (Profile & contact → Portrait) if you want the CMS copy to be used; otherwise the site keeps
 * using the repository file, exactly as approved.
 */
import path from 'node:path';
import { getPayload } from 'payload';
import config from '@payload-config';
import { importApprovedPortrait } from '../portrait';

const payload = await getPayload({ config });
const result = await importApprovedPortrait(payload, {
  imagesDir: path.resolve(process.env.MEDIA_DIR ?? 'media', 'images'),
});
payload.logger.info(
  result.created
    ? `Imported the approved portrait into the Media library (id ${result.id}). The Profile was not changed.`
    : `The approved portrait is already in the Media library (id ${result.id}). Nothing changed.`,
);
process.exit(0);
