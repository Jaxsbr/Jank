import { Scene, Vector3 } from 'three';
import { Entity } from '../ecs/Entity';
import { EntityManager } from '../ecs/EntityManager';
import { AttackAnimationComponent } from './components/AttackAnimationComponent';
import { AttackComponent } from './components/AttackComponent';
import { BobAnimationComponent } from './components/BobAnimationComponent';
import { GeometryComponent, SecondaryGeometryConfig, SecondaryGeometryType } from './components/GeometryComponent';
import { HealthComponent } from './components/HealthComponent';
import { MovementComponent } from './components/MovementComponent';
import { PositionComponent } from './components/PositionComponent';
import { RotationComponent } from './components/RotationComponent';
import { TargetComponent } from './components/TargetComponent';
import { TeamComponent, TeamType } from './components/TeamComponent';
import { BaseEntityConfig } from './config/BaseEntityConfig';
import { CombatConfig } from './config/CombatConfig';
import { CoreEntityConfig, defaultCoreEntityConfig } from './config/CoreEntityConfig';
import { EnemyEntityConfig, defaultEnemyEntityConfig } from './config/EnemyEntityConfig';
import { GeometryConfig } from './config/GeometryConfig';

export interface IEntityFactory {
    createCoreEntity(): Entity;
}

export class EntityFactory implements IEntityFactory {
    private scene: Scene;
    private entityManager: EntityManager;

    constructor(scene: Scene, entityManager: EntityManager) {
        this.scene = scene;
        this.entityManager = entityManager;
    }

    /**
     * Creates secondary geometry configurations from the provided geometry config.
     * Handles embed depth calculation and position normalization.
     */
    private createSecondaryGeometryConfigs(config: GeometryConfig): SecondaryGeometryConfig[] {
        const secondaryConfigs: SecondaryGeometryConfig[] = [];
        const embedDepth = config.protrusions.radius * config.protrusions.embedRatio;
        
        config.positions.forEach(pos => {
            // Normalize the position to be on the sphere surface
            const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
            const normalizedX = pos.x / length;
            const normalizedY = pos.y / length;
            const normalizedZ = pos.z / length;

            // Position the sphere so it's embedded
            const embedPosition = config.mainSphere.radius - embedDepth;
            const finalX = normalizedX * embedPosition;
            const finalY = normalizedY * embedPosition;
            const finalZ = normalizedZ * embedPosition;

            secondaryConfigs.push({
                type: SecondaryGeometryType.Sphere,
                position: new Vector3(finalX, finalY, finalZ),
                size: config.protrusions.radius,
                segments: config.protrusions.segments,
            })
        });

        return secondaryConfigs;
    }

    /**
     * Adds base components common to all entities (health, position, geometry, rotation, bob animation)
     */
    private addBaseComponents(entity: Entity, config: BaseEntityConfig): GeometryComponent {
        entity.addComponent(new HealthComponent(config.health.maxHP));
        entity.addComponent(new PositionComponent(config.position.x, config.position.y, config.position.z));
        
        const secondaryConfigs = this.createSecondaryGeometryConfigs(config.geometry);
        const geometryComponent = new GeometryComponent(
            config.geometry.mainSphere.radius, 
            config.geometry.mainSphere.segments, 
            secondaryConfigs,
            config.material
        );
        entity.addComponent(geometryComponent);
        
        entity.addComponent(new RotationComponent(config.rotation.x, config.rotation.y, config.rotation.z));
        entity.addComponent(new BobAnimationComponent(
            config.bobAnimation.speed, 
            config.bobAnimation.amplitude, 
            config.bobAnimation.baseY
        ));

        return geometryComponent;
    }

    /**
     * Adds combat components to an entity (team, attack, target, attack animation)
     */
    private addCombatComponents(entity: Entity, config: CombatConfig, team: TeamType): void {
        entity.addComponent(new TeamComponent(team));
        entity.addComponent(new AttackComponent(
            config.attack.damage, 
            config.attack.range, 
            config.attack.cooldown
        ));
        entity.addComponent(new TargetComponent(config.target.searchRange));
        entity.addComponent(new AttackAnimationComponent(
            config.attackAnimation.scaleMultiplier, 
            config.attackAnimation.duration
        ));
    }

    /**
     * Sets up the entity's geometry in the scene
     */
    private addEntityToScene(entity: Entity, geometryComponent: GeometryComponent, position: Vector3): void {
        // Set initial position of geometry group
        geometryComponent.getGeometryGroup().position.set(position.x, position.y, position.z);

        // Make entity geometry visible by adding to scene
        this.scene.add(geometryComponent.getGeometryGroup());
    }

    createCoreEntity(config: CoreEntityConfig = defaultCoreEntityConfig): Entity {
        const entity = this.entityManager.createEntity();
        
        // Add base components (health, position, geometry, rotation, bob animation)
        const geometryComponent = this.addBaseComponents(entity, config);
        
        // Add combat components
        this.addCombatComponents(entity, config.combat, TeamType.CORE);
        
        // Set up entity in scene
        this.addEntityToScene(entity, geometryComponent, config.position);

        return entity;
    }

    createEnemyEntity(config: EnemyEntityConfig = defaultEnemyEntityConfig): Entity {
        const entity = this.entityManager.createEntity();
        
        // Add base components (health, position, geometry, rotation, bob animation)
        const geometryComponent = this.addBaseComponents(entity, config);
        
        // Add combat components
        this.addCombatComponents(entity, config.combat, TeamType.ENEMY);
        
        // Add movement component (enemy-specific)
        entity.addComponent(new MovementComponent(
            config.movement.targetPosition,
            config.movement.maxSpeed,
            config.movement.targetReachedThreshold,
            config.movement.acceleration,
            config.movement.deceleration,
            config.movement.decelerationDistance
        ));
        
        // Set up entity in scene
        this.addEntityToScene(entity, geometryComponent, config.position);

        return entity;
    }
}