import { useEffect, useReducer, useRef } from "preact/hooks";
import type { OpenRouterSessionAPI } from "../../../services/engine/controller/openrouter-session/openRouterSessionApi.ts";
import { initialSettingsState, settingsReducer } from "./settingsState.ts";

const CONNECTION_ERROR = "Could not connect to OpenRouter. Please try again.";

export function useSettings(openRouterSession: OpenRouterSessionAPI, navigate: (url: string) => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [state, dispatch] = useReducer(settingsReducer, undefined, () =>
    initialSettingsState(openRouterSession.hasSession()),
  );

  useEffect(() => {
    if (openRouterSession.captureAuthorizationReturn()) {
      dispatch({ type: "returnCaptured" });
      open();
      void finishAuthorization();
    }
  }, []);

  function open() {
    const dialog = dialogRef.current;
    if (dialog !== null && !dialog.open) {
      dialog.showModal();
    }
    closeButtonRef.current?.focus();
  }

  function close() {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    }
    dispatch({ type: "errorDismissed", connected: openRouterSession.hasSession() });
    triggerRef.current?.focus();
  }

  function cancel(event: Event) {
    event.preventDefault();
    close();
  }

  async function finishAuthorization() {
    const result = await openRouterSession.completeAuthorization();
    if (result.status === "failed") {
      dispatch({ type: "failed", message: CONNECTION_ERROR });
      return;
    }
    dispatch({ type: "completed", connected: openRouterSession.hasSession() });
    close();
  }

  async function startAuthorization() {
    const result = await openRouterSession.beginAuthorization();
    if (result.status !== "ready") {
      dispatch({ type: "failed", message: CONNECTION_ERROR });
      return;
    }
    try {
      navigate(result.authorizationUrl);
    } catch (failure) {
      console.error(failure);
      dispatch({ type: "failed", message: CONNECTION_ERROR });
      return;
    }
    dispatch({ type: "navigationStarted" });
  }

  function connect() {
    dispatch({ type: "startRequested" });
    void startAuthorization();
  }

  function disconnect() {
    openRouterSession.disconnect();
    dispatch({ type: "disconnected" });
  }

  return {
    dialogRef,
    triggerRef,
    closeButtonRef,
    state,
    open,
    close,
    cancel,
    connect,
    disconnect,
  };
}
