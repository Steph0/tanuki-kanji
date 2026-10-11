import { useEffect, useRef } from "preact/hooks";
import { type KanjiInputDisplay, resolveKanjiInputDisplay } from "./kanjiInputDisplay.ts";

export function useKanjiInputValidation(kanjiInputValue: string, isComposing: boolean): KanjiInputDisplay {
  return useIMECompositionSettledValidation(resolveKanjiInputDisplay(kanjiInputValue), isComposing);
}

/**
 * Returns the validation to show while IME composition may be in flight.
 *
 * The last settled value is memorized after repaint, never during render:
 * mid-composition keystrokes hold half-composed text, and live results for it
 * would flash false messages. Callers keep seeing the frozen value until
 * composition ends.
 *
 * @param liveValidation Validation computed from the current field value.
 * @param isComposing True while IME composition is in flight.
 * @returns The frozen value while composing, else the live validation.
 */
function useIMECompositionSettledValidation<T>(liveValidation: T, isComposing: boolean): T {
  const lastSettledValidation = useRef(liveValidation);
  useEffect(() => {
    if (!isComposing) {
      lastSettledValidation.current = liveValidation;
    }
  });
  return isComposing ? lastSettledValidation.current : liveValidation;
}
