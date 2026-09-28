import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { env } from '@/lib/env';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { Container, Section, Stack } from '@/components/ui/layout';
import { Heading, Label, Text } from '@/components/ui/typography';
import { Button, ButtonLink, TextLink } from '@/components/ui/actions';
import { Card, Divider, Surface, Tag } from '@/components/ui/surfaces';
import { MediaFrame } from '@/components/ui/media';

/**
 * Internal design-system preview — Phase 1 visual QA surface.
 * Disabled in production (DESIGN_PREVIEW), always noindex (metadata + X-Robots-Tag header),
 * excluded from the sitemap and disallowed in robots.txt. All copy here is labelled sample text.
 */
type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return buildPageMetadata({
    locale,
    path: '/design-system',
    title: t('meta.designSystemTitle'),
    description: t('designSystem.intro'),
    noindex: true,
  });
}

const colorTokens = [
  ['--bg', 'bg'],
  ['--bg-raised', 'bg-raised'],
  ['--surface', 'surface'],
  ['--line', 'line'],
  ['--line-strong', 'line-strong'],
  ['--fg-muted', 'fg-muted'],
  ['--fg', 'fg'],
  ['--fg-strong', 'fg-strong'],
  ['--accent', 'accent'],
  ['--accent-2', 'accent-2'],
  ['--link', 'link'],
  ['--success', 'success'],
  ['--warning', 'warning'],
] as const;

export default async function DesignSystemPage({ params }: Props) {
  if (!env.designPreview) notFound();
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'designSystem' });

  return (
    <>
      <Section spacing="compact">
        <Container>
          <Stack gap="md">
            <Label index="DS">{t('heading')}</Label>
            <Heading level={1} size="h1">
              {t('heading')}
            </Heading>
            <Text variant="muted">{t('intro')}</Text>
          </Stack>
        </Container>
      </Section>

      <Container>
        <Divider variant="measured" />
      </Container>

      <Section spacing="compact" aria-labelledby="ds-colors">
        <Container>
          <Stack gap="lg">
            <Heading level={2} size="h3" id="ds-colors">
              {t('colors')}
            </Heading>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
              {colorTokens.map(([variable, name]) => (
                <li key={variable} className="flex flex-col gap-2">
                  <span
                    className="block aspect-[4/3] rounded-sm border border-line-strong"
                    style={{ backgroundColor: `var(${variable})` }}
                  />
                  <code className="font-label text-xs text-fg-muted" dir="ltr">
                    {name}
                  </code>
                </li>
              ))}
            </ul>
          </Stack>
        </Container>
      </Section>

      <Section spacing="compact" aria-labelledby="ds-type">
        <Container>
          <Stack gap="lg">
            <Heading level={2} size="h3" id="ds-type">
              {t('typography')}
            </Heading>
            <p className="font-display text-display text-fg-strong">{t('sampleHeading')}</p>
            <p className="font-display text-h1 text-fg-strong">{t('sampleHeading')}</p>
            <p className="font-display text-h2 text-fg-strong">{t('sampleHeading')}</p>
            <p className="font-display text-h3 text-fg">{t('sampleHeading')}</p>
            <Text variant="lead">{t('sampleBody')}</Text>
            <Text>{t('sampleBody')}</Text>
            <Text variant="small">{t('sampleBody')}</Text>
            <Label index="01">{t('typography')}</Label>
          </Stack>
        </Container>
      </Section>

      <Section spacing="compact" aria-labelledby="ds-actions">
        <Container>
          <Stack gap="lg">
            <Heading level={2} size="h3" id="ds-actions">
              {t('buttons')}
            </Heading>
            <Stack direction="row" gap="sm" className="items-center">
              <Button withArrow>{t('primary')}</Button>
              <Button variant="secondary">{t('secondary')}</Button>
              <Button variant="ghost">{t('ghost')}</Button>
              <ButtonLink href="/" variant="secondary">
                {t('secondary')}
              </ButtonLink>
              <Button disabled>{t('primary')}</Button>
            </Stack>
            <Text>
              {t('sampleBody')} <TextLink href="/">{t('textLink')}</TextLink>
            </Text>
          </Stack>
        </Container>
      </Section>

      <Section spacing="compact" aria-labelledby="ds-surfaces">
        <Container>
          <Stack gap="lg">
            <Heading level={2} size="h3" id="ds-surfaces">
              {t('surfaces')}
            </Heading>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <Card
                title={t('cardTitle')}
                href="/design-system"
                media={
                  <MediaFrame
                    ratio="3/2"
                    alt=""
                    sizes="(min-width: 80rem) 30vw, (min-width: 48rem) 45vw, 100vw"
                    placeholderLabel={t('mediaCaption')}
                    className="[&>div]:rounded-none [&>div]:border-0"
                  />
                }
                meta={
                  <>
                    <Tag>{t('tag')}</Tag>
                    <Tag tone="accent">{t('tag')}</Tag>
                  </>
                }
              >
                {t('cardBody')}
              </Card>
              <Card title={t('cardTitle')}>{t('cardBody')}</Card>
              <Surface className="p-6">
                <Text variant="small">{t('cardBody')}</Text>
              </Surface>
            </div>
          </Stack>
        </Container>
      </Section>

      <Section spacing="compact" aria-labelledby="ds-layout">
        <Container>
          <Stack gap="lg">
            <Heading level={2} size="h3" id="ds-layout">
              {t('layout')}
            </Heading>
            <Divider />
            <Divider variant="measured" />
          </Stack>
        </Container>
      </Section>

      <Section spacing="compact" aria-labelledby="ds-media">
        <Container>
          <Stack gap="lg">
            <Heading level={2} size="h3" id="ds-media">
              {t('media')}
            </Heading>
            <div className="max-w-sm">
              <MediaFrame
                ratio="4/5"
                alt=""
                sizes="24rem"
                caption={t('mediaCaption')}
                placeholderLabel={t('mediaCaption')}
              />
            </div>
          </Stack>
        </Container>
      </Section>

      <Section aria-labelledby="ds-motion">
        <Container>
          <Stack gap="lg">
            <Heading level={2} size="h3" id="ds-motion">
              {t('motion')}
            </Heading>
            <div className="reveal">
              <Surface className="p-8">
                <Text>{t('revealDemo')}</Text>
              </Surface>
            </div>
          </Stack>
        </Container>
      </Section>
    </>
  );
}
