import * as THREE from 'three';
import { Entity } from '../ecs/Entity';
import { EffectType } from './EffectType';
import { HexCoordinate } from './HexCoordinate';
import { TileEffectType } from './TileEffectType';
import { TileFactoryConfig } from './TileFactoryConfig';
import { TileType } from './TileType';
import { TileComponent } from './components/TileComponent';
import { TileEffectComponent } from './components/TileEffectComponent';
import { TileMaterial, TileVisualComponent } from './components/TileVisualComponent';
import { defaultColorTransitionEffectConfig } from './configs/ColorTransitionEffectConfig';
import { defaultPulseEffectConfig } from './configs/PulseEffectConfig';
import { defaultStaticEffectConfig } from './configs/StaticEffectConfig';

export class TileFactory {
    private scene: THREE.Scene;
    private config: TileFactoryConfig;

    constructor(scene: THREE.Scene, config?: Partial<TileFactoryConfig>) {
        this.scene = scene;
        this.config = {
            tileSize: 0.85,
            materials: {
                center: {
                    color: 0x00ff00, // Green
                    roughness: 0.3,
                    metalness: 0.1
                },
                [TileType.ONE]: {
                    color: 0xff0000, // Red
                    roughness: 0.8,
                    metalness: 0.1
                },
                [TileType.TWO]: {
                    color: 0x0000ff, // Blue
                    roughness: 0.6,
                    metalness: 0.1
                },
                [TileType.THREE]: {
                    color: 0xffff00, // Yellow
                    roughness: 0.5,
                    metalness: 0.3
                },
                [TileType.FOUR]: {
                    color: 0xff00ff, // Magenta
                    roughness: 0.7,
                    metalness: 0.2
                },
                [TileType.FIVE]: {
                    color: 0x00ffff, // Cyan
                    roughness: 0.4,
                    metalness: 0.4
                },
                [TileType.SIX]: {
                    color: 0xff8800, // Orange
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
    private createEffectComponent(tileType: TileType): TileEffectComponent | null {
        const effectType = EffectType.ATTACK;
        
        switch (tileType) {
            case TileType.ONE:
                return new TileEffectComponent(
                    effectType, 
                    10, 
                    defaultPulseEffectConfig.duration,
                    TileEffectType.PULSE,
                    undefined,
                    defaultPulseEffectConfig,
                    undefined
                );
            case TileType.TWO:
                return new TileEffectComponent(
                    effectType, 
                    10, 
                    defaultStaticEffectConfig.duration,
                    TileEffectType.STATIC,
                    defaultStaticEffectConfig,
                    undefined,
                    undefined
                );
            case TileType.THREE:
                return new TileEffectComponent(
                    effectType, 
                    10, 
                    defaultColorTransitionEffectConfig.duration,
                    TileEffectType.COLOR_TRANSITION,
                    undefined,
                    undefined,
                    defaultColorTransitionEffectConfig
                );
            default:
                return null; // Other tile types have no effects
        }
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