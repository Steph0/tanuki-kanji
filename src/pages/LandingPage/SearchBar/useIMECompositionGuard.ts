import type { RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";

export function useIMECompositionGuard(kanjiInputRef: RefObject<HTMLInputElement>) {
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
  }, [kanjiInputRef]);

  return isComposingKanjiInput;
}
