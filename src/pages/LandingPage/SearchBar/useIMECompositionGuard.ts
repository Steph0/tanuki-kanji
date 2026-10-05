import type { RefObject } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

export function useIMECompositionGuard(kanjiInputRef: RefObject<HTMLInputElement>) {
  // Allows to synchronize immediate composition event state with keyboard submission
  const submitBlockRef = useRef(false);

  // The UI shows composition
  const [isComposing, setIsComposing] = useState(false);

  // Native listeners: Preact 10 maps onCompositionStart to the never-firing
  // "CompositionStart" (preactjs/preact#3003, fixed in v11). Revisit on upgrade.
  useEffect(() => {
    const input = kanjiInputRef.current;
    if (!input) {
      return;
    }
    const startComposing = () => {
      submitBlockRef.current = true;
      setIsComposing(true);
    };
    const endComposing = () => {
      submitBlockRef.current = false;
      setIsComposing(false);
    };

    input.addEventListener("compositionstart", startComposing);
    input.addEventListener("compositionend", endComposing);

    return () => {
      input.removeEventListener("compositionstart", startComposing);
      input.removeEventListener("compositionend", endComposing);
    };
  }, [kanjiInputRef]);

  return { isComposing, submitBlockRef };
}
