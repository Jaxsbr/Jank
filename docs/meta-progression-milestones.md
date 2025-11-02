# Meta Progression – Milestones to Test Full Loop

**Current Status**: This document describes planned future work. The current implementation uses a temporary debug UI for testing upgrades (see `src/ui/DebugUI.ts`).

**Current Implementation**:
- `DebugUI`: Manual checkbox controls for testing meta upgrades (Ring 1/2/3 melee range, multi-melee)
- Upgrades are applied manually via debug UI (press 'D' to open)
- No automatic kill-based progression system
- No game over screen, no upgrade points, no upgrade menu between runs

**Roadmap** (not yet implemented):

## Milestone 1: Game Over + Restart (Run-only)
- Add game over state when core dies (listen for `EntityDeath` where entity is core).
- Show a simple overlay (text + button) with stats: time survived, enemies killed.
- Restart button: cleanly reset world (entities wiped, systems reinitialized), then start a new run.

Acceptance:
- Dying pauses gameplay updates and shows overlay.
- Clicking restart creates a fresh run reliably (no lingering entities/effects).

## Milestone 2: Upgrade Points (Session-Scoped, Run-only)
- Introduce session-only meta currency (e.g., `MetaPointsService`) that survives restarts but resets on full page refresh.
- Earning: award N points on game over based on total kills (config-driven curve: flat + per-kill).
- Display points on game-over overlay.

Acceptance:
- After dying, total points reflect the last run’s kills (per config).
- Points persist across restarts in the same browser session.

## Milestone 3: Minimal Upgrade Screen (Between Runs)
- After game over, present a very simple upgrade menu before restart:
  - Buttons to buy: `multi-melee` (cost X), `ring-2 melee range` (cost Y).
  - Costs and caps in config.
- Purchasing updates the core’s `MetaUpgradeComponent` defaults applied at the next run start.
- Disable buttons when unaffordable or already at cap.

Acceptance:
- Buying an upgrade spends points and changes the next run’s behavior accordingly.
- UI enforces costs/caps; cannot overspend.

## Milestone 4: Apply Upgrades on Run Start
- On new run creation, apply purchased upgrades by seeding the core with `MetaUpgradeComponent` values from the session service.
- Ensure `MeleeAttackSystem` already reads `MetaUpgradeComponent` (done) and clamps to `MetaUpgradeConfig`.

Acceptance:
- Upgrades purchased between runs are active from the first tick of the new run.

## Milestone 5: UX Polish and Feedback
- Add brief toast/label confirming awarded points at game over.
- Add subtle confirmation when purchasing an upgrade (sound/text).
- Optional: show current upgrade levels on overlay.

Acceptance:
- Clear feedback for points gained and upgrades bought.

## Configs (all typed, no magic numbers)
- `MetaUpgradeConfig`: caps/defaults (existing).
- `MetaPointsConfig`: point awards per kill and/or per run, costs for upgrades (to be created).

## Technical Notes
- Keep tiles VFX-only per `docs/hive-tiles.md`.
- Prefer a small `MetaPointsService` session singleton to hold points and purchased levels; reset only on full refresh.
- Game-over overlay should be UI-only; systems pause via a simple `isGameOver` flag gate around the fixed-step updates.

## Done Definition (end-to-end test)
- I can play, die, see points earned, buy an upgrade, restart, observe stronger core, repeat, and progress further — all without reloading the page.

## Current State (Temporary Debug Implementation)

As of now, meta upgrades can be tested manually via the Debug UI (press 'D' to open):
- Checkboxes for Ring 1/2/3 melee range (level-based, sequential validation)
- Checkbox for multi-melee (independent)
- Checkboxes for Stun Pulse Level 1/2 (level-based, sequential validation)
- Checkboxes for Ranged Attack Level 1/2 (level-based, sequential validation)
- Changes apply immediately to the core entity during gameplay

This debug implementation is temporary and will be replaced by the proper milestone system above.
