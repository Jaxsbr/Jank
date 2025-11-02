import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { EntityManager } from '../../ecs/EntityManager';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { SpatialQuery } from '../../utils/SpatialQuery';
import { Time } from '../../utils/Time';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { ProjectileComponent } from '../components/ProjectileComponent';
import { TeamComponent } from '../components/TeamComponent';
import { defaultCoreEntityConfig } from '../config/CoreEntityConfig';
import { defaultPelletProjectileConfig } from '../config/PelletProjectileConfig';

export class ProjectileSystem implements IEntitySystem {
    private readonly entityManager: EntityManager; // EntityManager for cleanup
    private readonly scene: THREE.Scene;

    constructor(entityManager: EntityManager, scene: THREE.Scene) {
        this.entityManager = entityManager;
        this.scene = scene;
    }

    public update(entities: readonly Entity[]): void {
        const currentTime = Time.now();
        const deltaTime = Time.getDeltaTime();

        EntityQuery.from(entities)
            .withComponents(ProjectileComponent, PositionComponent)
            .execute()
            .forEach(({ entity, components }) => {
                const [projectile, position] = components;

                // Check lifetime expiry (get from projectile config based on type)
                const spawnTime = projectile.getSpawnTime();
                const rangedConfig = defaultCoreEntityConfig.combat.ranged;
                // TODO: Support multiple projectile types
                const lifetime = rangedConfig.projectileType === 'pellet' 
                    ? defaultPelletProjectileConfig.lifetime 
                    : defaultPelletProjectileConfig.lifetime; // fallback
                if (currentTime - spawnTime > lifetime) {
                    this.destroyProjectile(entity);
                    return;
                }

                // Update position based on velocity
                const velocity = projectile.getVelocity();
                const currentPos = position.toVector3();
                const newPos = currentPos.clone().addScaledVector(velocity, deltaTime);
                position.setPosition(newPos.x, newPos.y, newPos.z);

                // Update geometry position
                const geometry = entity.getComponent(GeometryComponent);
                if (geometry) {
                    geometry.setPosition(newPos.x, newPos.y, newPos.z);
                }

                // Check max range
                const distanceTraveled = projectile.getDistanceTraveled(newPos);
                if (distanceTraveled >= projectile.getMaxRange()) {
                    this.destroyProjectile(entity);
                    return;
                }

                // Check collision with enemies
                const hitEnemy = this.checkCollision(newPos, projectile, entities);
                if (hitEnemy) {
                    // Dispatch projectile hit event
                    // Note: knockbackConfig is retrieved from projectile entity in KnockbackOnHitSystem
                    const hitEvent = new Event(EventType.ProjectileHit, {
                        projectileId: entity.getId(),
                        attackerId: projectile.getAttackerId(),
                        targetId: hitEnemy.getId(),
                        damage: projectile.getDamage(),
                        position: newPos.clone()
                    });
                    GlobalEventDispatcher.dispatch(hitEvent);

                    // Destroy projectile on hit
                    this.destroyProjectile(entity);
                }
            });
    }

    private checkCollision(
        projectilePos: THREE.Vector3,
        projectile: ProjectileComponent,
        entities: readonly Entity[]
    ): Entity | null {
        // Small collision radius for projectile (get from projectile config)
        const rangedConfig = defaultCoreEntityConfig.combat.ranged;
        // TODO: Support multiple projectile types
        const projectileRadius = rangedConfig.projectileType === 'pellet'
            ? defaultPelletProjectileConfig.radius
            : defaultPelletProjectileConfig.radius; // fallback
        const collisionRadius = projectileRadius * 2.0;

        // Find enemies in radius
        const nearbyEntities = SpatialQuery.getEntitiesInRadius2D(
            entities,
            projectilePos,
            collisionRadius
        );

        // Filter for enemies only (opposite team from attacker)
        const attackerId = projectile.getAttackerId();
        const attacker = entities.find(e => e.getId() === attackerId);
        if (!attacker) return null;

        const attackerTeam = attacker.getComponent(TeamComponent);
        if (!attackerTeam) return null;

        // Find first valid enemy target
        for (const entity of nearbyEntities) {
            if (entity.getId() === attackerId) continue; // Skip self

            const team = entity.getComponent(TeamComponent);
            const health = entity.getComponent(HealthComponent);

            if (!team || !health) continue;
            if (!health.isAlive()) continue;

            // Check if hostile to attacker
            if (attackerTeam.isHostileTo(team)) {
                return entity;
            }
        }

        return null;
    }

    private destroyProjectile(entity: Entity): void {
        // Remove geometry from scene
        const geometry = entity.getComponent(GeometryComponent);
        if (geometry) {
            const group = geometry.getGeometryGroup();
            if (group.parent) {
                group.parent.remove(group);
            }
        }

        // Destroy entity
        if (this.entityManager) {
            this.entityManager.destroyEntity(entity);
        }
    }
}

