import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { TileComponent } from '../components/TileComponent';
import { TileVisualComponent } from '../components/TileVisualComponent';

export class TileHeightSystem implements IEntitySystem {
    private baseHeight: number;
    private heightPerLevel: number;

    constructor(baseHeight: number = 0.1, heightPerLevel: number = 0.05) {
        this.baseHeight = baseHeight;
        this.heightPerLevel = heightPerLevel;
    }

    update(entities: readonly Entity[]): void {
        entities.forEach(entity => {
            if (entity.hasComponent(TileComponent) && entity.hasComponent(TileVisualComponent)) {
                const tileComponent = entity.getComponent(TileComponent);
                const visualComponent = entity.getComponent(TileVisualComponent);
                
                if (tileComponent && visualComponent) {
                    // Calculate target height based on tile level and type
                    const targetHeight = this.calculateTargetHeight(tileComponent);
                    visualComponent.setTargetHeight(targetHeight);
                }
            }
        });
    }

    /**
     * Calculate target height for a tile based on its properties
     */
    private calculateTargetHeight(tileComponent: TileComponent): number {
        let height = this.baseHeight;
        
        // Add height based on tile level
        height += (tileComponent.getLevel() - 1) * this.heightPerLevel;
        
        // Add height based on tile type
        switch (tileComponent.getTileType()) {
            case 'center':
                height += 0.1; // Center tiles are slightly higher
                break;
            case 'attack':
                height += 0.05; // Attack tiles are slightly elevated
                break;
            case 'buff':
                height += 0.03; // Buff tiles are slightly elevated
                break;
            default:
                // No additional height for default tiles
                break;
        }
        
        return height;
    }

    /**
     * Set base height for all tiles
     */
    public setBaseHeight(height: number): void {
        this.baseHeight = Math.max(0, height);
    }

    /**
     * Set height increment per level
     */
    public setHeightPerLevel(height: number): void {
        this.heightPerLevel = Math.max(0, height);
    }

    /**
     * Get base height
     */
    public getBaseHeight(): number {
        return this.baseHeight;
    }

    /**
     * Get height per level
     */
    public getHeightPerLevel(): number {
        return this.heightPerLevel;
    }
}
