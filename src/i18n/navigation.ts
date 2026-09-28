import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/** Locale-aware navigation primitives. Always use these instead of `next/link` for internal routes. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
