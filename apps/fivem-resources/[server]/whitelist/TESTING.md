# Manual Test Plan — whitelist

## Prerequisites

- FiveM server running with the `whitelist` resource started
- At least one admin player connected with the `command.whitelist` ACE permission
- A second client available for connection tests

## Test Cases

### TC-01: Whitelisted player can connect

**Steps:**

1. Add a player's license identifier via the `whitelist add <license>` command.
2. Have that player attempt to connect to the server.
   **Expected:** Connection is allowed. Player loads into the server without a rejection deferral.

### TC-02: Non-whitelisted player is rejected

**Steps:**

1. Ensure a player's license is NOT in the whitelist.
2. Have that player attempt to connect.
   **Expected:** Connection is deferred and ultimately rejected with a message indicating they are not whitelisted.

### TC-03: `whitelist add` adds an identifier

**Steps:**

1. Run `whitelist add license:abc123` in the server console or as an admin in-game.
   **Expected:** Console/chat confirms the identifier was added. Subsequent connection attempts by that identifier succeed (TC-01).

### TC-04: `whitelist remove` removes an identifier

**Steps:**

1. Ensure a player is whitelisted.
2. Run `whitelist remove license:abc123`.
   **Expected:** Confirmation printed. The player can no longer connect (TC-02).

### TC-05: `whitelist list` shows current entries

**Steps:**

1. Whitelist a few identifiers.
2. Run `whitelist list`.
   **Expected:** All whitelisted identifiers are printed. No duplicates.

### TC-06: `whitelist pending` shows pending applicants

**Steps:**

1. Have a non-whitelisted player attempt to connect (they will appear in the pending ring buffer).
2. Run `whitelist pending`.
   **Expected:** The player's identifier appears in the pending list.

### TC-07: `whitelist add-pending <n>` approves a pending applicant

**Steps:**

1. Ensure there is at least one pending applicant (TC-06).
2. Run `whitelist add-pending 1` (or the relevant index).
   **Expected:** The applicant's identifier is moved to the whitelist. They can now connect (TC-01).

### TC-08: Pending list caps at 20 entries

**Steps:**

1. Have 21 distinct non-whitelisted players attempt to connect in sequence.
   **Expected:** Only 20 entries appear in `whitelist pending`. The oldest entry is evicted when the 21st arrives.

### TC-09: `exports.whitelist.isWhitelisted` returns correct values

**Steps:**

1. From another resource, call `exports.whitelist:isWhitelisted(<license>)` for a whitelisted and a non-whitelisted identifier.
   **Expected:** Returns `true` for the whitelisted one and `false` for the other.
