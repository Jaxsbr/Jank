import { Entity } from '../ecs/Entity';
import { EntityManager } from '../ecs/EntityManager';
import { HealthComponent } from '../entities/components/HealthComponent';
import { TeamComponent, TeamType } from '../entities/components/TeamComponent';
import { CoreHPHUD } from './CoreHPHUD';

export class CoreHPBarSystem {
    private coreHPBar: CoreHPHUD;
    private entityManager: EntityManager;
    private coreEntity: Entity | null = null;

    constructor(coreHPBar: CoreHPHUD, entityManager: EntityManager) {
        this.coreHPBar = coreHPBar;
        this.entityManager = entityManager;
    }

    public update(): void {
        // Find core entity if not already found, or if cached entity is no longer valid
        if (!this.coreEntity || !this.isEntityValid(this.coreEntity)) {
            this.coreEntity = null; // Clear invalid reference
            this.findCoreEntity();
        }

        // Update HP bar if core entity exists
        if (this.coreEntity) {
            const healthComponent = this.coreEntity.getComponent(HealthComponent);
            if (healthComponent) {
                const currentHP = healthComponent.getHP();
                const maxHP = healthComponent.getMaxHP();
                this.coreHPBar.updateHP(currentHP, maxHP);
            }
        }

        // HUD is in screen space; no world-position update needed
    }

    private isEntityValid(entity: Entity): boolean {
        // Check if entity still exists in the entity manager
        const entities = this.entityManager.getEntities();
        return entities.includes(entity);
    }

    /**
     * Reset the cached core entity reference.
     * Call this when restarting the game to ensure a fresh core is found.
     */
    public resetCoreEntity(): void {
        this.coreEntity = null;
    }

    private findCoreEntity(): void {
        const entities = this.entityManager.getEntities();
        
        for (const entity of entities) {
            const teamComponent = entity.getComponent(TeamComponent);
            if (teamComponent && teamComponent.getTeamType() === TeamType.CORE) {
                this.coreEntity = entity;
                break;
            }
        }
    }

    public destroy(): void {
        this.coreHPBar.destroy();
    }
}
