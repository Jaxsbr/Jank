# Meta Upgrades

This document defines current MVP meta upgrades and serves as a backlog for future ideas.

## MVP Upgrades (Run-only Prototype)

### Melee Range Upgrades
- ring-1 melee range: Core melee range extends to 1 ring (base range * 1). Required to attack enemies beyond very close range.
- ring-2 melee range: Core melee range extends to 2 rings (base range * 2).
- ring-3 melee range: Core melee range extends to 3 rings (base range * 3).
- multi-melee: Core melee attack hits an additional nearest enemy in range (primary + 1).

### Stun Pulse Ability
- stun-pulse-level-1: Unlocks stun ability. Click button to stun all enemies within rings 0-2. 8-second cooldown, 2-second stun duration.
- stun-pulse-level-2: Upgrades to stun ALL active enemies regardless of distance. 8-second cooldown, 3-second stun duration.

### Runtime Application
- Represented via `MetaUpgradeComponent` on the core with fields:
  - `extraMeleeTargets`: number (0 default; 1 for MVP multi-melee)
  - `meleeRangeRings`: number (0 default; 1, 2, or 3 for MVP rings)
  - `stunPulseLevel`: number (0 default; 1 or 2 for stun pulse levels)
- `MeleeAttackSystem` reads this component to determine effective target count and range.
- `AbilitySystem` reads `stunPulseLevel` to determine if ability is unlocked and which configuration to use.
- Without rings (0), core base range is very short (0.4), requiring enemies to be nearly on the center tile.
- Range calculation: 0 rings = base range only; 1+ rings = base range * ring count.
- Stun ability only available when `stunPulseLevel > 0`.

### Manual Testing (Temporary)
- Meta upgrades can be tested manually via Debug UI (press 'D' to open).
- Debug UI provides checkboxes for Ring 1/2/3 melee range (level-based, sequential validation), multi-melee, and Stun Pulse Level 1/2.
- Changes apply immediately to the core entity during gameplay.
- This debug implementation is temporary and will be replaced by proper UI/persistence.

### Ability Button
- When any stun pulse level is active, a circular ability button appears at the bottom center of the screen.
- Button shows lightning bolt icon (⚡) when ready, or cooldown time (rounded to 0.5s) when on cooldown.
- Clicking the button executes the stun pulse ability based on current upgrade level.

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
