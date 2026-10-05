import { useEffect, useRef } from "preact/hooks";
import { normalizeKanjiInput } from "../../../services/normalize.ts";
import { KanjiInputStatus, safeParseKanjiInput } from "../../../services/validate.ts";

const INVALID_CHARACTERS_MESSAGE = "Only Kanji, hiragana and katakana characters are allowed";
const MISSING_KANJI_MESSAGE = "Enter at least one kanji.";

const KANJI_INPUT_MESSAGES: Partial<Record<KanjiInputStatus, string>> = {
  [KanjiInputStatus.INVALID_CHARACTERS]: INVALID_CHARACTERS_MESSAGE,
  [KanjiInputStatus.MISSING_KANJI]: MISSING_KANJI_MESSAGE,
};

export function useKanjiInputValidation(kanjiInputValue: string, isComposing: boolean) {
  const normalizedKanjiInput = normalizeKanjiInput(kanjiInputValue);
  const parseResult = safeParseKanjiInput(normalizedKanjiInput);
  const kanjiInputStatus = parseResult.status;
  const liveValidation = {
    isSearchSubmitDisabled: kanjiInputStatus !== KanjiInputStatus.VALID,
    kanjiInputMessage: KANJI_INPUT_MESSAGES[kanjiInputStatus] ?? null,
  };

  // We only accept validation when IME composition has ended, rest is "mid-flight" text
  const lastSettledValidation = useRef(liveValidation);
  useEffect(() => {
    if (!isComposing) {
      lastSettledValidation.current = liveValidation;
    }
  });

  return isComposing ? lastSettledValidation.current : liveValidation;
}
