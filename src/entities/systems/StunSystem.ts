import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Time } from '../../utils/Time';
import { AttackComponent } from '../components/AttackComponent';
import { MovementComponent } from '../components/MovementComponent';
import { StunComponent } from '../components/StunComponent';

export class StunSystem implements IEntitySystem {
    public update(entities: readonly Entity[]): void {
        const currentTime = Time.now();
        
        entities.forEach(entity => {
            const stunComp = entity.getComponent(StunComponent);
            if (!stunComp) return;
            
            if (stunComp.isStunned(currentTime)) {
                // Apply stun effects
                const movement = entity.getComponent(MovementComponent);
                if (movement) {
                    movement.setCurrentSpeed(0);
                }
                
                const attack = entity.getComponent(AttackComponent);
                if (attack) {
                    // Block attacks by setting last attack time to prevent cooldown
                    const cooldownRemaining = attack.getTimeUntilNextAttack(currentTime);
                    if (cooldownRemaining <= 0.1) {
                        attack.performAttack(currentTime);
                    }
                }
            }
        });
    }
}

