import { useEffect, useReducer, useRef } from "preact/hooks";
import type { OpenRouterSessionAPI } from "../../../services/engine/controller/openrouter-session/openRouterSessionApi.ts";
import { initialSettingsState, settingsReducer } from "./settingsState.ts";

const CONNECTION_ERROR = "Could not connect to OpenRouter. Please try again.";

export function useSettings(openRouterSession: OpenRouterSessionAPI, navigate: (url: string) => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const connectActionRef = useRef<HTMLButtonElement>(null);
  const shouldFocusConnectAction = useRef(false);
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

  useEffect(() => {
    if (shouldFocusConnectAction.current) {
      shouldFocusConnectAction.current = false;
      connectActionRef.current?.focus();
    }
  }, [state]);

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
    dispatch({ type: "errorDismissed" });
    triggerRef.current?.focus();
  }

  function cancel(event: Event) {
    event.preventDefault();
    close();
  }

  function failConnection() {
    dispatch({ type: "failed", message: CONNECTION_ERROR });
  }

  async function finishAuthorization() {
    const result = await openRouterSession.completeAuthorization();
    if (result.status === "failed") {
      failConnection();
      return;
    }
    if (result.status === "connected" && !openRouterSession.hasSession()) {
      failConnection();
      return;
    }
    dispatch({ type: "completed", connected: openRouterSession.hasSession() });
    close();
  }

  async function startAuthorization() {
    const result = await openRouterSession.beginAuthorization();
    if (result.status !== "ready") {
      failConnection();
      return;
    }
    const authorizationUrl = result.authorizationUrl;
    try {
      navigate(authorizationUrl);
    } catch (failure) {
      console.error(failure);
      failConnection();
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
    shouldFocusConnectAction.current = true;
    dispatch({ type: "disconnected" });
  }

  return {
    dialogRef,
    triggerRef,
    closeButtonRef,
    connectActionRef,
    state,
    open,
    close,
    cancel,
    connect,
    disconnect,
  };
}
