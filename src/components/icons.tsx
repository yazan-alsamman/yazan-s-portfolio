import type { SVGProps } from 'react';

/** Minimal inline icon set (1.5px strokes, currentColor). Decorative by default — pair with visible text or aria-label. */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

/** Points toward the inline-end. Mirror in RTL with `rtl:-scale-x-100`. */
export function ArrowIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10h11.5M11 5.5 15.5 10 11 14.5" />
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 14 14 6M7.5 6H14v6.5" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7h14M3 13h14" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="10" r="3.25" />
      <path d="M10 2.5v1.5M10 16v1.5M2.5 10H4M16 10h1.5M4.7 4.7l1.06 1.06M14.24 14.24l1.06 1.06M4.7 15.3l1.06-1.06M14.24 5.76l1.06-1.06" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15.5 12.2A6.5 6.5 0 0 1 7.8 4.5a6.5 6.5 0 1 0 7.7 7.7Z" />
    </svg>
  );
}
