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
import { CoreEntityConfig, defaultCoreEntityConfig } from './config/CoreEntityConfig';
import { EnemyEntityConfig, defaultEnemyEntityConfig } from './config/EnemyEntityConfig';

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

    createCoreEntity(config: CoreEntityConfig = defaultCoreEntityConfig): Entity {
        const entity = this.entityManager.createEntity();
        
        // Create secondary geometry configurations from config
        const secondaryConfigs: SecondaryGeometryConfig[] = [];
        const embedDepth = config.geometry.protrusions.radius * config.geometry.protrusions.embedRatio;
        
        config.geometry.positions.forEach(pos => {
            // Normalize the position to be on the sphere surface
            const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
            const normalizedX = pos.x / length;
            const normalizedY = pos.y / length;
            const normalizedZ = pos.z / length;

            // Position the sphere so it's embedded
            const embedPosition = config.geometry.mainSphere.radius - embedDepth;
            const finalX = normalizedX * embedPosition;
            const finalY = normalizedY * embedPosition;
            const finalZ = normalizedZ * embedPosition;

            secondaryConfigs.push({
                type: SecondaryGeometryType.Sphere,
                position: new Vector3(finalX, finalY, finalZ),
                size: config.geometry.protrusions.radius,
                segments: config.geometry.protrusions.segments,
            })
        });
        
        // Add components using config values
        entity.addComponent(new HealthComponent(config.health.maxHP))
        entity.addComponent(new PositionComponent(config.position.x, config.position.y, config.position.z))
        const geometryComponent = new GeometryComponent(
            config.geometry.mainSphere.radius, 
            config.geometry.mainSphere.segments, 
            secondaryConfigs,
            config.material
        )
        entity.addComponent(geometryComponent)
        entity.addComponent(new RotationComponent(config.rotation.x, config.rotation.y, config.rotation.z))
        entity.addComponent(new BobAnimationComponent(
            config.bobAnimation.speed, 
            config.bobAnimation.amplitude, 
            config.bobAnimation.baseY
        ))
        
        // Add combat components
        entity.addComponent(new TeamComponent(TeamType.CORE))
        entity.addComponent(new AttackComponent(
            config.combat.attack.damage, 
            config.combat.attack.range, 
            config.combat.attack.cooldown
        ))
        entity.addComponent(new TargetComponent(config.combat.target.searchRange))
        entity.addComponent(new AttackAnimationComponent(
            config.combat.attackAnimation.scaleMultiplier, 
            config.combat.attackAnimation.duration
        ))

        // Set initial position of geometry group
        geometryComponent.getGeometryGroup().position.set(config.position.x, config.position.y, config.position.z);

        // Make entity geometry visible by adding to scene
        this.scene.add(geometryComponent.getGeometryGroup())

        // We return the entity in case direct reference is required
        return entity
    }

    createEnemyEntity(config: EnemyEntityConfig = defaultEnemyEntityConfig): Entity {
        const entity = this.entityManager.createEntity();
        
        // Create secondary geometry configurations from config
        const secondaryConfigs: SecondaryGeometryConfig[] = [];
        const embedDepth = config.geometry.protrusions.radius * config.geometry.protrusions.embedRatio;
        
        config.geometry.positions.forEach(pos => {
            // Normalize the position to be on the sphere surface
            const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
            const normalizedX = pos.x / length;
            const normalizedY = pos.y / length;
            const normalizedZ = pos.z / length;

            // Position the sphere so it's embedded
            const embedPosition = config.geometry.mainSphere.radius - embedDepth;
            const finalX = normalizedX * embedPosition;
            const finalY = normalizedY * embedPosition;
            const finalZ = normalizedZ * embedPosition;

            secondaryConfigs.push({
                type: SecondaryGeometryType.Sphere,
                position: new Vector3(finalX, finalY, finalZ),
                size: config.geometry.protrusions.radius,
                segments: config.geometry.protrusions.segments,
            })
        });

        // Add components using config values
        entity.addComponent(new HealthComponent(config.health.maxHP))
        entity.addComponent(new PositionComponent(config.position.x, config.position.y, config.position.z))
        const geometryComponent = new GeometryComponent(
            config.geometry.mainSphere.radius, 
            config.geometry.mainSphere.segments, 
            secondaryConfigs,
            config.material
        )
        
        entity.addComponent(geometryComponent)
        entity.addComponent(new RotationComponent(config.rotation.x, config.rotation.y, config.rotation.z))
        entity.addComponent(new BobAnimationComponent(
            config.bobAnimation.speed, 
            config.bobAnimation.amplitude, 
            config.bobAnimation.baseY
        ))
        
        // Add combat components
        entity.addComponent(new TeamComponent(TeamType.ENEMY))
        entity.addComponent(new AttackComponent(
            config.combat.attack.damage, 
            config.combat.attack.range, 
            config.combat.attack.cooldown
        ))
        entity.addComponent(new TargetComponent(config.combat.target.searchRange))
        entity.addComponent(new AttackAnimationComponent(
            config.combat.attackAnimation.scaleMultiplier, 
            config.combat.attackAnimation.duration
        ))
        
        // Add movement component
        entity.addComponent(new MovementComponent(
            config.movement.targetPosition,
            config.movement.maxSpeed,
            config.movement.targetReachedThreshold,
            config.movement.acceleration,
            config.movement.deceleration,
            config.movement.decelerationDistance
        ))

        // Set initial position of geometry group
        geometryComponent.getGeometryGroup().position.set(config.position.x, config.position.y, config.position.z);

        // Make entity geometry visible by adding to scene
        this.scene.add(geometryComponent.getGeometryGroup())

        // We return the entity in case direct reference is required
        return entity
    }
}