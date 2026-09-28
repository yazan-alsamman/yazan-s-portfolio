import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Container, Section } from '@/components/ui/layout';
import { Heading, Label, Text } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/actions';

// SEO_MASTER §34: the 404 page is never indexed and always offers a way back.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });
  return (
    <Section spacing="hero">
      <Container className="flex flex-col items-start gap-8">
        <Label index="404">{t('notFoundHeading')}</Label>
        <Heading level={1} size="h1">
          {t('notFoundHeading')}
        </Heading>
        <Text variant="muted">{t('notFoundBody')}</Text>
        <ButtonLink href="/" variant="secondary">
          {t('backHome')}
        </ButtonLink>
      </Container>
    </Section>
  );
}
