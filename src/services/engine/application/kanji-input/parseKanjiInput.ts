import type { KanjiInputResult } from "../../domain/kanji-input/KanjiInput.ts";
import { KanjiInput } from "../../domain/kanji-input/KanjiInput.ts";

export function parseKanjiInput(raw: string): KanjiInputResult {
  return KanjiInput.create(raw);
}
