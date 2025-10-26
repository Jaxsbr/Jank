import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { MathUtils } from '../../utils/MathUtils';
import { AttackComponent } from '../components/AttackComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TargetComponent } from '../components/TargetComponent';

export class MeleeAttackSystem implements IEntitySystem {
    /**
     * Update melee attacks for all entities
     */
    public update(entities: readonly Entity[]): void {
        const currentTime = Date.now();
        
        entities.forEach(entity => {
            if (entity.hasComponent(AttackComponent) && 
                entity.hasComponent(TargetComponent) && 
                entity.hasComponent(PositionComponent) &&
                entity.hasComponent(HealthComponent)) {
                
                const attack = entity.getComponent(AttackComponent);
                const target = entity.getComponent(TargetComponent);
                const position = entity.getComponent(PositionComponent);
                const health = entity.getComponent(HealthComponent);
                
                if (attack && target && position && health && health.isAlive()) {
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
