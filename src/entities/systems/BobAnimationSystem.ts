import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { BobAnimationComponent } from '../components/BobAnimationComponent';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';

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
                    // Update animation time
                    const animationTime = bobAnimation.getAnimationTime;
                    const animationSpeed = bobAnimation.getAnimationSpeed;
                    bobAnimation.setAnimationTime = animationTime + animationSpeed

                    // Update animation position
                    const bobOffset = Math.sin(bobAnimation.getAnimationTime * multiplier) * bobAnimation.getBobAmplitude;
                    const calculatedY = bobAnimation.getBaseY + bobOffset
                    const geometryGroup = geometry.getGeometryGroup();
                    geometryGroup.position.y = calculatedY;
                    
                    // TODO: Why even have a position component?
                    // Should we not instead have all geometries expose position?
                    // Will anything have a position without being a geometry?
                    position.setY(calculatedY);
                }
            }
        });
    }
}