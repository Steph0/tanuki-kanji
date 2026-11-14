import { useRef, useState } from "preact/hooks";

export function useIMECompositionGuard() {
  // Synchronous guard for submits that can fire in the same tick as a
  // composition event; the isComposing state alone lags by a render.
  const submitBlockRef = useRef(false);

  // The UI shows composition
  const [isComposing, setIsComposing] = useState(false);

  function handleCompositionStart() {
    submitBlockRef.current = true;
    setIsComposing(true);
  }

  function handleCompositionEnd() {
    submitBlockRef.current = false;
    setIsComposing(false);
  }

  return { isComposing, submitBlockRef, handleCompositionStart, handleCompositionEnd };
}
