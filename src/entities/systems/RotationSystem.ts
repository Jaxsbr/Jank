import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Time } from '../../utils/Time';
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
                const dt = Time.getDeltaTime();
                // Back-compat: rotation values were tuned as per-frame deltas; convert to per second
                const speedMultiplier = rotation.getSpeedMultiplier();
                const rx = rotation.getX() * 60 * speedMultiplier;
                const ry = rotation.getY() * 60 * speedMultiplier;
                const rz = rotation.getZ() * 60 * speedMultiplier;
                geometry.rotate(rx * dt, ry * dt, rz * dt);
            });
    }
}