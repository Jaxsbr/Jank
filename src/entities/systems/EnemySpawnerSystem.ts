import * as THREE from 'three';
import { EntityManager } from '../../ecs/EntityManager';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { EntityFactory } from '../EntityFactory';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TeamComponent, TeamType } from '../components/TeamComponent';
import { EnemyEntityConfig, defaultEnemyEntityConfig } from '../config/EnemyEntityConfig';
import { RoundConfig, WaveConfig, defaultWaveConfig } from '../config/WaveSpawnerConfig';

export interface EnemySpawnerConfig {
    innerRadius: number;
    outerRadius: number;
    waveConfig?: WaveConfig; // Optional wave config, uses default if not provided
}

enum SpawnerState {
    SPAWNING_ROUND,         // Actively spawning enemies for current round
    WAITING_FOR_ROUND_CLEAR, // All enemies spawned, waiting for kills
    ROUND_BREAK,            // Round cleared, countdown to next round
    WAITING_FOR_WAVE_CLEAR, // All 3 rounds spawned, waiting for final kills
    WAVE_BREAK              // Wave cleared, countdown to next wave
}

export class EnemySpawnerSystem {
    private readonly entityFactory: EntityFactory;
    private readonly entityManager: EntityManager;
    private readonly config: EnemySpawnerConfig;
    private readonly waveConfig: WaveConfig;

    // State management
    private currentState: SpawnerState = SpawnerState.WAVE_BREAK;
    private currentWave: number = 1;
    private currentRound: number = 0;
    private currentRoundConfig: RoundConfig | null = null;

    // Spawning state
    private batchesSpawnedThisRound: number = 0;
    private enemiesSpawnedThisRound: number = 0;
    private spawnTimer: number = 0;
    private breakTimer: number = 0;
    private enemiesSpawnedThisWave: number = 0; // Track total enemies spawned in current wave

    // Event tracking
    private lastRegisteredEnemyCount: number = 0;
    private totalEnemiesSpawned: number = 0;

    constructor(entityFactory: EntityFactory, entityManager: EntityManager, config: EnemySpawnerConfig) {
        this.entityFactory = entityFactory;
        this.entityManager = entityManager;
        this.config = config;
        this.waveConfig = config.waveConfig ?? defaultWaveConfig;

        // Listen for enemy kills to track completion
        GlobalEventDispatcher.registerListener('EnemySpawnerSystem', {
            onEvent: (event: Event) => {
                if (event.eventName === EventType.EnemyKilled) {
                    this.handleEnemyKilled();
                }
            }
        });

        // Start with wave break (will trigger first wave start)
        this.currentState = SpawnerState.WAVE_BREAK;
        this.breakTimer = 0; // Start immediately
    }

    public update(deltaSeconds: number): void {
        // Do not spawn if the core is dead
        if (!this.isCoreAlive()) {
            return;
        }

        switch (this.currentState) {
            case SpawnerState.SPAWNING_ROUND:
                this.updateSpawningRound(deltaSeconds);
                break;
            case SpawnerState.WAITING_FOR_ROUND_CLEAR:
                this.updateWaitingForRoundClear();
                break;
            case SpawnerState.ROUND_BREAK:
                this.updateRoundBreak(deltaSeconds);
                break;
            case SpawnerState.WAITING_FOR_WAVE_CLEAR:
                this.updateWaitingForWaveClear();
                break;
            case SpawnerState.WAVE_BREAK:
                this.updateWaveBreak(deltaSeconds);
                break;
        }
    }

    private updateSpawningRound(deltaSeconds: number): void {
        if (!this.currentRoundConfig) {
            this.currentState = SpawnerState.WAITING_FOR_ROUND_CLEAR;
            return;
        }

        // Check if all batches have been spawned
        if (this.batchesSpawnedThisRound >= this.currentRoundConfig.totalBatches) {
            this.currentState = SpawnerState.WAITING_FOR_ROUND_CLEAR;
            return;
        }

        this.spawnTimer += deltaSeconds;

        // Check if it's time to spawn the next batch
        if (this.spawnTimer >= this.currentRoundConfig.spawnInterval) {
            // Spawn a batch of enemies
            for (let i = 0; i < this.currentRoundConfig.batchSize; i++) {
                this.spawnEnemy();
                this.enemiesSpawnedThisRound++;
            }

            this.batchesSpawnedThisRound++;
            this.spawnTimer = 0;

            // Check if we're done spawning this round
            if (this.batchesSpawnedThisRound >= this.currentRoundConfig.totalBatches) {
                this.currentState = SpawnerState.WAITING_FOR_ROUND_CLEAR;
            }
        }
    }

    private updateWaitingForRoundClear(): void {
        const enemyCount = this.getActiveEnemyCount();
        
        // Check if all enemies are killed
        if (enemyCount === 0 && this.enemiesSpawnedThisRound > 0) {
            if (this.currentRound < 3) {
                // Move to round break, then next round
                this.startRoundBreak();
            } else {
                // All rounds complete, wait for final enemies to be killed
                this.currentState = SpawnerState.WAITING_FOR_WAVE_CLEAR;
            }
        }
    }

    private updateRoundBreak(deltaSeconds: number): void {
        this.breakTimer += deltaSeconds;
        // Break duration handled by announcement UI, just wait
        // This state will transition externally when countdown completes
    }

    private updateWaitingForWaveClear(): void {
        const enemyCount = this.getActiveEnemyCount();
        
        // Check if all enemies are killed
        if (enemyCount === 0) {
            this.startWaveBreak();
        }
    }

