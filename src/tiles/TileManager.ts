import * as THREE from 'three';
import { Entity } from '../ecs/Entity';
import { HexCoordinate } from './HexCoordinate';
import { TileFactory } from './TileFactory';
import { TileGrid } from './TileGrid';
import { TileManagerConfig } from './TileManagerConfig';
import { TileType } from './TileType';

export class TileManager {
    private tileGrid: TileGrid;
    private tileFactory: TileFactory;
    private config: TileManagerConfig;
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene, config: TileManagerConfig) {
        this.scene = scene;
        this.config = config;
        this.tileGrid = new TileGrid(scene);
        this.tileFactory = new TileFactory(scene);
    }

    /**
     * Initialize the tile grid with a center tile
     */
    public initialize(): void {
        // Create center tile at (0,0)
        const centerTile = this.tileFactory.createCenterTile();
        this.tileGrid.addTile(centerTile, { q: 0, r: 0 });
    }

    /**
     * Add a tile at the specified hex coordinates
     */
    public addTile(coordinate: HexCoordinate, tileType: TileType = TileType.ONE): Entity | null {
        const tile = this.tileFactory.createTile(tileType, coordinate);
        if (tile) {
            this.tileGrid.addTile(tile, coordinate);
            // this.updateCenterTileHeight();
        }
        return tile;
    }

    /**
     * Remove a tile at the specified hex coordinates
     */
    public removeTile(coordinate: HexCoordinate): boolean {
        const tile = this.tileGrid.getTile(coordinate);
        if (tile) {
            // Remove from scene
            // TODO: Implement tile removal from scene
            return true;
        }
        return false;
    }

    /**
     * Get the center tile
     */
    public getCenterTile(): Entity | null {
        return this.tileGrid.getCenterTile();
    }

    /**
     * Get all tiles
     */
    public getAllTiles(): Entity[] {
        return this.tileGrid.getAllTiles();
    }

    /**
     * Get tiles in radius around center
     */
    public getTilesInRadius(radius: number): Entity[] {
        return this.tileGrid.getTilesInRadius({ q: 0, r: 0 }, radius);
    }

    /**
     * Update the center tile height based on surrounding tiles
     */
    private updateCenterTileHeight(): void {
        const centerTile = this.tileGrid.getCenterTile();
        if (!centerTile) return;

        // Calculate height based on number of surrounding tiles
        // const surroundingTiles = this.tileGrid.getTilesInRadius({ q: 0, r: 0 }, 1);
        // const height = Math.max(0, (surroundingTiles.length - 1) * 0.1); // -1 to exclude center tile itself
        
        // TODO: Update center tile height
        // This will affect the player's base Y position
    }

    /**
     * Get the tile grid for direct access
     */
    public getTileGrid(): TileGrid {
        return this.tileGrid;
    }
}
