import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { RotationComponent } from '../components/RotationComponent';
import { Entity } from '../ecs/Entity';
import { IEntitySystem } from '../ecs/IEntitySystem';

export class RotationSystem implements IEntitySystem {
    update(entities: readonly Entity[]): void {
        entities.forEach(entity => {
            if (entity.hasComponent(RotationComponent) &&
                entity.hasComponent(GeometryComponent) &&
                entity.hasComponent(HealthComponent) &&
                entity.hasComponent(PositionComponent)) {
                const health = entity.getComponent(HealthComponent);
                const position = entity.getComponent(PositionComponent);
                const rotation = entity.getComponent(RotationComponent);
                const geometry = entity.getComponent(GeometryComponent);

                if (health && position && geometry && rotation && health.isAlive()) {
                    const geometryGroup = geometry.getGeometryGroup();
                    geometryGroup.rotation.x += rotation.getX();
                    geometryGroup.rotation.y += rotation.getY();
                    geometryGroup.rotation.z += rotation.getZ();
                }
            }
        });
    }
}