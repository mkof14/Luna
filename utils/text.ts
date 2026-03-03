export const normalizeUserText = (value: string) =>
  value.replace(/\s+/g, ' ').trim();

export const hasMeaningfulText = (value: string) =>
  normalizeUserText(value).length > 0;
