# Manual Test Plan — mdt

## Prerequisites

- FiveM server running with the `mdt` resource started
- At least one player connected with the `police` job and a valid badge number
- Backend ingest endpoint accessible (`FIVEM_INGEST_TOKEN` configured)
- NATS running and `NATS_AUTH_TOKEN` set (production) or NATS bound to localhost (dev)

## Test Cases

### TC-01: Officer logs an arrest successfully

**Steps:**

1. Connect as a player with `job = police` and a non-empty badge number.
2. Open the MDT NUI (trigger `mdt:open` or use the in-game command).
3. Fill in a valid suspect server ID, at least one charge, and coordinates.
4. Submit the arrest form.
   **Expected:** Server responds with `{ ok = true }`. A `arrest.made` event is POSTed to the backend ingest endpoint. No error is shown in the NUI.

### TC-02: Invalid badge number is rejected

**Steps:**

1. Connect as a player whose officer record has an empty or nil badge number.
2. Attempt to submit an arrest via `mdt:makeArrest`.
   **Expected:** Server responds with `{ ok = false, reason = "officer identity could not be verified" }`. No event is sent to the backend.

### TC-03: Invalid suspect ID is rejected

**Steps:**

1. Connect as a valid officer.
2. Submit an arrest with a `suspectId` that is not an active player on the server (e.g., 9999).
   **Expected:** Server returns an error response indicating suspect not found. No backend event fires.

### TC-04: Empty charge list is rejected

**Steps:**

1. Connect as a valid officer.
2. Submit an arrest with an empty `charges` array.
   **Expected:** Server rejects with a validation error. No event fires.

### TC-05: Self-arrest is rejected

**Steps:**

1. Connect as a valid officer.
2. Submit an arrest where `suspectId` equals the officer's own server ID.
   **Expected:** Server rejects the request with a self-arrest error message.

### TC-06: Arrest event fires to backend

**Steps:**

1. Enable backend request logging.
2. Perform a valid arrest (TC-01).
   **Expected:** Backend `/events` endpoint receives a POST with body `{ type: "arrest.made", payload: { ... } }` and the `x-fivem-ingest-token` header matches `FIVEM_INGEST_TOKEN`.

### TC-07: Arrest cooldown prevents duplicate submissions

**Steps:**

1. Perform a valid arrest (TC-01).
2. Immediately attempt another arrest for the same suspect within 10 seconds.
   **Expected:** Second submission is rejected due to the 10-second cooldown per officer.
