# Meta Upgrades

This document defines current MVP meta upgrades and serves as a backlog for future ideas.

## MVP Upgrades

### Level-Based Upgrades

Upgrades can have multiple levels that are purchased sequentially. Each level unlocks new functionality.

**Melee Range** (3 levels, kill points):
- Level 1: Extends melee range to 1 ring (base range * 1). Required to attack enemies beyond very close range.
- Level 2: Extends melee range to 2 rings (base range * 2).
- Level 3: Extends melee range to 3 rings (base range * 3).

**Melee Damage** (5 levels, kill points):
- Each level adds +25 melee damage
- Level 1: +25 damage (total: +25)
- Level 2: +50 damage (total: +50)
- Level 3: +75 damage (total: +75)
- Level 4: +100 damage (total: +100)
- Level 5: +125 damage (total: +125)

**Melee Knockback** (3 levels, kill points):
- Each level adds +1 knockback distance
- Level 1: +1 knockback distance
- Level 2: +2 knockback distance
- Level 3: +3 knockback distance
- Without this upgrade, there is no knockback on melee hits (default: 0)

**Stun Pulse** (2 levels, kill points + wave points):
- Level 1: Unlocks stun ability. Click button to stun all enemies within rings 0-2. 8-second cooldown, 2-second stun duration.
- Level 2: Upgrades to stun ALL active enemies regardless of distance. 8-second cooldown, 3-second stun duration.

**Multi-Melee** (5 levels, kill points):
- Each level adds +1 extra target to melee attacks
- Level 1: 1 extra target (primary + 1, total: 2 targets)
- Level 2: 2 extra targets (primary + 2, total: 3 targets)
- Level 3: 3 extra targets (primary + 3, total: 4 targets)
- Level 4: 4 extra targets (primary + 4, total: 5 targets)
- Level 5: 5 extra targets (primary + 5, total: 6 targets)
- Cost per level equals the level number (Level 1 = 1 KP, Level 2 = 2 KP, etc.)

**Ranged Pellet Attack** (2 levels, kill points):
- Level 1: Unlocks ranged attacks. Range 5.0, damage 2, cooldown 0.2s. Cost: 1 KP.
- Level 2: Enhanced stats. Range 6.0, damage 3, cooldown 0.15s. Cost: 2 KP.
- Ranged attacks fire orange pellet projectiles simultaneously with melee attacks when targets are in range.
- Visual feedback: center tile flashes orange when each ranged projectile is fired.

## Core Upgrades

Core upgrades are advanced enhancements that unlock new player control abilities or provide active/passive bonuses to the Core. These upgrades are typically unlocked with wave points and represent significant gameplay changes.

**Advanced Melee Targeting** (wave points):
- Unlocks at wave 1 milestone (costs 1 WP)
- Unlocks a toggle button on the right side of the screen that allows switching between two targeting modes:
  - **Nearest Mode**: Attacks the nearest enemy within melee range (default)
  - **Lowest HP Mode**: Attacks the enemy with the lowest HP within melee range
- Button displays current mode: "Target: Nearest" or "Target: Lowest HP"
- Clicking the button toggles between modes and immediately re-evaluates target selection
- Without this upgrade, core uses "grudge mode": picks the nearest target and attacks until it dies, ignoring other threats

### Runtime Application
- Represented via `MetaUpgradeComponent` on the core with fields:
  - `extraMeleeTargets`: number (0 default; equals multi-melee upgrade level: 1, 2, 3, 4, or 5)
  - `meleeRangeRings`: number (0 default; corresponds to melee-range upgrade level: 1, 2, or 3)
  - `stunPulseLevel`: number (0 default; corresponds to stun-pulse upgrade level: 1 or 2)
  - `meleeKnockbackLevel`: number (0 default; corresponds to melee-knockback upgrade level: 1, 2, or 3)
  - `rangedAttackLevel`: number (0 default; corresponds to ranged-attack upgrade level: 1 or 2)
  - `targetingMode`: `'nearest' | 'lowest'` ('nearest' default; only used when advanced-melee-targeting is unlocked)
