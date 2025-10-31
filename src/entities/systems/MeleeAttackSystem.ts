import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { MathUtils } from '../../utils/MathUtils';
import { SpatialQuery } from '../../utils/SpatialQuery';
import { Time } from '../../utils/Time';
import { AttackComponent } from '../components/AttackComponent';
import { HealthComponent } from '../components/HealthComponent';
import { MetaUpgradeComponent } from '../components/MetaUpgradeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TargetComponent } from '../components/TargetComponent';
import { TeamComponent, TeamType } from '../components/TeamComponent';
import { defaultMetaUpgradeConfig } from '../config/MetaUpgradeConfig';

export class MeleeAttackSystem implements IEntitySystem {
    /**
     * Update melee attacks for all entities
     */
    public update(entities: readonly Entity[]): void {
        const currentTime = Time.now();
        
        EntityQuery.from(entities)
            .withComponents(AttackComponent, TargetComponent, PositionComponent, HealthComponent)
            .filter(({ components }) => {
                const [, , , health] = components;
                return health.isAlive();
            })
            .execute()
            .forEach(({ entity, components }) => {
                const [attack, target, position] = components;
                
                // Check if we have a valid target
                if (!target.hasTarget() || !target.isTargetValid()) {
                    return;
                }
                
                const targetEntity = target.getTarget();
                if (!targetEntity) {
                    return;
                }
                
                // Check if target has position component
                const targetPosition = targetEntity.getComponent(PositionComponent);
                if (!targetPosition) {
                    return;
                }
                
                // Check if we can attack (cooldown)
                if (!attack.canAttack(currentTime)) {
                    return;
                }
                
                // Determine effective melee range with meta upgrades (core only)
                const team = entity.getComponent(TeamComponent);
                const meta = team && team.isCore() ? (entity.getComponent(MetaUpgradeComponent) ?? null) : null;
                const meleeRings = Math.min(
                    meta?.getMeleeRangeRings() ?? defaultMetaUpgradeConfig.defaultMeleeRangeRings,
                    defaultMetaUpgradeConfig.maxMeleeRangeRings
                );
                // 0 rings = base range only (very close), 1+ rings = base range * ring count
                const effectiveRange = meleeRings === 0 ? attack.getRange() : attack.getRange() * meleeRings;

                // Check if target is in range (2D distance ignoring Y position)
                const distance = MathUtils.calculate2DDistance(position, targetPosition);
                if (distance > effectiveRange) {
                    return;
                }
                
                // Perform the attack
                this.performAttack(entity, targetEntity, attack, currentTime);

                // If core has multi-melee, attempt to hit additional nearest enemies in range
                if (team && team.getTeamType() === TeamType.CORE && meta) {
                    const extraTargets = Math.min(
                        meta.getExtraMeleeTargets(),
                        defaultMetaUpgradeConfig.maxExtraMeleeTargets
                    );
                    if (extraTargets > 0) {
                        const origin = position.toVector3();
                        const candidates = SpatialQuery.getEntitiesInRadius2D(entities, origin, effectiveRange)
                            .filter(e => e !== targetEntity && e !== entity)
                            .filter(e => {
                                const t = e.getComponent(TeamComponent);
                                return !!t && t.isEnemy();
                            })
                            .slice(0, extraTargets);
                        candidates.forEach(candidate => {
                            this.performAttack(entity, candidate, attack, currentTime);
                        });
                    }
                }
            });
    }

    /**
     * Perform an attack between two entities
     */
    private performAttack(attacker: Entity, target: Entity, attack: AttackComponent, currentTime: number): void {
        // Update attack cooldown
        attack.performAttack(currentTime);
        
        // Dispatch attack executed event
        const attackEvent = new Event(EventType.AttackExecuted, {
            attackerId: attacker.getId(),
            targetId: target.getId(),
            damage: attack.getDamage()
        });
        
        GlobalEventDispatcher.dispatch(attackEvent);
    }
}
