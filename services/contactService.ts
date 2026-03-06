const parseJson = async <T>(response: Response): Promise<T & { error?: string }> => {
  const raw = await response.text();
  return raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T & { error?: string });
};

export const contactService = {
  async submit(payload: { name: string; email: string; subject: string; message: string }): Promise<void> {
    const response = await fetch('/api/public/contact', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await parseJson<{ ok: boolean }>(response);
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
  },
};
