import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { SpatialQuery } from '../../utils/SpatialQuery';
import { CollisionComponent } from '../components/CollisionComponent';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { CollisionConfig, defaultCollisionConfig } from '../config/CollisionConfig';

/**
 * System that handles collision detection and resolution between entities.
 * Detects collisions using sphere-to-sphere collision in 2D (XZ plane).
 * Resolves collisions by pushing entities apart. Handles immovable entities (like the core).
 */
export class CollisionSystem implements IEntitySystem {
    private config: CollisionConfig;

    constructor(config: CollisionConfig = defaultCollisionConfig) {
        this.config = config;
    }

    update(entities: readonly Entity[]): void {
        // Get all entities with collision and position components (enemies and core)
        const entitiesWithCollision = EntityQuery.from(entities)
            .withComponents(
                CollisionComponent,
                PositionComponent,
                HealthComponent
            )
            .filter(({ components }) => {
                const [, , health] = components;
                return health.isAlive();
            })
            .execute()
            .map(({ entity }) => entity);

        // Process collisions in multiple passes to ensure all collisions are resolved
        const maxPasses = 3;
        for (let pass = 0; pass < maxPasses; pass++) {
            let collisionCount = 0;

            // Check collisions between all entities (enemies and core)
            for (let i = 0; i < entitiesWithCollision.length; i++) {
                const entityA = entitiesWithCollision[i];
                const positionA = entityA.getComponent(PositionComponent);
                const collisionA = entityA.getComponent(CollisionComponent);

                if (!positionA || !collisionA) continue;

                // Get current position (may have been updated by previous collision resolutions)
                const posA = positionA.toVector3();
                const radiusA = collisionA.getCollisionRadius();
                const immovableA = collisionA.isImmovable();

                // Use spatial query to find nearby entities efficiently
                const searchRadius = radiusA * 2 + this.config.minSeparationDistance;
                const nearbyEntities = this.config.use2D
                    ? SpatialQuery.getEntitiesInRadius2D(entitiesWithCollision, posA, searchRadius, false)
                    : SpatialQuery.getEntitiesInRadius(entitiesWithCollision, posA, searchRadius, false);

                // Check collisions with nearby entities
                for (const entityB of nearbyEntities) {
                    // Skip self
                    if (entityB.getId() === entityA.getId()) continue;
                    
                    // Only process each pair once (process if entityA's ID is less than entityB's ID)
                    // This ensures we don't process the same collision twice
                    if (entityA.getId() >= entityB.getId()) continue;

                    const positionB = entityB.getComponent(PositionComponent);
                    const collisionB = entityB.getComponent(CollisionComponent);

                    if (!positionB || !collisionB) continue;

                    // Get current position (may have been updated by previous collision resolutions)
                    const posB = positionB.toVector3();
                    const radiusB = collisionB.getCollisionRadius();
                    const immovableB = collisionB.isImmovable();

                    // Calculate distance (2D or 3D based on config)
                    let distance: number;
                    if (this.config.use2D) {
                        const dx = posA.x - posB.x;
                        const dz = posA.z - posB.z;
                        distance = Math.sqrt(dx * dx + dz * dz);
                    } else {
                        distance = posA.distanceTo(posB);
                    }

                    const combinedRadius = radiusA + radiusB;
                    const minDistance = combinedRadius + this.config.minSeparationDistance;

                    // Check if entities are too close
                    if (distance < minDistance && distance > 0.0001) {
                        collisionCount++;

                        // Calculate separation vector
                        let separationDir: THREE.Vector3;
                        if (this.config.use2D) {
                            const dx = posA.x - posB.x;
                            const dz = posA.z - posB.z;
                            const dist2D = Math.sqrt(dx * dx + dz * dz);
                            if (dist2D < 0.0001) {
                                // Entities are exactly on top of each other, use random direction
                                const angle = Math.random() * Math.PI * 2;
                                separationDir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
                            } else {
                                separationDir = new THREE.Vector3(dx / dist2D, 0, dz / dist2D);
                            }
                        } else {
                            separationDir = posA.clone().sub(posB).normalize();
                        }

                        // Calculate overlap amount
                        const overlap = minDistance - distance;
                        const pushDistance = overlap * this.config.pushForceStrength;

                        // Handle collision resolution based on immovability
                        if (immovableA && immovableB) {
                            // Both immovable - shouldn't happen in practice, but skip
                            continue;
                        } else if (immovableA) {
                            // Entity A is immovable, only push Entity B
                            const pushB = separationDir.clone().multiplyScalar(-pushDistance);
                            const newPosB = posB.clone().add(pushB);
                            positionB.setPosition(newPosB.x, positionB.getY(), newPosB.z);

                            // Update geometry position for entity B
                            const geometryB = entityB.getComponent(GeometryComponent);
                            if (geometryB) {
                                const currentGeometryPos = geometryB.getPosition();
                                geometryB.setPosition(newPosB.x, currentGeometryPos.y, newPosB.z);
                            }
                        } else if (immovableB) {
                            // Entity B is immovable, only push Entity A
                            const pushA = separationDir.clone().multiplyScalar(pushDistance);
                            const newPosA = posA.clone().add(pushA);
                            positionA.setPosition(newPosA.x, positionA.getY(), newPosA.z);

                            // Update geometry position for entity A
                            const geometryA = entityA.getComponent(GeometryComponent);
                            if (geometryA) {
                                const currentGeometryPos = geometryA.getPosition();
                                geometryA.setPosition(newPosA.x, currentGeometryPos.y, newPosA.z);
                            }
                        } else {
                            // Both movable - push both apart equally (50/50 split)
                            const pushA = separationDir.clone().multiplyScalar(pushDistance * 0.5);
                            const pushB = separationDir.clone().multiplyScalar(-pushDistance * 0.5);

                            // Apply push to entity A (preserve Y coordinate for bob animation)
                            const newPosA = posA.clone().add(pushA);
                            positionA.setPosition(newPosA.x, positionA.getY(), newPosA.z);

                            // Update geometry position for entity A
                            const geometryA = entityA.getComponent(GeometryComponent);
                            if (geometryA) {
                                const currentGeometryPos = geometryA.getPosition();
                                geometryA.setPosition(newPosA.x, currentGeometryPos.y, newPosA.z);
                            }

                            // Apply push to entity B (preserve Y coordinate for bob animation)
                            const newPosB = posB.clone().add(pushB);
                            positionB.setPosition(newPosB.x, positionB.getY(), newPosB.z);

                            // Update geometry position for entity B
                            const geometryB = entityB.getComponent(GeometryComponent);
                            if (geometryB) {
                                const currentGeometryPos = geometryB.getPosition();
                                geometryB.setPosition(newPosB.x, currentGeometryPos.y, newPosB.z);
                            }
                        }
                    }
                }
            }

            // Early exit if no collisions were found in this pass
            if (collisionCount === 0) break;
        }
    }
}

