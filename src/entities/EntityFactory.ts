import { Scene, Vector3 } from 'three';
import { Entity } from '../ecs/Entity';
import { EntityManager } from '../ecs/EntityManager';
import { metaPointsService } from '../utils/MetaPointsService';
import { Time } from '../utils/Time';
import { AbilityComponent } from './components/AbilityComponent';
import { AttackAnimationComponent } from './components/AttackAnimationComponent';
import { AttackComponent } from './components/AttackComponent';
import { BobAnimationComponent } from './components/BobAnimationComponent';
import { CollisionComponent } from './components/CollisionComponent';
import { EnemyTypeComponent } from './components/EnemyTypeComponent';
import { GeometryComponent, SecondaryGeometryConfig, SecondaryGeometryType } from './components/GeometryComponent';
import { HealthComponent } from './components/HealthComponent';
import { MetaUpgradeComponent } from './components/MetaUpgradeComponent';
import { MovementComponent } from './components/MovementComponent';
import { PositionComponent } from './components/PositionComponent';
import { ProjectileComponent } from './components/ProjectileComponent';
import { RotationComponent } from './components/RotationComponent';
import { TargetComponent } from './components/TargetComponent';
import { TeamComponent, TeamType } from './components/TeamComponent';
import { abilityConfigByLevel } from './config/AbilityConfig';
import { BaseEntityConfig } from './config/BaseEntityConfig';
import { CollisionConfig, defaultCollisionConfig } from './config/CollisionConfig';
import { CombatConfig } from './config/CombatConfig';
import { CoreEntityConfig, defaultCoreEntityConfig } from './config/CoreEntityConfig';
import { getCoreVisualLevel } from './config/CoreVisualLevelConfig';
import { EnemyEntityConfig, defaultEnemyEntityConfig } from './config/EnemyEntityConfig';
import { EnemyType, enemyTypeConfigs } from './config/EnemyTypeConfig';
import { GeometryConfig, geometryConfigsByLevel } from './config/GeometryConfig';
import { materialConfigsByLevel } from './config/MaterialConfig';
import { defaultMetaUpgradeConfig } from './config/MetaUpgradeConfig';
import { defaultPelletProjectileConfig } from './config/PelletProjectileConfig';
import { defaultRangedAttackConfig } from './config/RangedAttackConfig';
import {
    calculateScaledDamage,
    calculateScaledHP,
    calculateScaledSpeed
} from './config/WaveDifficultyConfig';

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
        
        config.positions.forEach((pos: Vector3, index: number) => {
            // Use per-protrusion embedRatio or default to config's embedRatio
            let embedRatio = config.protrusions.embedRatio;
            if (config.embedRatios?.[index] !== undefined) {
                const specifiedRatio = config.embedRatios[index];
                if (specifiedRatio !== undefined) {
                    embedRatio = specifiedRatio;
                }
            }
            const embedDepth = config.protrusions.radius * embedRatio;
            
            // Normalize the position to be on the sphere surface
            const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
            const normalizedX = pos.x / length;
            const normalizedY = pos.y / length;
            const normalizedZ = pos.z / length;

            // Position the geometry so it's embedded
            const embedPosition = config.mainSphere.radius - embedDepth;
            const finalX = normalizedX * embedPosition;
            const finalY = normalizedY * embedPosition;
            const finalZ = normalizedZ * embedPosition;

            // Use specified protrusion type or default to Sphere
            let protrusionType = SecondaryGeometryType.Sphere;
            if (config.protrusionTypes?.[index] !== undefined) {
                const specifiedType = config.protrusionTypes[index];
                if (specifiedType !== undefined) {
                    protrusionType = specifiedType;
                }
            }

            secondaryConfigs.push({
                type: protrusionType,
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
        geometryComponent.setPosition(position.x, position.y, position.z);

        // Make entity geometry visible by adding to scene
        this.scene.add(geometryComponent.getGeometryGroup());
    }

    createCoreEntity(config: CoreEntityConfig = defaultCoreEntityConfig): Entity {
        const entity = this.entityManager.createEntity();
        
        // Determine visual level based on wave points
        const wavePoints = metaPointsService.getWavePoints();
        const visualLevel = getCoreVisualLevel(wavePoints);
        
        // Select level-specific geometry and material configs
        const levelGeometry = geometryConfigsByLevel[visualLevel];
        const levelMaterial = materialConfigsByLevel[visualLevel];
        
        // Create modified config with level-specific visuals
        const levelConfig: CoreEntityConfig = {
            ...config,
            geometry: levelGeometry,
            material: levelMaterial
        };
        
        // Add base components (health, position, geometry, rotation, bob animation)
        const geometryComponent = this.addBaseComponents(entity, levelConfig);
        
        // Add combat components
        this.addCombatComponents(entity, config.combat, TeamType.CORE);
        
        // Add ability component with default config
        const defaultAbilityConfig = abilityConfigByLevel[1];
        const cooldown = defaultAbilityConfig?.cooldownDuration ?? 8;
        entity.addComponent(new AbilityComponent(cooldown));
        
        // Read purchased upgrades from meta progression service
        const purchasedUpgrades = metaPointsService.getPurchasedUpgrades();
        
        // Get melee range rings from level-based upgrade (level directly corresponds to ring count)
        let meleeRangeRings = defaultMetaUpgradeConfig.defaultMeleeRangeRings;
        const meleeRangeLevel = purchasedUpgrades['melee-range'] ?? 0;
        if (meleeRangeLevel > 0) {
            meleeRangeRings = meleeRangeLevel;
        }
        // Clamp to max
        meleeRangeRings = Math.min(meleeRangeRings, defaultMetaUpgradeConfig.maxMeleeRangeRings);
        
        // Calculate extra melee targets (multi-melee)
        // Level directly corresponds to number of extra targets (level 1 = 1 extra, level 2 = 2 extra, etc.)
        let extraMeleeTargets = defaultMetaUpgradeConfig.defaultExtraMeleeTargets;
        const multiMeleeLevel = purchasedUpgrades['multi-melee'] ?? 0;
        if (multiMeleeLevel > 0) {
            extraMeleeTargets = multiMeleeLevel;
        }
        // Clamp to max
        extraMeleeTargets = Math.min(extraMeleeTargets, defaultMetaUpgradeConfig.maxExtraMeleeTargets);
        
        // Get stun pulse level from level-based upgrade
        let stunPulseLevel = defaultMetaUpgradeConfig.defaultStunPulseLevel;
        const stunPulseUpgradeLevel = purchasedUpgrades['stun-pulse'] ?? 0;
        if (stunPulseUpgradeLevel > 0) {
            stunPulseLevel = stunPulseUpgradeLevel;
        }
        // Clamp to max
        stunPulseLevel = Math.min(stunPulseLevel, defaultMetaUpgradeConfig.maxStunPulseLevel);
        
        // Get melee knockback level from level-based upgrade
        const meleeKnockbackLevel = purchasedUpgrades['melee-knockback'] ?? 0;
        
        // Check if advanced melee targeting is unlocked
        const advancedTargetingLevel = purchasedUpgrades['advanced-melee-targeting'] ?? 0;
        const initialTargetingMode: 'nearest' | 'lowest' = advancedTargetingLevel > 0 ? 'nearest' : 'nearest';
        
        // Get ranged attack level from level-based upgrade
        let rangedAttackLevel = defaultMetaUpgradeConfig.defaultRangedAttackLevel;
        const rangedAttackUpgradeLevel = purchasedUpgrades['ranged-attack'] ?? 0;
        if (rangedAttackUpgradeLevel > 0) {
            rangedAttackLevel = rangedAttackUpgradeLevel;
        }
        // Clamp to max
        rangedAttackLevel = Math.min(rangedAttackLevel, defaultMetaUpgradeConfig.maxRangedAttackLevel);
        
        // Apply melee damage bonus (+25 per level)
        const meleeDamageLevel = purchasedUpgrades['melee-damage'] ?? 0;
        if (meleeDamageLevel > 0) {
            const attackComponent = entity.getComponent(AttackComponent);
            if (attackComponent) {
                const baseDamage = attackComponent.getDamage();
                const damageBonus = meleeDamageLevel * 25; // +25 per level
                attackComponent.setDamage(baseDamage + damageBonus);
            }
        }
        
        // Add meta upgrade component with purchased upgrades
        entity.addComponent(new MetaUpgradeComponent(
            extraMeleeTargets,
            meleeRangeRings,
            stunPulseLevel,
            meleeKnockbackLevel,
            initialTargetingMode,
            rangedAttackLevel > 0, // rangedAttackUnlocked determined by level
            rangedAttackLevel
        ));
        
        // Add collision component (core is immovable)
        // Use geometry main sphere radius multiplied by collision config multiplier
        const collisionRadius = config.geometry.mainSphere.radius * defaultCollisionConfig.defaultRadiusMultiplier;
        entity.addComponent(new CollisionComponent(collisionRadius, true)); // true = immovable
        
        // Set up entity in scene
        this.addEntityToScene(entity, geometryComponent, config.position);

        return entity;
    }

    /**
     * Merges enemy type config overrides into base config.
     * Type configs override base values for stats and visuals.
     * Applies wave scaling to HP, damage, and speed if wave number is provided.
     */
    private applyEnemyTypeConfig(baseConfig: EnemyEntityConfig, enemyType: EnemyType, wave?: number): EnemyEntityConfig {
        const typeConfig = enemyTypeConfigs[enemyType];
        
        // Start with type's base stats
        let finalHP = typeConfig.health.maxHP;
        let finalDamage = typeConfig.combat.attack.damage;
        let finalSpeed = typeConfig.movement.maxSpeed;
        
        // Apply wave scaling if wave number is provided
        if (wave !== undefined) {
            finalHP = calculateScaledHP(finalHP, wave);
            finalDamage = calculateScaledDamage(finalDamage, wave);
            finalSpeed = calculateScaledSpeed(finalSpeed, wave);
        }
        
        return {
            ...baseConfig,
            health: {
                maxHP: finalHP
            },
            movement: {
                ...baseConfig.movement,
                maxSpeed: finalSpeed
            },
            combat: {
                ...baseConfig.combat,
                attack: {
                    ...baseConfig.combat.attack,
                    damage: finalDamage
                }
            },
            geometry: typeConfig.geometry,
            material: typeConfig.material,
            bobAnimation: typeConfig.bobAnimation
        };
    }

    createEnemyEntity(
        config: EnemyEntityConfig = defaultEnemyEntityConfig, 
        collisionConfig: CollisionConfig = defaultCollisionConfig,
        enemyType?: EnemyType,
        wave?: number
    ): Entity {
        const entity = this.entityManager.createEntity();
        
        // Apply enemy type config overrides if type is specified
        // Pass wave number for scaling
        const finalConfig = enemyType 
            ? this.applyEnemyTypeConfig(config, enemyType, wave)
            : config;
        
        // Add base components (health, position, geometry, rotation, bob animation)
        const geometryComponent = this.addBaseComponents(entity, finalConfig);
        
        // Add combat components
        this.addCombatComponents(entity, finalConfig.combat, TeamType.ENEMY);
        
        // Add enemy type component if type is specified
        if (enemyType) {
            entity.addComponent(new EnemyTypeComponent(enemyType));
        }
        
        // Add movement component (enemy-specific)
        entity.addComponent(new MovementComponent(
            finalConfig.movement.targetPosition,
            finalConfig.movement.maxSpeed,
            finalConfig.movement.targetReachedThreshold,
            finalConfig.movement.acceleration,
            finalConfig.movement.deceleration,
            finalConfig.movement.decelerationDistance
        ));
        
        // Add collision component (enemy-specific)
        // Use geometry main sphere radius multiplied by collision config multiplier
        const collisionRadius = finalConfig.geometry.mainSphere.radius * collisionConfig.defaultRadiusMultiplier;
        entity.addComponent(new CollisionComponent(collisionRadius));
        
        // Set up entity in scene
        this.addEntityToScene(entity, geometryComponent, finalConfig.position);

        return entity;
    }

    /**
     * Create a projectile entity
     * Uses projectile config based on core's ranged.projectileType
     * Currently supports 'pellet' type
     */
    createProjectileEntity(
        startPosition: Vector3,
        direction: Vector3,
        attacker: Entity,
        targetEntity: Entity | null = null,
        damage?: number,
        rangedLevel?: number
    ): Entity {
        const entity = this.entityManager.createEntity();
        const rangedConfig = defaultCoreEntityConfig.combat.ranged;

        // Get projectile config based on type
        // TODO: Add support for other projectile types (arrow, bolt, etc.)
        let projectileConfig;
        if (rangedConfig.projectileType === 'pellet') {
            projectileConfig = defaultPelletProjectileConfig;
        } else {
            // Fallback to pellet if unknown type
            projectileConfig = defaultPelletProjectileConfig;
        }

        // Check if we have level-specific visual config
        let visualRadius = projectileConfig.radius;
        let visualMaterial = projectileConfig.material;
        let visualSegments = 16; // Default segments
        if (rangedLevel && rangedLevel > 0) {
            const levelConfig = defaultRangedAttackConfig.levels[rangedLevel];
            if (levelConfig?.visual) {
                visualRadius = levelConfig.visual.radius;
                visualMaterial = levelConfig.visual.material;
                visualSegments = levelConfig.visual.segments ?? 16;
            }
        }

        // Normalize direction
        const normalizedDirection = direction.clone().normalize();
        const velocity = normalizedDirection.multiplyScalar(projectileConfig.speed);

        // Create projectile-specific geometry (small sphere, no protrusions)
        const projectileGeometryConfig: GeometryConfig = {
            mainSphere: {
                radius: visualRadius, // Use level-specific radius
                segments: visualSegments // Use level-specific segments
            },
            protrusions: {
                radius: 0,
                segments: 0,
                embedRatio: 0
            },
            positions: []
        };

        // Use material from ranged level config if available, otherwise from projectile config
        const projectileMaterial = visualMaterial;

        const secondaryConfigs = this.createSecondaryGeometryConfigs(projectileGeometryConfig);
        const geometryComponent = new GeometryComponent(
            projectileGeometryConfig.mainSphere.radius,
            projectileGeometryConfig.mainSphere.segments,
            secondaryConfigs,
            projectileMaterial
        );

        // Add components
        entity.addComponent(new PositionComponent(startPosition.x, startPosition.y, startPosition.z));
        entity.addComponent(geometryComponent);

        // Get attacker team
        const attackerTeam = attacker.getComponent(TeamComponent);
        const teamType = attackerTeam?.getTeamType() ?? TeamType.CORE;
        entity.addComponent(new TeamComponent(teamType));

        // Add projectile component
        // Damage is attacker-specific (from meta upgrade level if provided, otherwise from core config)
        const projectileDamage = damage ?? rangedConfig.damage;
        const projectileComponent = new ProjectileComponent(
            velocity,
            projectileDamage,
            projectileConfig.maxRange,
            startPosition.clone(),
            attacker.getId(),
            targetEntity?.getId() ?? null,
            projectileConfig.knockback ?? null,
            Time.now()
        );
        entity.addComponent(projectileComponent);

        // Set up entity in scene
        this.addEntityToScene(entity, geometryComponent, startPosition);

        return entity;
    }
}