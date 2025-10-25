import * as THREE from 'three';
import { Entity } from '../ecs/Entity';
import { HexCoordinate } from './TileGrid';
import { TileComponent } from './components/TileComponent';
import { TileEffectComponent } from './components/TileEffectComponent';
import { TileMaterial, TileVisualComponent } from './components/TileVisualComponent';

export enum TileType {
    ONE = 'one',
    TWO = 'two',
    THREE = 'three',
    FOUR = 'four',
    FIVE = 'five',
    SIX = 'six'
}

export interface TileFactoryConfig {
    tileSize: number;
    materials: {
        center: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.ONE]: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.TWO]: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.THREE]: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.FOUR]: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.FIVE]: {
            color: number;
            roughness: number;
            metalness: number;
        };
        [TileType.SIX]: {
            color: number;
            roughness: number;
            metalness: number;
        };
    };
}

export class TileFactory {
    private scene: THREE.Scene;
    private config: TileFactoryConfig;

    constructor(scene: THREE.Scene, config?: Partial<TileFactoryConfig>) {
        this.scene = scene;
        this.config = {
            tileSize: 1,
            materials: {
                center: {
                    color: 0x00ff00,
                    roughness: 0.3,
                    metalness: 0.1
                },
                [TileType.ONE]: {
                    color: 0xff0000,
                    roughness: 0.8,
                    metalness: 0.1
                },
                [TileType.TWO]: {
                    color: 0x0000ff,
                    roughness: 0.6,
                    metalness: 0.1
                },
                [TileType.THREE]: {
                    color: 0xffff00,
                    roughness: 0.5,
                    metalness: 0.3
                },
                [TileType.FOUR]: {
                    color: 0xff00ff,
                    roughness: 0.7,
                    metalness: 0.2
                },
                [TileType.FIVE]: {
                    color: 0x00ffff,
                    roughness: 0.4,
                    metalness: 0.4
                },
                [TileType.SIX]: {
                    color: 0xff8800,
                    roughness: 0.9,
                    metalness: 0.1
                }
            },
            ...config
        };
    }

    /**
     * Create the center tile (special tile under the player)
     */
    public createCenterTile(): Entity {
        const entity = new Entity();
        
        // Add tile component with center tile data
        const tileComponent = new TileComponent(0, 0, 'center', true);
        entity.addComponent(tileComponent);
        
        // Add visual component
        const visualComponent = new TileVisualComponent(this.config.tileSize, this.config.materials.center);
        entity.addComponent(visualComponent);
        // Add to scene
        this.scene.add(visualComponent.getTileMesh());
        
        return entity;
    }

    /**
     * Create a regular tile
     */
    public createTile(tileType: TileType, coordinate: HexCoordinate): Entity | null {
        const entity = new Entity();
        
        // Add tile component
        const tileComponent = new TileComponent(coordinate.q, coordinate.r, tileType, false);
        entity.addComponent(tileComponent);
        
        // Add visual component
        const visualComponent = new TileVisualComponent(this.config.tileSize, this.getMaterialForTileType(tileType));
        entity.addComponent(visualComponent);
        
        // Add effect component based on tile type
        const effectComponent = this.createEffectComponent(tileType);
        if (effectComponent) {
            entity.addComponent(effectComponent);
        }
        
        // Position the tile in world space
        const worldPos = this.hexToWorldPosition(coordinate);
        visualComponent.getTileMesh().position.copy(worldPos);

        // Raise tile above the floor
        visualComponent.getTileMesh().position.y = 0.1;
        
        // Add to scene
        this.scene.add(visualComponent.getTileMesh());
        
        return entity;
    }

    /**
     * Create effect component based on tile type
     */
    private createEffectComponent(_tileType: TileType): TileEffectComponent | null {
        // For now, no effects for the numbered tile types
        // This can be expanded later when you define what each tile type does
        return null;
    }

    private getMaterialForTileType(tileType: TileType): TileMaterial {
        return this.config.materials[tileType];
    }

    /**
     * Convert hex coordinates to world position
     */
    private hexToWorldPosition(coordinate: HexCoordinate): THREE.Vector3 {
        const x = this.config.tileSize * (3/2 * coordinate.q);
        const z = this.config.tileSize * (Math.sqrt(3)/2 * coordinate.q + Math.sqrt(3) * coordinate.r);
        return new THREE.Vector3(x, 0, z);
    }
}
