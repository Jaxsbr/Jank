import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { RotationComponent } from '../components/RotationComponent';

export class RotationSystem implements IEntitySystem {
    update(entities: readonly Entity[]): void {
        EntityQuery.from(entities)
            .withComponents(RotationComponent, GeometryComponent, HealthComponent, PositionComponent)
            .filter(({ components }) => {
                const [, , health] = components;
                return health.isAlive();
            })
            .execute()
            .forEach(({ entity, components }) => {
                const [rotation, geometry, health, position] = components;
                
                const geometryGroup = geometry.getGeometryGroup();
                geometryGroup.rotation.x += rotation.getX();
                geometryGroup.rotation.y += rotation.getY();
                geometryGroup.rotation.z += rotation.getZ();
            });
    }
}