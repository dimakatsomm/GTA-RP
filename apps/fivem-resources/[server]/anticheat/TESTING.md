# Manual Test Plan — anticheat

## Prerequisites

- FiveM server running with the `anticheat` resource started
- At least one player connected
- Server console accessible for kick/log verification

## Test Cases

### TC-01: Godmode player is kicked

**Steps:**

1. Use a trainer or resource to set a player's health above 200 (godmode).
2. Wait for the anticheat report interval (~2 seconds).
   **Expected:** The affected player is kicked with a message indicating a health anomaly. A server console log entry is printed.

### TC-02: Clean player passes the health check

**Steps:**

1. Connect a normal player with health ≤ 200 and no teleport activity.
2. Monitor for 30 seconds.
   **Expected:** Player is not kicked. No false positive in the console.

### TC-03: Teleport detection kicks on large position jump

**Steps:**

1. Use a teleport cheat to move a player more than 150 metres within a single 2-second report interval.
   **Expected:** Player is kicked with a teleport anomaly message. Console log entry is created.

### TC-04: Slow legitimate movement is not flagged

**Steps:**

1. Drive or fly a vehicle at full speed across a distance close to but under the teleport threshold for a 2-second window.
   **Expected:** Player is not kicked. No false positive.

### TC-05: Watchdog kicks disconnected-but-lingering players

**Steps:**

1. Spawn a player and then simulate a reporting stop (e.g., kill the anticheat client script without disconnecting).
2. Wait 10+ seconds.
   **Expected:** The watchdog detects the missing report and kicks the player.

### TC-06: Resource restart clears all player state

**Steps:**

1. Start the resource with several players connected (some near thresholds).
2. Restart the `anticheat` resource via server console (`restart anticheat`).
   **Expected:** All tracked state (positions, health snapshots, watchdog timers) is reset. No stale kicks occur after restart.
