import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { MathUtils } from '../../utils/MathUtils';
import { Time } from '../../utils/Time';
import { AttackComponent } from '../components/AttackComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TargetComponent } from '../components/TargetComponent';

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
                const [attack, target, position, health] = components;
                
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
                
                // Check if target is in range (2D distance ignoring Y position)
                const distance = MathUtils.calculate2DDistance(position, targetPosition);
                if (!attack.isInRange(distance)) {
                    return;
                }
                
                // Perform the attack
                this.performAttack(entity, targetEntity, attack, currentTime);
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
