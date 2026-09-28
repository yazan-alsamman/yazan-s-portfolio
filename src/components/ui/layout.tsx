import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Page frame: centered, max 90rem, fluid gutters (--gutter). */
export function Container({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('mx-auto w-full max-w-(--container-page) px-(--gutter)', className)} {...props} />
  );
}

const gaps = {
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-10',
  xl: 'gap-16',
} as const;

type StackProps<T extends ElementType> = {
  as?: T;
  gap?: keyof typeof gaps;
  direction?: 'column' | 'row';
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

/** Flex stack on the 4px spacing scale. Row stacks follow the document direction (RTL-safe). */
export function Stack<T extends ElementType = 'div'>({
  as,
  gap = 'md',
  direction = 'column',
  className,
  ...props
}: StackProps<T>) {
  // Narrowed to elements that accept className: R3F's global JSX augmentation (three.js elements)
  // otherwise widens ElementType to props where className is typed never.
  const Component = (as ?? 'div') as ElementType<{ className?: string }>;
  return (
    <Component
      className={cn('flex', direction === 'column' ? 'flex-col' : 'flex-row flex-wrap', gaps[gap], className)}
      {...props}
    />
  );
}

type SectionProps = ComponentPropsWithoutRef<'section'> & {
  /** Vertical rhythm. `hero` reserves more space for the future cinematic layer. */
  spacing?: 'default' | 'compact' | 'hero';
};

/** Landmark section. Pass `aria-labelledby` pointing at the section heading. */
export function Section({ spacing = 'default', className, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        spacing === 'default' && 'py-20 md:py-28 xl:py-36',
        spacing === 'compact' && 'py-12 md:py-16',
        spacing === 'hero' && 'pt-16 pb-20 md:pt-24 md:pb-28 xl:pt-32 xl:pb-36',
        className,
      )}
      {...props}
    />
  );
}
