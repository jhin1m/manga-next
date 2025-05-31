import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale } from './config';

export default getRequestConfig(async () => {
  // Lấy locale từ cookie hoặc dùng default
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