    private updateWaveBreak(deltaSeconds: number): void {
        this.breakTimer += deltaSeconds;
        // Break duration handled by announcement UI, just wait
        // This state will transition externally when countdown completes
    }

    private startRoundBreak(): void {
        this.currentState = SpawnerState.ROUND_BREAK;
        this.breakTimer = 0;
        
        // Dispatch round completed event
        GlobalEventDispatcher.dispatch(new Event(EventType.RoundCompleted, {
            wave: this.currentWave,
            round: this.currentRound
        }));
    }

    private startWaveBreak(): void {
        this.currentState = SpawnerState.WAVE_BREAK;
        this.breakTimer = 0;
        
        // Dispatch wave completed event
        GlobalEventDispatcher.dispatch(new Event(EventType.WaveCompleted, {
            wave: this.currentWave
        }));
    }

    private spawnEnemy(): void {
        const corePos = this.getCorePosition();
        const spawnPos = this.randomPointInRing(corePos, this.config.innerRadius, this.config.outerRadius);

        // Calculate HP scaling based on wave (25 HP per wave)
        const waveHpBonus = 25 * this.currentWave;

        const cfg: EnemyEntityConfig = {
            ...defaultEnemyEntityConfig,
            health: {
                maxHP: defaultEnemyEntityConfig.health.maxHP + waveHpBonus,
            },
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
        this.totalEnemiesSpawned++;
        this.enemiesSpawnedThisWave++;
    }

    /**
     * Start the current wave (called from outside during wave break)
     */
    public startWave(): void {
        this.currentRound = 0;
        this.currentState = SpawnerState.ROUND_BREAK; // Will immediately transition to first round
        this.enemiesSpawnedThisWave = 0; // Reset wave counter
        
        // Dispatch wave started event
        GlobalEventDispatcher.dispatch(new Event(EventType.WaveStarted, {
            wave: this.currentWave
        }));

        // Start first round immediately
        this.startNextRound();
    }

    /**
     * Start the next round (called from outside during round break)
     */
    public startNextRound(): void {
        this.currentRound++;
        
        if (this.currentRound > 3) {
            console.error('Trying to start round > 3');
            return;
        }

        this.currentRoundConfig = this.waveConfig.rounds[this.currentRound - 1] ?? null;
        this.batchesSpawnedThisRound = 0;
        this.enemiesSpawnedThisRound = 0;
        this.spawnTimer = 0;
        this.currentState = SpawnerState.SPAWNING_ROUND;

        // Dispatch round started event
        GlobalEventDispatcher.dispatch(new Event(EventType.RoundStarted, {
            wave: this.currentWave,
            round: this.currentRound
        }));
    }

    /**
     * Advance to next wave (called from outside during wave break)
     */
    public advanceWave(): void {
        this.currentWave++;
        this.currentRound = 0;
    }

    /**
     * Called by round break handler when countdown completes
     */
    public onRoundBreakComplete(): void {
        this.startNextRound();
    }

    /**
     * Called by wave break handler when countdown completes
     */
    public onWaveBreakComplete(): void {
        this.advanceWave();
        this.startWave();
    }

    private handleEnemyKilled(): void {
        // Track enemy count changes for completion detection
        this.lastRegisteredEnemyCount = this.getActiveEnemyCount();
    }

    private getActiveEnemyCount(): number {
        const entities = this.entityManager.getEntities();
        let count = 0;
        for (const entity of entities) {
            const team = entity.getComponent(TeamComponent);
            if (team && team.getTeamType() === TeamType.ENEMY) {
                const health = entity.getComponent(HealthComponent);
                if (health && health.isAlive()) {
                    count++;
                }
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

    // Getters for UI
    public getCurrentWave(): number {
        return this.currentWave;
    }

    public getCurrentRound(): number {
        return this.currentRound;
    }

    public isInWaveBreak(): boolean {
        return this.currentState === SpawnerState.WAVE_BREAK;
    }

    public isInRoundBreak(): boolean {
        return this.currentState === SpawnerState.ROUND_BREAK;
    }

    /**
     * Reset the spawner to initial state.
     */
    public reset(): void {
        this.currentState = SpawnerState.WAVE_BREAK;
        this.currentWave = 1;
        this.currentRound = 0;
        this.currentRoundConfig = null;
        this.batchesSpawnedThisRound = 0;
        this.enemiesSpawnedThisRound = 0;
        this.spawnTimer = 0;
        this.breakTimer = 0;
        this.lastRegisteredEnemyCount = 0;
        this.totalEnemiesSpawned = 0;
        this.enemiesSpawnedThisWave = 0;
        this.breakTimer = 0; // Start immediately to trigger first wave
    }

    /**
     * Get total enemies spawned in the current wave
     */
    public getEnemiesSpawnedThisWave(): number {
        return this.enemiesSpawnedThisWave;
    }

    /**
     * Get total enemies that will be spawned for the current wave
     */
    public getTotalEnemiesForWave(): number {
        let total = 0;
        for (const roundConfig of this.waveConfig.rounds) {
            total += roundConfig.totalBatches * roundConfig.batchSize;
        }
        return total;
    }

    /**
     * Get enemy counts per round for the current wave
     */
    public getRoundEnemyCounts(): number[] {
        return this.waveConfig.rounds.map(roundConfig => 
            roundConfig.totalBatches * roundConfig.batchSize
        );
    }
}
