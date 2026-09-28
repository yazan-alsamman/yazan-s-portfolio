import * as migration_20260927_181450_initial from './20260927_181450_initial';
import * as migration_20260928_073607_phase6_image_derivatives from './20260928_073607_phase6_image_derivatives';
import * as migration_20260928_105901_phase7_site_settings_seo from './20260928_105901_phase7_site_settings_seo';
import * as migration_20260928_115541_education_date_precision from './20260928_115541_education_date_precision';
import * as migration_20260928_125526_owner_content_decisions from './20260928_125526_owner_content_decisions';

export const migrations = [
  {
    up: migration_20260927_181450_initial.up,
    down: migration_20260927_181450_initial.down,
    name: '20260927_181450_initial',
  },
  {
    up: migration_20260928_073607_phase6_image_derivatives.up,
    down: migration_20260928_073607_phase6_image_derivatives.down,
    name: '20260928_073607_phase6_image_derivatives',
  },
  {
    up: migration_20260928_105901_phase7_site_settings_seo.up,
    down: migration_20260928_105901_phase7_site_settings_seo.down,
    name: '20260928_105901_phase7_site_settings_seo',
  },
  {
    up: migration_20260928_115541_education_date_precision.up,
    down: migration_20260928_115541_education_date_precision.down,
    name: '20260928_115541_education_date_precision',
  },
  {
    up: migration_20260928_125526_owner_content_decisions.up,
    down: migration_20260928_125526_owner_content_decisions.down,
    name: '20260928_125526_owner_content_decisions'
  },
];
