import { KANJI_INPUT_MAX_LENGTH, KanjiInputStatus, safeParseKanjiInput } from "../../../services/validate.ts";

export type KanjiInputTone = "clean" | "empty" | "warning" | "error";

export type KanjiInputDisplay = { tone: KanjiInputTone; message: string | null };

const INVALID_CHARACTERS_MESSAGE = "Only Kanji, hiragana and katakana characters are allowed";
const MISSING_KANJI_MESSAGE = "Enter at least one kanji.";
const OVER_LIMIT_WARNING_MESSAGE = "Whoa, long one! Tanuki keeps first 21 chars.";

export function truncateKanjiInput(kanjiInputValue: string): string {
  return kanjiInputValue.slice(0, KANJI_INPUT_MAX_LENGTH);
}

export function resolveKanjiInputDisplay(kanjiInputValue: string): KanjiInputDisplay {
  const truncatedValue = truncateKanjiInput(kanjiInputValue);
  const truncatedStatus = safeParseKanjiInput(truncatedValue).status;
  if (isValidInput(truncatedStatus, kanjiInputValue)) {
    return { tone: "clean", message: null };
  }
  if (truncatedStatus === KanjiInputStatus.INVALID_CHARACTERS) {
    return { tone: "error", message: INVALID_CHARACTERS_MESSAGE };
  }
  if (truncatedStatus === KanjiInputStatus.MISSING_KANJI) {
    return { tone: "error", message: MISSING_KANJI_MESSAGE };
  }
  if (kanjiInputValue.length > KANJI_INPUT_MAX_LENGTH) {
    return { tone: "warning", message: OVER_LIMIT_WARNING_MESSAGE };
  }
  return { tone: "empty", message: null };
}

export function isKanjiSubmitBlocked(tone: KanjiInputTone): boolean {
  if (tone === "clean") {
    return false;
  }
  if (tone === "warning") {
    return false;
  }
  return true;
}

function isValidInput(truncatedStatus: KanjiInputStatus, kanjiInputValue: string): boolean {
  return truncatedStatus === KanjiInputStatus.VALID && kanjiInputValue.length <= KANJI_INPUT_MAX_LENGTH;
}
