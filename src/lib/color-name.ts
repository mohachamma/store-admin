/** Translated name of a known color ("brown" → "بني"), or the name as the owner typed it. */
export function colorName(t: { has: (key: string) => boolean; (key: string): string }, name: string): string {
  const key = name.trim().toLowerCase();
  return key && t.has(key) ? t(key) : name;
}
