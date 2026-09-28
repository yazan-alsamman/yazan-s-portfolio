import type { ReactNode } from 'react';
import { Container } from '@/components/ui/layout';
import { Label } from '@/components/ui/typography';
import { Divider } from '@/components/ui/surfaces';

/**
 * Page opening — the editorial counterpart of the landing identity: quiet label, one H1,
 * optional lead, a measured rule. Every content page starts here (single-H1 contract).
 */
export function PageIntro({
  label,
  title,
  lead,
  children,
}: {
  label: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="relative pt-16 pb-12 md:pt-24 md:pb-16 xl:pt-28">
      <Container className="flex flex-col gap-6">
        <Label>{label}</Label>
        <h1 className="max-w-[18ch] font-display text-h1 font-medium text-fg-strong">{title}</h1>
        {lead ? <p className="max-w-(--container-prose) text-lead text-fg-muted">{lead}</p> : null}
        {children}
        <Divider variant="measured" className="mt-6" />
      </Container>
    </header>
  );
}
