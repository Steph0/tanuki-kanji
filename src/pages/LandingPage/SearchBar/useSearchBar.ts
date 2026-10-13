import type { TargetedEvent } from "preact";
import { useRef, useState } from "preact/hooks";
import {
  KANJI_INPUT_VALIDATION_STATUS,
  parseKanjiInputAPI,
} from "../../../services/engine/controller/kanji-input/parseKanjiInputApi.ts";
import { isKanjiSubmitBlocked, truncateKanjiInput } from "./kanjiInputDisplay.ts";
import { useIMECompositionGuard } from "./useIMECompositionGuard.ts";
import { useKanjiInputValidation } from "./useKanjiInputValidation.ts";

export function useSearchBar(onSubmit: (kanjiInputValue: string) => void) {
  const [kanjiInputValue, setKanjiInputValue] = useState("");

  const kanjiInputRef = useRef<HTMLInputElement>(null);
  const { isComposing, submitBlockRef } = useIMECompositionGuard(kanjiInputRef);
  // Validation not taken into account until composition is done
  const { tone: kanjiInputTone, message: kanjiInputMessage } = useKanjiInputValidation(kanjiInputValue, isComposing);
  const isSearchSubmitDisabled = isKanjiSubmitBlocked(kanjiInputTone);

  function handleKanjiInput(event: TargetedEvent<HTMLInputElement>) {
    setKanjiInputValue(event.currentTarget.value);
  }

  function handleSearchSubmit(event: TargetedEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitBlockRef.current) {
      return;
    }
    // Sync validation : for a brief moment during an UI redraw,
    // user can input and submit invalid kanji using enter
    const submittedKanjiInput = truncateKanjiInput(kanjiInputValue);
    const parseResult = parseKanjiInputAPI(submittedKanjiInput);
    if (parseResult.status !== KANJI_INPUT_VALIDATION_STATUS.VALID) {
      return;
    }
    onSubmit(parseResult.value);
  }

  return {
    handleKanjiInput,
    handleSearchSubmit,
    isSearchSubmitDisabled,
    kanjiInputMessage,
    kanjiInputRef,
    kanjiInputTone,
    kanjiInputValue,
  };
}
