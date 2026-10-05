import type { TargetedEvent } from "preact";
import { useRef, useState } from "preact/hooks";
import { useIMECompositionGuard } from "./useIMECompositionGuard.ts";
import { useKanjiInputValidation } from "./useKanjiInputValidation.ts";

export function useSearchBar(onSubmit: (kanjiInputValue: string) => void) {
  const [kanjiInputValue, setKanjiInputValue] = useState("");
  const kanjiInputRef = useRef<HTMLInputElement>(null);
  const isComposingKanjiInput = useIMECompositionGuard(kanjiInputRef);
  const { isSearchSubmitDisabled, kanjiInputMessage } = useKanjiInputValidation(kanjiInputValue);

  const handleKanjiInput = (event: TargetedEvent<HTMLInputElement>) => {
    setKanjiInputValue(event.currentTarget.value);
  };

  const handleSearchSubmit = (event: TargetedEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isComposingKanjiInput.current) {
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
