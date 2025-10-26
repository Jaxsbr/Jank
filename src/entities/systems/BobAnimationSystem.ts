import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { MathUtils } from '../../utils/MathUtils';
import { AttackComponent } from '../components/AttackComponent';
import { BobAnimationComponent } from '../components/BobAnimationComponent';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TargetComponent } from '../components/TargetComponent';
import { TeamComponent } from '../components/TeamComponent';

export class BobAnimationSystem implements IEntitySystem {
    update(entities: readonly Entity[]): void {
        const multiplier = 1.5
        entities.forEach(entity => {
            if (entity.hasComponent(BobAnimationComponent) &&
                entity.hasComponent(GeometryComponent) &&
                entity.hasComponent(HealthComponent) &&
                entity.hasComponent(PositionComponent)) {
                const health = entity.getComponent(HealthComponent);
                const position = entity.getComponent(PositionComponent);
                const bobAnimation = entity.getComponent(BobAnimationComponent);
                const geometry = entity.getComponent(GeometryComponent);
                
                if (health && position && geometry && bobAnimation && health.isAlive()) {
                    // Check if entity is in attack range for vibrate effect
                    this.updateAnimationSpeed(entity, bobAnimation);
                    
                    // Update animation time
                    const animationTime = bobAnimation.getAnimationTime;
                    const animationSpeed = bobAnimation.getAnimationSpeed;
                    bobAnimation.setAnimationTime = animationTime + animationSpeed

                    // Update animation position (only Y axis for bob animation)
                    const bobOffset = Math.sin(bobAnimation.getAnimationTime * multiplier) * bobAnimation.getBobAmplitude;
                    const calculatedY = bobAnimation.getBaseY + bobOffset
                    const geometryGroup = geometry.getGeometryGroup();
                    
                    // Only animate the Y position, preserve X and Z from initial positioning
                    geometryGroup.position.y = calculatedY;
                    
                    // Update the position component to reflect the animated Y position
                    position.setY(calculatedY);
                }
            }
        });
    }

    /**
     * Update animation speed based on combat state
     */
    private updateAnimationSpeed(entity: Entity, bobAnimation: BobAnimationComponent): void {
        // Check if entity is an enemy in attack range
        const teamComponent = entity.getComponent(TeamComponent);
        const targetComponent = entity.getComponent(TargetComponent);
        const attackComponent = entity.getComponent(AttackComponent);
        const positionComponent = entity.getComponent(PositionComponent);

        if (teamComponent && teamComponent.isEnemy() && 
            targetComponent && attackComponent && positionComponent) {
            
            if (targetComponent.hasTarget() && targetComponent.isTargetValid()) {
                const target = targetComponent.getTarget();
                if (target) {
                    const targetPosition = target.getComponent(PositionComponent);
                    if (targetPosition) {
                        // Calculate 2D distance to target
                        const distance = MathUtils.calculate2DDistance(positionComponent, targetPosition);
                        
                        if (distance <= attackComponent.getRange()) {
                            // In combat range - use faster speed (vibrate effect)
                            const vibrateSpeed = bobAnimation.getOriginalAnimationSpeed() * 5; // 5x faster
                            bobAnimation.setAnimationSpeed(vibrateSpeed);
                            return;
                        }
                    }
                }
            }
        }

        // Not in combat range - reset to normal speed
        bobAnimation.resetAnimationSpeed();
    }

}