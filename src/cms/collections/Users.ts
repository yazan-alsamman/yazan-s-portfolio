import type { CollectionBeforeOperationHook, CollectionConfig } from 'payload';
import { Forbidden } from 'payload';
import { adminOnly, adminOnlyField, isAdmin } from '../access';

/**
 * Closes Payload's "first user" registration window (Phase 2 security finding, T7):
 * with an empty users table, Payload's `/api/users/first-register` (and the admin
 * "create first user" screen) creates an ADMIN for any anonymous caller, bypassing
 * `access.create`. On a fresh VPS that is a race to own the CMS.
 *
 * Rule: users may only be created in-process (Local API — the env-driven seed script) or
 * over HTTP by an authenticated admin. Every other HTTP create is rejected.
 */
const blockAnonymousUserCreation: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (operation !== 'create') return args;
  if (req.payloadAPI === 'local') return args;
  if (isAdmin(req.user)) return args;
  throw new Forbidden(req.t);
};

/**
 * Admin accounts (T7 / ADR-010). Single-admin installation.
 * - No public sign-up: `create` requires an existing admin; the first admin is created by
 *   `pnpm cms:seed-admin` from environment variables (never committed, never defaulted).
 * - Lockout after repeated failures; short-lived sessions; HttpOnly cookies, Secure in production.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Admin user', plural: 'Admin users' },
  admin: {
    useAsTitle: 'email',
    group: 'System',
    description: 'Accounts that can sign in to this CMS. There is no public sign-up.',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minutes
    tokenExpiration: 2 * 60 * 60, // 2 hours
    useSessions: true, // server-side sessions: logout revokes the session
    cookies: {
      sameSite: 'Lax',
      secure: process.env.SITE_ENV === 'production',
    },
  },
  access: {
    create: adminOnly,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
    admin: ({ req }) => isAdmin(req.user),
  },
  hooks: { beforeOperation: [blockAnonymousUserCreation] },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [{ label: 'Admin', value: 'admin' }],
      saveToJWT: true,
      access: { update: adminOnlyField },
    },
  ],
};
