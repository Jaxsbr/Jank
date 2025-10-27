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
            .forEach(({ components }) => {
                const [rotation, geometry] = components;
                
                geometry.rotate(rotation.getX(), rotation.getY(), rotation.getZ());
            });
    }
}