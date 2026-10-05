export type NormalizedKanjiInput = string & { readonly normalizedKanjiInput: unique symbol };

export function normalizeKanjiInput(raw: string): NormalizedKanjiInput {
  return raw.trim() as NormalizedKanjiInput;
}
