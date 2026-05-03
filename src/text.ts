export function truncateMiddle(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  const headLength = Math.floor(maxChars * 0.65);
  const tailLength = Math.max(0, maxChars - headLength - 120);
  const omitted = text.length - headLength - tailLength;

  return [
    text.slice(0, headLength),
    `\n\n...[TRUNCATED ${omitted} chars FROM MIDDLE]...\n\n`,
    text.slice(text.length - tailLength),
  ].join("");
}

export function asJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
