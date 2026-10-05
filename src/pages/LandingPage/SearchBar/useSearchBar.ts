import type { TargetedEvent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

export function useSearchBar(onSubmit: (kanjiInputValue: string) => void) {
  const [kanjiInputValue, setKanjiInputValue] = useState("");
  const kanjiInputRef = useRef<HTMLInputElement>(null);
  const isComposingKanjiInput = useRef(false);

  // Native listeners: Preact 10 maps onCompositionStart to the never-firing
  // "CompositionStart" (preactjs/preact#3003, fixed in v11). Revisit on upgrade.
  useEffect(() => {
    const input = kanjiInputRef.current;
    if (!input) {
      return;
    }
    const startComposing = () => {
      isComposingKanjiInput.current = true;
    };
    const endComposing = () => {
      isComposingKanjiInput.current = false;
    };
    input.addEventListener("compositionstart", startComposing);
    input.addEventListener("compositionend", endComposing);
    return () => {
      input.removeEventListener("compositionstart", startComposing);
      input.removeEventListener("compositionend", endComposing);
    };
  }, []);

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

  return { handleKanjiInput, handleSearchSubmit, kanjiInputRef, kanjiInputValue };
}
