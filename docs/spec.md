# JANK – Core Defender (Draft)

## High‑level vision
A fast, readable arena defense where the player controls a powerful stationary core. The core floats over a hexagonal hive of tiles. Tiles are purely visual: a living array that amplifies the core’s presence with dramatic waves (ripples, shockwaves, bursts) reacting to combat. Meta upgrades persist across runs and grow the core into an end‑game powerhouse.

## Design pillars
- Powerful core: clear power fantasy that scales with meta progression.
- Hive visuals as extension of the core: tiles communicate impact, rhythm and threat.
- Clarity and minimal rules: easy to read, few systems, high feedback.
- Short runs, long tail: roguelike meta loop that rewards learning and investment.

## Player fantasy
You are the Core: a sentient defense construct. You don’t move; you dominate. Enemies swarm from the dark and are erased by energy arcs and pulses. The hive tiles echo your every action.

## Core gameplay loop (in‑run)
1. Spawn wave (3 escalating rounds per wave).
2. Core auto‑targets and auto‑attacks (melee if close, ranged otherwise).
3. On attack/hit, the hive emits VFX (ripple/shock/burst) for impact readability and spectacle.
4. Survive the wave → advance difficulty; on death → end run.

## Meta progression (between runs)
- Earn Core‑Upgrade points from milestones (waves cleared, elites, bosses).
- Spend points to unlock/upgrade persistent perks. Example tracks:
  - Survivability: max HP, regen, damage reduction, shield on hit.
  - Damage: base damage, crit chance/multiplier, damage over time.
  - Tempo: attack speed, cooldown reduction, overdrive windows.
  - Reach/Control: melee range, ranged range, projectile count, knockback/stun chance.
- Optional unlocks: new enemy sets, visual variants, soundtrack layers.

## Combat
- Core automatically attacks based on proximity (melee vs ranged). No kiting/movement.
- Enemies have simple roles (charger, tank, shooter) with scaling HP/damage.
- Difficulty ramps via spawn frequency, composition, and minor enemy modifiers.

## Tiles (visual only)
- Purpose: communicate the core’s heartbeat and combat impacts.
- Behaviors:
  - Idle heartbeat: subtle global pulse (lab‑like energy slab vibe).
  - Ripple (Core attack executed): ring from center out.
  - Shockwave (Core takes damage): strong outward pulse from core position.
  - Local burst (enemy melee impact): small, sharp splash near impact.
- Grid size: can expand across stages/waves for spectacle; expansion is visual, not gameplay.
- No tile types, no tile buffs, no placement rules.

## Waves & escalation
- Each wave has 3 rounds; round count, spawn rate and enemy mix escalate.
- Periodic elite/boss rounds to punctuate pacing and award extra meta currency.

## Controls & UX (MVP)
- Minimal controls (start, pause, restart). No movement. Optional speed toggle later.
- Readability first: clean lighting, high contrast core/tile effects, sparse UI.

## Technical notes (current implementation)
- Visual hive is implemented; see `docs/hive-tiles.md`.
  - `TileVFXController` drives ripple/shock/burst waves.
  - `CoreEnemyVFXBridge` maps gameplay events (`AttackExecuted`, `DamageTaken`) to VFX.
  - Tiles share a unified material; spacing controlled via `tileSpacing`.
- Tiles have no gameplay components or effects.

## Non‑goals (MVP)
- No tile types or tile‑based buffs/debuffs.
- No player movement.
- No complex resource/crafting layers.

## Roadmap sketch
- MVP: core combat + waves + hive VFX + meta points earn/spend.
- Post‑MVP: elites/bosses, more enemy roles, unlock trees, difficulty modes, cosmetics.

## Open questions
- Meta economy pacing: how many points per wave and target run count per unlock?
- Boss cadence and unique mechanics.
- Long‑term cosmetics/FX unlocks tied to achievements.
