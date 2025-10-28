import * as THREE from 'three';
import { Entity } from '../ecs/Entity';
import { HexCoordinate } from './HexCoordinate';
import { TileComponent } from './components/TileComponent';
import { TileVisualComponent } from './components/TileVisualComponent';
import { TileAppearanceConfig } from './configs/TileAppearanceConfig';

export class TileFactory {
    private scene: THREE.Scene;
    private config: typeof TileAppearanceConfig;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.config = TileAppearanceConfig;
    }

    /**
     * Create the center tile (special tile under the player)
     */
    public createCenterTile(): Entity {
        const entity = new Entity();
        
        // Add tile component with center tile data
        const tileComponent = new TileComponent(0, 0, 'center', true);
        entity.addComponent(tileComponent);
        
        // Add visual component with unified material
        const visualComponent = new TileVisualComponent(this.config.tileSize, this.config.defaultMaterial);
        entity.addComponent(visualComponent);

        // Set idle emissive color (higher base for visible heartbeat)
        visualComponent.setEmissive(this.config.idleEmissiveColor, 0.3);

        // Add to scene
        this.scene.add(visualComponent.getTileMesh());
        
        return entity;
    }

    /**
     * Create a regular tile
     */
    public createTile(coordinate: HexCoordinate): Entity | null {
        const entity = new Entity();
        
        // Add tile component
        const tileComponent = new TileComponent(coordinate.q, coordinate.r, 'tile', false);
        entity.addComponent(tileComponent);
        
        // Add visual component with unified material (ignore tileType for visuals)
        const visualComponent = new TileVisualComponent(this.config.tileSize, this.config.defaultMaterial);
        entity.addComponent(visualComponent);

        // Set idle emissive color (higher base for visible heartbeat)
        visualComponent.setEmissive(this.config.idleEmissiveColor, 0.3);
        
        // Position the tile in world space
        const worldPos = this.hexToWorldPosition(coordinate);

        // Raise tile above the floor and set position
        worldPos.y = 0.1;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        visualComponent.setPosition(worldPos);
        
        // Add to scene
        this.scene.add(visualComponent.getTileMesh());
        
        return entity;
    }

    /**
     * Convert hex coordinates to world position
     */
    private hexToWorldPosition(coordinate: HexCoordinate): THREE.Vector3 {
        // Use tileSpacing for placement to create gaps between tiles
        const s = this.config.tileSpacing ?? this.config.tileSize;
        const x = s * (3/2 * coordinate.q);
        const z = s * (Math.sqrt(3)/2 * coordinate.q + Math.sqrt(3) * coordinate.r);
        return new THREE.Vector3(x, 0, z);
    }
}