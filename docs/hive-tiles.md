# Hive Tiles: Visual System Overview

This doc explains how the unified, visual-only tile system works and how to extend it.

## Goals
- All tiles share one sterile, lab-like appearance
- Tiles act as a visual “hive” controlled by a central origin (center tile)
- No gameplay effects on tiles; visuals only
- Core/enemy actions drive dramatic array-wide VFX

## Key Files
- `src/tiles/configs/TileAppearanceConfig.ts`
  - `tileSize`: geometry size for each hex (smaller = more gap)
  - `tileSpacing`: grid placement spacing (bigger than `tileSize` to create gaps)
  - `defaultMaterial`: base PBR look (color/roughness/metalness)
  - `idleEmissiveColor`: emissive color used by idle heartbeat
- `src/tiles/TileFactory.ts`
  - Builds tiles with the unified material
  - Uses `tileSpacing` for placement to ensure visible gaps
- `src/tiles/components/TileVisualComponent.ts`
  - Three.js mesh/material and visual animation holder
  - Methods:
    - `setEmissive(color, intensity)` – set emissive state
    - `setTargetGlowIntensity(value)` – wave/proximity glow target
    - `updateGlowIntensity(delta, decay)` – interpolates toward target
    - `updateIdleHeartbeat(time, amplitude?, frequency?)` – global idle pulse
- `src/tiles/systems/TileAnimationSystem.ts`
  - Per-frame height, glow interpolation, and idle heartbeat
- `src/tiles/TileVFXController.ts`
  - Central VFX brain, maintains/advances active waves:
    - `ripple` (center-out), `shock` (impact), `burst` (local impact)
  - API:
    - `setTiles(entities)` – provide current tiles (called each frame in `main.ts`)
    - `setCenterFromGrid(tileGrid)` – detect center tile world position
    - `emitRippleFromCenter(strength?, speed?, falloff?)`
    - `emitShockwave(origin, strength?, radius?, speed?)`
    - `emitLocalBurst(origin, strength?)`
    - `flashCenterTile(color?, intensity?)` – direct center tile flash for instant feedback
    - `update(deltaTime)` – advances waves and writes glow targets to tiles
- `src/tiles/CoreEnemyVFXBridge.ts`
  - Listens to game events and triggers VFX:
    - Core `AttackExecuted` → ripple from center
    - Core `DamageTaken` → shockwave at core position
    - Core `RangedAttackExecuted` → flash center tile orange
    - Enemy `AttackExecuted` → local burst at target

## Event Types
Defined in `src/systems/eventing/EventType.ts`:
- `AttackExecuted` – melee/ranged attack fired
- `RangedAttackExecuted` – ranged pellet attack fired (triggers center tile flash)
- `DamageTaken` – entity took damage
- `CoreSpecialAttack`, `CoreHit` (optional custom hooks also handled by VFXController if dispatched)

## Tuning Visuals
- Idle heartbeat
  - `TileVisualComponent` constructor: `baseEmissiveIntensity`
  - `updateIdleHeartbeat`: `amplitude`, `frequency`
- Waves
  - `TileVFXController` ctor: `pulseStrength`, `shockwaveStrength`
  - `calculateWaveIntensity`: per-type multipliers
  - `emit…` methods: `speed`, `maxRadius`
- Gaps/size
  - `TileAppearanceConfig.tileSize` (geometry) vs `tileSpacing` (placement)

## Trigger Effects Manually
```ts
// Ripple from center
tileVFXController.emitRippleFromCenter(2.0, 5.0, 0.6);
// Shockwave at position
tileVFXController.emitShockwave(new THREE.Vector3(0, 0, 0), 1.8, 12.0, 8.0);
// Local burst near an impact point
tileVFXController.emitLocalBurst(new THREE.Vector3(3, 0, 3), 1.2);
// Flash center tile with color/intensity
tileVFXController.flashCenterTile(0xFF6600, 1.5);
```
Or via events:
```ts
GlobalEventDispatcher.dispatch(new Event(EventType.AttackExecuted, {
  attacker: coreEntity,
  target: enemyEntity
}));
GlobalEventDispatcher.dispatch(new Event(EventType.DamageTaken, {
  target: coreEntity
}));
```

## Add a New Wave Type (example)
1) Extend `ActiveWave.kind` union in `TileVFXController` (e.g., `'scan'`)
2) Add `emitScan(origin, strength, speed)` that pushes a wave with its own `maxRadius`
3) Handle intensity for `'scan'` in `calculateWaveIntensity`

## Gotchas
- No gaps? Ensure `tileSpacing > tileSize`
- Heartbeat invisible? Raise base intensity and amplitude
- Waves flat? Increase type multipliers/strengths
- Always call `setTiles(...)` each frame before `update(...)`
