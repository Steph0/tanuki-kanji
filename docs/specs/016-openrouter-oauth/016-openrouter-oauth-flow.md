# 016 - OpenRouter OAuth target flow

Target state after Tasks 1 to 9 of `016-openrouter-oauth.md`.
The two views below are complementary: the use cases and the OAuth round trip.

## 1. Use cases

```mermaid
flowchart TB
  L([Learner])

  UC1([Open Settings])
  UC2([Connect to OpenRouter])
  UC3([Disconnect])
  UC4([Close modal])
  UC5([Lesson uses session key])

  L --- UC1
  L --- UC2
  L --- UC3
  L --- UC4
  L --- UC5
```

## 2. OAuth round trip

```mermaid
sequenceDiagram
  actor L as Learner
  participant UI as Settings UI
  participant NAV as UI navigate capability
  participant API as API and Controller
  participant APP as Application
  participant BR as Browser infrastructure
  participant OR as OpenRouter
  participant ST as In-memory session

  L->>UI: Click Connect to OpenRouter
  UI->>UI: Disable action, show busy state
  UI->>API: beginAuthorization()
  API->>BR: Check isSecureContext, crypto.subtle, HTTPS or loopback
  alt Unsafe origin, crypto failure, storage failure, or link building failure
    API-->>UI: refused
    UI->>UI: Re-enable action, show generic error
  else Prepared
    API->>APP: Run begin use case
    APP->>BR: Generate verifier and state, derive S256 challenge
    APP->>BR: Save pending verifier, state, createdAt
    APP->>BR: Build callback_url from BASE_URL and origin
    APP->>BR: Build authorization URL with callback_url, state, challenge, and label
    APP-->>API: ready with authorization URL
    API-->>UI: ready with authorization URL
    Note over UI: URL used once from a local value<br>never rendered, stored, or logged.
    UI->>NAV: navigate(authorizationUrl)
    alt Navigation throws
      NAV-->>UI: throw
      UI->>UI: Re-enable action, show generic error
      Note over UI,BR: Start failed<br>pending record expires or is overwritten.
    else Page leaves
      NAV->>OR: Same-tab location.replace
      L->>OR: Approve the app
      OR-->>BR: Redirect to callback_url with code and state
      Note over BR,API: main.tsx calls captureAuthorizationReturn() before render<br>engine captures code, state, and error in memory<br>history.replaceState strips the query and preserves path, hash, and unrelated parameters.
      UI->>API: captureAuthorizationReturn() on mount returns true
      UI->>UI: Open modal in connecting state
      UI->>API: completeAuthorization()
      API->>APP: Take captured return synchronously
      APP->>BR: Read pending record
      alt Missing or expired record, state mismatch, provider error, unsafe origin, or cleanup failure
        APP-->>API: failed
        API-->>UI: failed
        UI->>UI: Show generic error, no session saved
      else Valid return
        APP->>BR: Clear pending record before exchange
        APP->>OR: POST /api/v1/auth/keys with code, verifier, S256
        alt Exchange or save failure
          OR-->>APP: Error status or invalid answer
          APP-->>API: failed
          API-->>UI: failed
          UI->>UI: Show generic error, no session saved
        else Valid key
          OR-->>APP: JSON with key
          APP->>ST: Save OpenRouterSession in memory only
          APP-->>API: connected
          API-->>UI: connected
          UI->>UI: Close modal, flip trigger to connected
        end
      end
    end
  end

  Note over UI,ST: Disconnect clears the in-memory session<br>keeps the modal open, returns to disconnected content<br>the key remains in OpenRouter until revoked on the keys page.
```

## Product copy

| State | User-visible copy | Actions |
| --- | --- | --- |
| Disconnected | Title: `Connect to OpenRouter`. Body: `Connect your OpenRouter account to use your own credits for lessons.` Footnote: `Your key stays in memory for this tab and is never saved. Reloading disconnects it.` | `Connect to OpenRouter` |
| Connecting | Title: `Connecting to OpenRouter`. Body: `Finishing sign-in. This takes a moment.` | None |
| Connected | Title: `OpenRouter connected`. Body: `Your OpenRouter account is connected. Your key stays in memory for this tab and is never saved. Reloading disconnects it.` Note: `Disconnecting forgets the key in this tab. The key stays in your OpenRouter account until you revoke it.` | `Disconnect`, `Revoke in OpenRouter` |
| Failure | Error under the action: `Could not connect to OpenRouter. Please try again.` | Retry with the main action |

- Trigger names: `Settings, OpenRouter not connected` and
  `Settings, OpenRouter connected`.
- Tooltips: `OpenRouter sign-in` and `OpenRouter account`.
- Close button: `Close settings`.
- Revocation link opens `https://openrouter.ai/keys` in a new tab with
  `rel="noopener noreferrer"` and the accessible name
  `Revoke in OpenRouter (opens in a new tab)`.
- Close paths: cross, Escape, and backdrop. A click inside the panel does not
  close. Focus returns to the trigger, and focus moves to the Connect action
  after Disconnect.

## Invariants

- The UI never receives the key, code, verifier, or session directly.
- The engine prepares the one-shot authorization URL. The UI performs a
  same-tab `location.replace` through an injected `navigate` capability, and
  never parses the URL, reads `state`, stores, renders, or logs the URL.
- `captureAuthorizationReturn` is synchronous and idempotent. It runs after
  the browser returns and before the first render, and its answer feeds
  `completeAuthorization`; a cleanup failure never starts an exchange.
- Only the verifier, state, and creation time touch `sessionStorage`. The
  record is removed before the exchange and expires after ten minutes.
- `beginAuthorization` answers `ready` or `refused`; `completeAuthorization`
  answers `none`, `failed`, or `connected`; neither entry rejects.
- A navigation throw is a UI start failure: the action re-enables, the generic
  error appears, no session is stored, and any pending record expires or is
  overwritten.
- The exchange has no Authorization header, omits credentials, refuses
  redirects, uses CORS, sends no referrer, disables cache, aborts after fifteen
  seconds, and never retries.
- Failure logs contain only an HTTP status and a safe local cause name.
- The UI has one connection error:
  `Could not connect to OpenRouter. Please try again.`
- The key is memory-only. Reload disconnects the tab.
- The development environment key is a fallback only under
  `import.meta.env.DEV`. Production never uses it. No build-time guard is added.
- The connected view links to `https://openrouter.ai/keys` for revocation.
- Tests stay offline and never call OpenRouter.
