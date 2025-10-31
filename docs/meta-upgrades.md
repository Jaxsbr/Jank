# Meta Upgrades

This document defines current MVP meta upgrades and serves as a backlog for future ideas.

## MVP Upgrades (Run-only Prototype)
- ring-1 melee range: Core melee range extends to 1 ring (base range * 1). Required to attack enemies beyond very close range.
- ring-2 melee range: Core melee range extends to 2 rings (base range * 2).
- ring-3 melee range: Core melee range extends to 3 rings (base range * 3).
- multi-melee: Core melee attack hits an additional nearest enemy in range (primary + 1).

### Runtime Application
- Represented via `MetaUpgradeComponent` on the core with fields:
  - `extraMeleeTargets`: number (0 default; 1 for MVP multi-melee)
  - `meleeRangeRings`: number (0 default; 1, 2, or 3 for MVP rings)
- `MeleeAttackSystem` reads this component to determine effective target count and range.
- Without rings (0), core base range is very short (0.4), requiring enemies to be nearly on the center tile.
- Range calculation: 0 rings = base range only; 1+ rings = base range * ring count.

### Manual Testing (Temporary)
- Meta upgrades can be tested manually via Debug UI (press 'D' to open).
- Debug UI provides checkboxes for Ring 1/2/3 melee range (level-based, sequential validation) and multi-melee.
- Changes apply immediately to the core entity during gameplay.
- This debug implementation is temporary and will be replaced by proper UI/persistence.

## Rules and Constraints
- Upgrades are additive but clamped by `MetaUpgradeConfig` caps.
- Tiles remain VFX-only and are unaffected by upgrades.
- Future persistence/UI will write into `MetaUpgradeComponent` instead of systems.

## Future Ideas (Backlog)
- flat damage increase per ring
- lifesteal on melee
- periodic shockwave on N kills
- % chance to chain lightning on hit
- armor/resist per ring unlocked
- core regen out of combat
- crit chance/damage mechanics
- on-kill explosion with radius scaling by rings
- Core upgrade levelup: large step-change to core base stats (speed, HP, energy) and visual form (size, extra geometry). May also intensify select hive VFX. Gated to unlock only after certain other metas are acquired (TBD).
- Core melee attack speed increase: multi-level upgrade that reduces melee attack cooldown (e.g., -0.05s per level) to increase attack frequency.
