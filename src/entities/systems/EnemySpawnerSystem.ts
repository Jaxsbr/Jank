import * as THREE from 'three';
import { EntityManager } from '../../ecs/EntityManager';
import { EntityFactory } from '../EntityFactory';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TeamComponent, TeamType } from '../components/TeamComponent';
import { EnemyEntityConfig, defaultEnemyEntityConfig } from '../config/EnemyEntityConfig';

export interface EnemySpawnerConfig {
    innerRadius: number;
    outerRadius: number;
    intervalSeconds: number;
    spawnImmediately?: boolean;
    intensity?: {
        reduceEveryNSpawns: number; // e.g., 10
        reductionFactor: number; // e.g., 0.9 (reduce by 10%)
        minIntervalSeconds: number; // floor for interval
    };
}

export class EnemySpawnerSystem {
    private readonly entityFactory: EntityFactory;
    private readonly entityManager: EntityManager;
    private readonly config: EnemySpawnerConfig;
    private elapsedSeconds: number = 0;
    private hasSpawnedInitial: boolean = false;
    private totalSpawned: number = 0;
    private currentIntervalSeconds: number;
    private readonly intensityDefaults = { reduceEveryNSpawns: 10, reductionFactor: 0.9, minIntervalSeconds: 0.5 } as const;

    constructor(entityFactory: EntityFactory, entityManager: EntityManager, config: EnemySpawnerConfig) {
        this.entityFactory = entityFactory;
        this.entityManager = entityManager;
        this.config = config;
        this.currentIntervalSeconds = config.intervalSeconds;
    }

    public update(deltaSeconds: number): void {
        // Do not spawn if the core is dead
        if (!this.isCoreAlive()) {
            return;
        }
        // Initial spawn if requested
        if (this.config.spawnImmediately && !this.hasSpawnedInitial) {
            this.trySpawn();
            this.hasSpawnedInitial = true;
        }

        this.elapsedSeconds += deltaSeconds;
        if (this.elapsedSeconds < this.currentIntervalSeconds) {
            return;
        }

        this.elapsedSeconds = 0;
        this.trySpawn();
    }

    private trySpawn(): void {
        const corePos = this.getCorePosition();
        const spawnPos = this.randomPointInRing(corePos, this.config.innerRadius, this.config.outerRadius);

        const cfg: EnemyEntityConfig = {
            ...defaultEnemyEntityConfig,
            position: spawnPos.clone(),
            movement: {
                ...defaultEnemyEntityConfig.movement,
                targetPosition: corePos.clone(),
            },
            respawn: {
                position: spawnPos.clone(),
            },
        } as EnemyEntityConfig;

        this.entityFactory.createEnemyEntity(cfg);
        
        // Track spawns and reduce interval after every Nth enemy (increase intensity)
        this.totalSpawned += 1;
        const intensity = this.config.intensity ?? this.intensityDefaults;
        if (this.totalSpawned % intensity.reduceEveryNSpawns === 0) {
            // Reduce spawn interval (with floor)
            this.currentIntervalSeconds = Math.max(intensity.minIntervalSeconds, this.currentIntervalSeconds * intensity.reductionFactor);
        }
    }

    private getActiveEnemyCount(): number {
        const entities = this.entityManager.getEntities();
        let count = 0;
        for (const entity of entities) {
            const team = entity.getComponent(TeamComponent);
            if (team && team.getTeamType() === TeamType.ENEMY) {
                count += 1;
            }
        }
        return count;
    }

    private getCorePosition(): THREE.Vector3 {
        const entities = this.entityManager.getEntities();
        for (const entity of entities) {
            const team = entity.getComponent(TeamComponent);
            if (team && team.getTeamType() === TeamType.CORE) {
                const posComp = entity.getComponent(PositionComponent);
                if (posComp) {
                    return new THREE.Vector3(posComp.getX(), posComp.getY(), posComp.getZ());
                }
            }
        }
        // Fallback to origin if core not found
        return new THREE.Vector3(0, 0, 0);
    }

    private isCoreAlive(): boolean {
        const entities = this.entityManager.getEntities();
        for (const entity of entities) {
            const team = entity.getComponent(TeamComponent);
            if (team && team.getTeamType() === TeamType.CORE) {
                const health = entity.getComponent(HealthComponent);
                return health ? health.isAlive() : false;
            }
        }
        return false;
    }

    private randomPointInRing(center: THREE.Vector3, inner: number, outer: number): THREE.Vector3 {
        const innerSq = inner * inner;
        const outerSq = outer * outer;
        const r = Math.sqrt(innerSq + Math.random() * (outerSq - innerSq));
        const theta = Math.random() * Math.PI * 2;
        const offset = new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r);
        return center.clone().add(offset);
    }
}