- `MeleeAttackSystem` reads this component to determine effective target count and range.
- `AbilitySystem` reads `stunPulseLevel` to determine if ability is unlocked and which configuration to use.
- `KnockbackOnHitSystem` reads `meleeKnockbackLevel` to apply knockback only when level > 0, scaling distance by level.
- `RangedAttackSystem` reads `rangedAttackLevel` to determine if ranged attacks are unlocked and which configuration to use (range, damage, cooldown).
- `TargetingSystem` reads `targetingMode` when advanced-melee-targeting is unlocked:
  - Filters potential targets by effective melee range (base range * meleeRangeRings)
  - Applies targeting mode: 'nearest' finds closest enemy, 'lowest' finds enemy with lowest HP
  - When unlocked, replaces default "grudge mode" behavior
- Without rings (0), core base range is very short (0.4), requiring enemies to be nearly on the center tile.
- Range calculation: 0 rings = base range only; 1+ rings = base range * ring count.
- Stun ability only available when `stunPulseLevel > 0`.
- Knockback only applies when `meleeKnockbackLevel > 0`; each level adds +1 knockback distance.
- Ranged attacks only available when `rangedAttackLevel > 0`; stats determined by level via `RangedAttackConfig`.

### Purchase System
- Upgrades are purchased in the Upgrade Shop UI (accessible from Game Over screen).
- Level-based upgrades must be purchased sequentially (Level 1 → Level 2 → Level 3).
- Costs are configured per level in `MetaPointsConfig`.
- Purchased upgrades persist across runs via localStorage.
- Upgrades are applied to the core entity when a new run starts.

### Ability Button
- When any stun pulse level is active, a circular ability button appears at the bottom center of the screen.
- Button shows lightning bolt icon (⚡) when ready, or cooldown time (rounded to 0.5s) when on cooldown.
- Clicking the button executes the stun pulse ability based on current upgrade level.

### Targeting Mode Toggle
- When `advanced-melee-targeting` upgrade is purchased, a toggle button appears on the right side of the screen (centered vertically).
- Button displays current targeting mode: "Target: Nearest" or "Target: Lowest HP".
- Clicking toggles between modes and clears current target to force immediate re-evaluation.
- Mode persists during the game session and resets to 'nearest' on restart.

## Enemy Abilities

**Tank - Heavy Armor**:
- Immune to knockback effects
- Cannot be pushed by Core's melee knockback upgrade
- Maintains steady advance despite incoming attacks

**Charger - Kamikaze**:
- Explodes on contact with the Core
- Deals increased damage (15 vs normal 7) in small area on death
- Self-destructs instead of performing normal melee attack
- Creates dramatic threat requiring prioritization

## Rules and Constraints
- Upgrades are additive but clamped by `MetaUpgradeConfig` caps.
- Tiles remain VFX-only and are unaffected by upgrades.
- Future persistence/UI will write into `MetaUpgradeComponent` instead of systems.

## Future Ideas (Backlog)

### Damage & Combat
- flat damage increase per ring
- lifesteal on melee
- crit chance/damage mechanics
- Core melee attack speed increase: multi-level upgrade that reduces melee attack cooldown (e.g., -0.05s per level) to increase attack frequency.

### Abilities
- periodic shockwave on N kills
- % chance to chain lightning on hit
- on-kill explosion with radius scaling by rings
- Additional stun pulse visual effects (ripples, particle bursts, screen shake)

### Defense & Utility
- armor/resist per ring unlocked
- core regen out of combat

### Major Upgrades
- Core upgrade levelup: large step-change to core base stats (speed, HP, energy) and visual form (size, extra geometry). May also intensify select hive VFX. Gated to unlock only after certain other metas are acquired (TBD).
