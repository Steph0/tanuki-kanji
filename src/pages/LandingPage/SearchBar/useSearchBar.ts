import type { TargetedEvent } from "preact";
import { useRef, useState } from "preact/hooks";
import { useIMECompositionGuard } from "./useIMECompositionGuard.ts";
import { useKanjiInputValidation } from "./useKanjiInputValidation.ts";

export function useSearchBar(onSubmit: (kanjiInputValue: string) => void) {
  const [kanjiInputValue, setKanjiInputValue] = useState("");

  const kanjiInputRef = useRef<HTMLInputElement>(null);
  const { isComposing, submitBlockRef } = useIMECompositionGuard(kanjiInputRef);
  // Validation not takent into account until composition is done
  const { isSearchSubmitDisabled, kanjiInputMessage } = useKanjiInputValidation(kanjiInputValue, isComposing);

  const handleKanjiInput = (event: TargetedEvent<HTMLInputElement>) => {
    setKanjiInputValue(event.currentTarget.value);
  };

  const handleSearchSubmit = (event: TargetedEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitBlockRef.current) {
      return;
    }
    onSubmit(kanjiInputValue);
  };

  return {
    handleKanjiInput,
    handleSearchSubmit,
    isSearchSubmitDisabled,
    kanjiInputMessage,
    kanjiInputRef,
    kanjiInputValue,
  };
}
