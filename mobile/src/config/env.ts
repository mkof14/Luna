const trim = (value?: string) => (value ?? '').trim();

export const env = {
  apiBaseUrl: trim(process.env.EXPO_PUBLIC_API_BASE_URL),
  appEnv: trim(process.env.EXPO_PUBLIC_APP_ENV) || 'development',
};

export const hasApiBaseUrl = Boolean(env.apiBaseUrl);
