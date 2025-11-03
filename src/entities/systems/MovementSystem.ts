import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Time } from '../../utils/Time';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { MovementComponent } from '../components/MovementComponent';
import { PositionComponent } from '../components/PositionComponent';
import { StunComponent } from '../components/StunComponent';
import { EnemyEntityConfig, defaultEnemyEntityConfig } from '../config/EnemyEntityConfig';
import { MovementSystemConfig, defaultMovementSystemConfig } from '../config/MovementSystemConfig';

export class MovementSystem implements IEntitySystem {
    private enemyConfig: EnemyEntityConfig;
    // Steering: remember last movement direction per entity
    private lastDirection2DByEntityId = new Map<string, THREE.Vector3>();
    private movementConfig: MovementSystemConfig;

    constructor(enemyConfig: EnemyEntityConfig = defaultEnemyEntityConfig, movementConfig: MovementSystemConfig = defaultMovementSystemConfig) {
        this.enemyConfig = enemyConfig;
        this.movementConfig = movementConfig;
    }

    update(entities: readonly Entity[]): void {
        EntityQuery.from(entities)
            .withComponents(MovementComponent, PositionComponent, GeometryComponent, HealthComponent)
            .filter(({ components }) => {
                const [, , , health] = components;
                return health.isAlive();
            })
            .execute()
            .forEach(({ entity, components }) => {
                const [movement, position, geometry] = components;
                
                // Check if entity is stunned - if so, skip movement entirely
                const stunComp = entity.getComponent(StunComponent);
                if (stunComp && stunComp.isStunned(Time.now())) {
                    movement.setCurrentSpeed(0);
                    return;
                }
                
                // Get current position (ignore Y for movement calculations)
                const currentPosition = position.toVector3();
                const currentPosition2D = new THREE.Vector3(currentPosition.x, 0, currentPosition.z);
                const targetPosition2D = new THREE.Vector3(movement.getTargetPosition().x, 0, movement.getTargetPosition().z);
                
                // Calculate desired movement direction (2D only)
                const desiredDirection2D = targetPosition2D.clone().sub(currentPosition2D).normalize();
                // Blend with last direction for steering smoothness
                const entityId = entity.getId();
                const previousDir = this.lastDirection2DByEntityId.get(entityId) ?? desiredDirection2D.clone();
                const steeredDir = previousDir.clone().lerp(desiredDirection2D, this.movementConfig.steeringLerp).normalize();
                this.lastDirection2DByEntityId.set(entityId, steeredDir.clone());
                
                // Constant speed movement (no acceleration/deceleration)
                // Back-compat: maxSpeed was tuned as units per frame; convert to units per second
                const newSpeedPerSecond = movement.getMaxSpeed() * 60;
                
                movement.setCurrentSpeed(newSpeedPerSecond);
                
                // Calculate movement delta for this frame using current speed scaled by dt
                // Collision system will handle preventing overlap with core and other enemies
                const dt = Time.getDeltaTime();
                const movementDelta = newSpeedPerSecond * dt;
                
                // Calculate new position (2D movement, preserve Y)
                const movementVector2D = steeredDir.multiplyScalar(movementDelta);
                const newPosition = new THREE.Vector3(
                    currentPosition.x + movementVector2D.x,
                    currentPosition.y, // Preserve Y for bob animation
                    currentPosition.z + movementVector2D.z
                );
                
                // Update position component
                position.setPosition(newPosition.x, newPosition.y, newPosition.z);
                
                // Update geometry group position (preserving Y for bob animation)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                const currentGeometryPos = geometry.getPosition();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                geometry.setPosition(newPosition.x, currentGeometryPos.y, newPosition.z);
            });
    }
}
