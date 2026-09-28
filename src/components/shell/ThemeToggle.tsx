'use client';

import { useSyncExternalStore } from 'react';
import { IconButton } from '@/components/ui/actions';
import { MoonIcon, SunIcon } from '@/components/icons';

type Theme = 'dark' | 'light';
const STORAGE_KEY = 'theme';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

/**
 * Dark is the primary brand expression and the default. Light is an opt-in readability mode.
 * The choice persists in localStorage and is applied before paint by the inline script in the
 * root layout (no flash). Storage failures are ignored — the site still works in dark mode.
 */
export function ThemeToggle({ labels }: { labels: { toLight: string; toDark: string } }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'dark' as Theme);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode / blocked storage: preference simply isn't remembered */
    }
  }

  return (
    <IconButton label={next === 'light' ? labels.toLight : labels.toDark} onClick={toggle}>
      {theme === 'dark' ? <SunIcon className="size-4.5" /> : <MoonIcon className="size-4.5" />}
    </IconButton>
  );
}

/** Runs before first paint (inline in <head>). Keep tiny; mirrors STORAGE_KEY above. */
export const themeInitScript = `try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
