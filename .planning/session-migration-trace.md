# Session Migration Trace — Phase 08

**Purpose:** Rubber-duck trace document required by D-07. Must exist before session migration code is written.
**Date:** 2026-04-15

---

## Section 1: Reason-Value Mappings (D-05)

| Old Event | Old Reason | New Event | New Reason |
|-----------|------------|-----------|------------|
| `session_switch` | `"new"` | `session_start` | `"new"` |
| `session_switch` | `"resume"` | `session_start` | `"resume"` |
| `session_fork` | (none) | `session_start` | `"fork"` |

**Source:** `packages/pi-coding-agent/src/core/extensions/types.ts` — `SessionStartEvent.reason` at line 448.

The `SessionStartEvent` interface (line 445) carries:
```typescript
interface SessionStartEvent {
  type: "session_start";
  reason: "startup" | "reload" | "new" | "resume" | "fork";
  previousSessionFile?: string;
}
```

The full reason union includes `"startup"` (cold start) and `"reload"` (hot reload) which did not exist on the old `session_switch` event. Extension handlers migrated from `on("session_switch")` to `on("session_start")` MUST guard against these additional reasons to preserve the original behavior.

**Emission sites in agent-session.ts:**
- Line 1610–1613: emits `session_switch` when creating a new session → migrates to `session_start(reason: "new")`
- Line 2433–2436: emits `session_switch` when resuming → migrates to `session_start(reason: "resume")`
- Line 2534–2537: emits `session_fork` after fork completes → migrates to `session_start(reason: "fork")`

---

## Section 2: Extension Author Migration Note (D-06)

When migrating extensions from the removed `session_switch` event to `session_start`:

**Before (old API):**
```typescript
extensions.on("session_switch", (event) => {
  // ran for every session switch (new or resume)
  cleanupPreviousSession(event.previousSessionFile);
});
```

**After (new API):**
```typescript
extensions.on("session_start", (event) => {
  // session_start fires for ALL session starts including cold startup and reload
  // guard required to preserve original behavior
  if (event.reason !== "new" && event.reason !== "resume") return;
  cleanupPreviousSession(event.previousSessionFile);
});
```

**Key migration rules:**
1. `on("session_switch", handler)` becomes `on("session_start", handler)` with a reason guard
2. Handlers must check `event.reason` to avoid running on `"startup"` or `"reload"` events
3. Example guard: `if (event.reason !== "new" && event.reason !== "resume") return;`
4. For fork-only logic: `if (event.reason !== "fork") return;`
5. `previousSessionFile` field is available on `SessionStartEvent` — no field migration needed (D-08)

**Callsites requiring migration (D-06):**
- `register-hooks.ts:89` — `on("session_switch")` handler
- `bg-shell-lifecycle.ts:97` — `on("session_switch")` handler; reads `event.previousSessionFile`
- `bg-shell-lifecycle.ts:396` — second `on("session_switch")` handler
- `mcp-client/index.ts:517` — `on("session_switch")` handler

---

## Section 3: Why SessionBeforeSwitchEvent Is NOT Used for Post-Switch Teardown (D-07)

`SessionBeforeSwitchEvent` (type: `"session_before_switch"`) fires **BEFORE** the session transition, not after. Its purpose is pre-switch cancellation and cleanup — it is the "are you sure?" gate, not the "clean up after me" gate.

**The distinction:**

| Event | Timing | Purpose |
|-------|--------|---------|
| `session_before_switch` | Before transition | Pre-switch cancellation / cleanup of the CURRENT session BEFORE it is replaced |
| `session_start` | After transition | Post-switch setup / cleanup of the PREVIOUS session after the NEW session is active |

**Why `bg-shell-lifecycle.ts` uses `session_start`, not `session_before_switch`:**

The cleanup logic in `bg-shell-lifecycle.ts` reads `previousSessionFile` to shut down background processes belonging to the previous session. This cleanup runs AFTER the new session is active — it tears down the old shell background processes once we know what session we switched away from. This is post-switch teardown, not pre-switch cancellation.

`SessionBeforeSwitchEvent` does carry a `targetSessionFile` field (the session we are switching TO), but it does NOT carry a `previousSessionFile` field. The `previousSessionFile` field is on `SessionStartEvent`, which fires AFTER the transition when both pieces of information (old and new session) are available.

**Conclusion:** Any handler that needs `previousSessionFile` must use `session_start`. Any handler that needs to cancel or veto an in-progress switch must use `session_before_switch`. The `bg-shell-lifecycle.ts` cleanup belongs in `session_start` handlers.
