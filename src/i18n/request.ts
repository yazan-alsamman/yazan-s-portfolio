import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { messagesByLocale } from './messages';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: messagesByLocale[locale],
    // No silent fallback (ADR-006): a missing Arabic key is an error, never English text.
    onError(error) {
      throw error;
    },
  };
});
