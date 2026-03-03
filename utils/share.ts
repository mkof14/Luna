export type ClipboardApi = {
  writeText: (text: string) => Promise<void>;
};

export type ShareApi = {
  share: (data: { title?: string; text: string }) => Promise<void>;
};

export type ShareEnvironment = {
  clipboard?: ClipboardApi;
  share?: ShareApi['share'];
};

export type ShareTextResult = 'shared' | 'copied' | 'failed';

const defaultEnv = (): ShareEnvironment => {
  if (typeof navigator === 'undefined') return {};
  return {
    clipboard: navigator.clipboard,
    share: navigator.share?.bind(navigator),
  };
};

export const copyTextSafely = async (
  text: string,
  env: ShareEnvironment = defaultEnv()
): Promise<boolean> => {
  if (!text || !env.clipboard?.writeText) return false;
  try {
    await env.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const shareTextSafely = async (
  text: string,
  title?: string,
  env: ShareEnvironment = defaultEnv()
): Promise<ShareTextResult> => {
  if (!text) return 'failed';

  if (env.share) {
    try {
      await env.share({ title, text });
      return 'shared';
    } catch {
      // fall through to clipboard fallback
    }
  }

  const copied = await copyTextSafely(text, env);
  return copied ? 'copied' : 'failed';
};
