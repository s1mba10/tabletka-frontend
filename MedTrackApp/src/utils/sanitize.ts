export const sanitizeText = (value: string, maxLength: number) =>
  value.replace(/\s+/g, ' ').trim().slice(0, maxLength);

export const sanitizeNumber = (value: string, maxLength: number, decimals = 3) => {
  const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
  const [intPart, fracPart = ''] = sanitized.split('.');
  const trimmedInt = intPart.slice(0, maxLength);
  const trimmedFrac = fracPart.slice(0, decimals);
  return trimmedFrac.length > 0 ? `${trimmedInt}.${trimmedFrac}` : trimmedInt;
};
