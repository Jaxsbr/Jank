import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { MathUtils } from '../../utils/MathUtils';
import { Time } from '../../utils/Time';
import { EntityFactory } from '../EntityFactory';
import { AttackComponent } from '../components/AttackComponent';
import { HealthComponent } from '../components/HealthComponent';
import { MetaUpgradeComponent } from '../components/MetaUpgradeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TargetComponent } from '../components/TargetComponent';
import { TeamComponent } from '../components/TeamComponent';
import { defaultRangedAttackConfig } from '../config/RangedAttackConfig';

export class RangedAttackSystem implements IEntitySystem {
    private readonly entityFactory: EntityFactory;
    private readonly rangedCooldowns: Map<string, number> = new Map(); // entityId -> last ranged attack time

    constructor(entityFactory: EntityFactory) {
        this.entityFactory = entityFactory;
    }

    public update(entities: readonly Entity[]): void {
        const currentTime = Time.now();

        EntityQuery.from(entities)
            .withComponents(AttackComponent, TargetComponent, PositionComponent, HealthComponent, MetaUpgradeComponent, TeamComponent)
            .filter(({ components }) => {
                const [, , , health, meta, team] = components;
                // Only process core entities with ranged attack unlocked (level > 0)
                return health.isAlive() && team.isCore() && meta.getRangedAttackLevel() > 0;
            })
            .execute()
            .forEach(({ entity, components }) => {
                const [, target, position, , meta] = components; // AttackComponent not needed, kept for query compatibility

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

                // Calculate distance to target
                const distance = MathUtils.calculate2DDistance(position, targetPosition);

                // Get ranged stats from meta upgrade level
                const rangedLevel = meta.getRangedAttackLevel();
                const rangedConfig = defaultRangedAttackConfig.levels[rangedLevel];
                if (!rangedConfig) {
                    return; // Invalid level, skip
                }
                const rangedRange = rangedConfig.range;
                const rangedCooldown = rangedConfig.cooldown;

                // Only check max range - allow ranged to fire at any distance within range
                // This enables simultaneous melee + ranged attacks when both are in range
                if (distance > rangedRange) {
                    return; // Target is too far, out of ranged range
                }

                // Check ranged cooldown
                const entityId = entity.getId();
                const lastRangedAttack = this.rangedCooldowns.get(entityId) ?? 0;
                if (currentTime - lastRangedAttack < rangedCooldown) {
                    return; // Still on cooldown
                }

                // Calculate direction to target
                const corePos = position.toVector3();
                const targetPos = targetPosition.toVector3();
                const direction = targetPos.clone().sub(corePos).normalize();

                // Create projectile entity using level-based damage and visual config
                this.entityFactory.createProjectileEntity(
                    corePos,
                    direction,
                    entity,
                    targetEntity,
                    rangedConfig.damage,
                    rangedLevel // Pass level for visual configuration
                );

                // Update cooldown
                this.rangedCooldowns.set(entityId, currentTime);

                // Dispatch ranged attack executed event (for VFX/tiles)
                const rangedEvent = new Event(EventType.RangedAttackExecuted, {
                    attackerId: entity.getId(),
                    targetId: targetEntity.getId(),
                    position: corePos.clone()
                });
                GlobalEventDispatcher.dispatch(rangedEvent);

                // Note: Do NOT update melee cooldown - allow simultaneous attacks
            });
    }
}

