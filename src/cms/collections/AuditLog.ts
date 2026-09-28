import type { CollectionConfig } from 'payload';
import { adminOnly } from '../access';

/** Append-only change log (DASHBOARD_SPEC "Safety": public content changes are auditable). */
export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  labels: { singular: 'Audit entry', plural: 'Audit log' },
  admin: {
    group: 'System',
    description: 'Read-only history of every content change (who, what, when). Cannot be edited or deleted.',
    useAsTitle: 'action',
    defaultColumns: ['createdAt', 'collection', 'action', 'userEmail', 'locale'],
  },
  access: {
    read: adminOnly,
    create: () => false, // only written by hooks with overrideAccess
    update: () => false,
    delete: () => false,
  },
  timestamps: true,
  fields: [
    { name: 'collection', type: 'text', required: true, index: true },
    { name: 'documentId', type: 'text', required: true, index: true },
    { name: 'action', type: 'text', required: true },
    { name: 'userEmail', type: 'text', required: true },
    { name: 'locale', type: 'text' },
  ],
};
