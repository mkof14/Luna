const trim = (value?: string) => (value ?? '').trim();

export const env = {
  apiBaseUrl: trim(process.env.EXPO_PUBLIC_API_BASE_URL),
  appEnv: trim(process.env.EXPO_PUBLIC_APP_ENV) || 'development',
};

export const hasApiBaseUrl = Boolean(env.apiBaseUrl);

export function validateEnv() {
  if (!env.apiBaseUrl) return;
  try {
    const parsed = new URL(env.apiBaseUrl);
    const isLocalHost = ['localhost', '127.0.0.1'].includes(parsed.hostname);
    if (env.appEnv === 'production' && parsed.protocol !== 'https:' && !isLocalHost) {
      // keep app bootable on devices even with temporary env mismatch
      console.warn('[luna-mobile][env] EXPO_PUBLIC_API_BASE_URL should use https in production.');
    }
  } catch (error) {
    console.warn(
      '[luna-mobile][env] Invalid EXPO_PUBLIC_API_BASE_URL value:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
