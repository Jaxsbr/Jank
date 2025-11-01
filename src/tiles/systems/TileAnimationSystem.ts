import { Entity } from '../../ecs/Entity';
import { EntityManager } from '../../ecs/EntityManager';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { HealthComponent } from '../../entities/components/HealthComponent';
import { TeamComponent, TeamType } from '../../entities/components/TeamComponent';
import { EnemySpawnerSystem } from '../../entities/systems/EnemySpawnerSystem';
import { Time } from '../../utils/Time';
import { TileVisualComponent } from '../components/TileVisualComponent';
import { TileAnimationConfig } from '../configs/TileAnimationConfig';

export class TileAnimationSystem implements IEntitySystem {
    private animationSpeed: number;
    private heartbeatTime: number;
    private config: TileAnimationConfig;
    private enemySpawner: EnemySpawnerSystem | null;
    private entityManager: EntityManager | null;

    constructor(config: TileAnimationConfig, enemySpawner: EnemySpawnerSystem | null = null, entityManager: EntityManager | null = null) {
        this.config = config;
        this.animationSpeed = config.speed;
        this.heartbeatTime = 0;
        this.enemySpawner = enemySpawner;
        this.entityManager = entityManager;
    }

    update(entities: readonly Entity[]): void {
        const deltaTime = Time.getDeltaTime(); // Use actual delta time from Time system
        this.heartbeatTime += deltaTime;

        // Find core entity and check health
        let coreHealthPercentage: number | null = null;
        if (this.entityManager) {
            const allEntities = this.entityManager.getEntities();
            const coreEntityResult = EntityQuery.from(allEntities)
                .withComponents(TeamComponent, HealthComponent)
                .filter(({ components }) => {
                    const [team] = components;
                    return (team as TeamComponent).getTeamType() === TeamType.CORE;
                })
                .execute()
                .find(({ components }) => {
                    const [, health] = components;
                    return (health as HealthComponent).isAlive();
                });

            if (coreEntityResult) {
                const [, health] = coreEntityResult.components;
                coreHealthPercentage = (health as HealthComponent).getHPPercentage();
            }
        }

        // Determine heartbeat state: idle, active, or critical
        let heartbeatFrequency = this.config.idleHeartbeatFrequency;
        let heartbeatColor = this.config.colors.idle;
        let isInBreak = false;

        if (this.enemySpawner) {
            // Active during rounds (spawning or waiting for clear)
            // Idle during breaks (round break or wave break)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const isInRoundBreak = this.enemySpawner.isInRoundBreak();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const isInWaveBreak = this.enemySpawner.isInWaveBreak();
            isInBreak = (isInRoundBreak as boolean) || (isInWaveBreak as boolean);

            if (isInBreak) {
                // Idle state: breaks between rounds/waves
                heartbeatFrequency = this.config.idleHeartbeatFrequency;
                heartbeatColor = this.config.colors.idle;
            } else {
                // Active or critical state: during enemy rounds
                if (coreHealthPercentage !== null && coreHealthPercentage <= this.config.criticalHealthThreshold) {
                    // Critical state: core health ≤ threshold
                    heartbeatFrequency = this.config.criticalHeartbeatFrequency;
                    heartbeatColor = this.config.colors.critical;
                } else {
                    // Active state: normal enemy rounds with health above threshold
                    heartbeatFrequency = this.config.activeHeartbeatFrequency;
                    heartbeatColor = this.config.colors.active;
                }
            }
        }

        EntityQuery.from(entities)
            .withComponents(TileVisualComponent)
            .execute()
            .forEach(({ components }) => {
                const [visualComponent] = components;
                
                // Update height animation
                visualComponent.updateHeight(deltaTime, this.animationSpeed);
                
                // Update glow intensity animation
                visualComponent.updateGlowIntensity(deltaTime, 2.0);
                
                // Update heartbeat modulation with dynamic frequency and color
                visualComponent.updateIdleHeartbeat(this.heartbeatTime, 0.25, heartbeatFrequency, deltaTime, heartbeatColor);
            });
    }

    /**
     * Set animation speed
     */
    public setAnimationSpeed(speed: number): void {
        this.animationSpeed = Math.max(0, speed);
        this.config.speed = this.animationSpeed;
    }

    /**
     * Get animation speed
     */
    public getAnimationSpeed(): number {
        return this.animationSpeed;
    }
}
