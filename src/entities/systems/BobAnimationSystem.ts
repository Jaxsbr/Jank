import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { MathUtils } from '../../utils/MathUtils';
import { AttackComponent } from '../components/AttackComponent';
import { BobAnimationComponent } from '../components/BobAnimationComponent';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TargetComponent } from '../components/TargetComponent';
import { TeamComponent } from '../components/TeamComponent';
import { AnimationConfig, defaultAnimationConfig } from '../config/AnimationConfig';

export class BobAnimationSystem implements IEntitySystem {
    private config: AnimationConfig;

    constructor(config: AnimationConfig = defaultAnimationConfig) {
        this.config = config;
    }

    update(entities: readonly Entity[]): void {
        EntityQuery.from(entities)
            .withComponents(BobAnimationComponent, GeometryComponent, HealthComponent, PositionComponent)
            .filter(({ components }) => {
                const [, , health] = components;
                return health.isAlive();
            })
            .execute()
            .forEach(({ entity, components }) => {
                const [bobAnimation, geometry, health, position] = components;
                
                // Check if entity is in attack range for vibrate effect
                this.updateAnimationSpeed(entity, bobAnimation);
                
                // Update animation time
                const animationTime = bobAnimation.getAnimationTime;
                const animationSpeed = bobAnimation.getAnimationSpeed;
                bobAnimation.setAnimationTime = animationTime + animationSpeed

                // Update animation position (only Y axis for bob animation)
                const bobOffset = Math.sin(bobAnimation.getAnimationTime * this.config.bob.multiplier) * bobAnimation.getBobAmplitude;
                const calculatedY = bobAnimation.getBaseY + bobOffset
                const geometryGroup = geometry.getGeometryGroup();
                
                // Only animate the Y position, preserve X and Z from initial positioning
                geometryGroup.position.y = calculatedY;
                
                // Update the position component to reflect the animated Y position
                position.setY(calculatedY);
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
                            const vibrateSpeed = bobAnimation.getOriginalAnimationSpeed() * this.config.vibrate.speedMultiplier;
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