# Meta Upgrades

This document defines current MVP meta upgrades and serves as a backlog for future ideas.

## MVP Upgrades (Run-only Prototype)
- multi-melee: Core melee attack hits an additional nearest enemy in range (primary + 1).
- ring-2 melee range: Core melee range extends to 2 rings (approx. 2x base range).

### Runtime Application
- Represented via `MetaUpgradeComponent` on the core with fields:
  - `extraMeleeTargets`: number (0 default; 1 for MVP multi-melee)
  - `meleeRangeRings`: number (1 default; 2 for MVP ring-2)
- `MeleeAttackSystem` reads this component to determine effective target count and range.

### Temporary Awarding (MVP only)
- `MetaProgressionSystem` listens for `EnemyKilled` events and awards upgrades at milestones from `MetaProgressionTestConfig`.
- Default milestones: 10 kills → multi-melee; 20 kills → ring-2 melee range.
- This system is removable when real UI/persistence is added.

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

## Removal Path
- Delete `MetaProgressionSystem` and its test config when real meta UI/persistence lands.
- Keep `MetaUpgradeComponent` and `MetaUpgradeConfig` as stable interfaces.
