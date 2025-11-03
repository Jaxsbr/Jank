# Bug List

## Broken

- Tank enemy shows red color when applying stun effect (should not change color)
- Wave countdown showing decimals. only full or .5 number should be allowed
- Charger explosion shows default blue death effect instead of only orange burst: EventDispatcher uses Map iteration which is non-deterministic. When CombatSystem.handleChargerExplosion dispatches EntityDeath for charger, DeathEffectSystem may receive it BEFORE ChargerExplosion event (which adds charger to kamikazeChargers Set), causing Set check to fail. Fix: Either add isKamikaze flag to EntityDeath event, or use synchronous tracking before dispatch, or ensure ChargerExplosion listener runs first.

## Improve

### Visual/UI

- Stun effect on enemies not clear (show floating thunderbolt icon)
- Center tile loses 3d look while showing range attack effect (looks flat)
- Meta upgrades not clearly indicating purchased upgrades (fix typo: "purchaced" -> "purchased")
- Core flashes red on hit (ugly)

### Meta Progression System

- Meta progression balance: Can get stuck if unable to progress. Need per-session currency that persists across runs to purchase unlocked meta upgrades. Players should be able to earn currency by replaying to gradually unlock available upgrades.

### Wave Session

- Wave transitions: Show upgrade menu between waves
- Wave replay: Allow replaying easier waves
- Currency persistence: Death should wipe per-session currency but keep unlocked meta upgrades

