/* Payload admin shell. Isolated from the public site: its own <html>, Payload's own CSS, no Tailwind tokens. */
import '@payloadcms/next/css';
// Phase 5: narrow-screen fixes for the admin chrome (admin-only; see the file header).
import '../../cms/admin/admin.css';
import type { ServerFunctionClient } from 'payload';
import config from '@payload-config';
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';
import type React from 'react';
import { importMap } from './admin/importMap.js';

type Args = { children: React.ReactNode };

const serverFunction: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({ ...args, config, importMap });
};

export default function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
