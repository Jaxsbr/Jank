# Meta Progression – Milestones to Test Full Loop

Goal: enable a repeatable loop in one session – play → die → upgrade → play again → progress further – without full persistence/UI scope creep.

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
- `MetaProgressionTestConfig`: milestone awards (existing; can be disabled when points loop is on).
- `MetaPointsConfig`: point awards per kill and/or per run, costs for upgrades.

## Technical Notes
- Keep tiles VFX-only per `docs/hive-tiles.md`.
- Prefer a small `MetaPointsService` session singleton to hold points and purchased levels; reset only on full refresh.
- Game-over overlay should be UI-only; systems pause via a simple `isGameOver` flag gate around the fixed-step updates.

## Done Definition (end-to-end test)
- I can play, die, see points earned, buy an upgrade, restart, observe stronger core, repeat, and progress further — all without reloading the page.
