import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale: string = (await requestLocale) ?? 'en';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});