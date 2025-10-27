import * as THREE from 'three';
import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../entities/components/PositionComponent';
import { HexCoordinate } from './HexCoordinate';
import { TileComponent } from './components/TileComponent';

export class TileGrid {
    private tiles: Map<string, Entity> = new Map();
    private centerTile: Entity | null = null;
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    /**
     * Add a tile to the grid at the specified hex coordinates
     */
    public addTile(tile: Entity, coordinate: HexCoordinate): void {
        const key = this.coordinateToKey(coordinate);
        this.tiles.set(key, tile);
        
        // If this is the center tile (0,0), set it as center
        if (coordinate.q === 0 && coordinate.r === 0) {
            this.centerTile = tile;
        }
    }

    /**
     * Get a tile at the specified hex coordinates
     */
    public getTile(coordinate: HexCoordinate): Entity | null {
        const key = this.coordinateToKey(coordinate);
        return this.tiles.get(key) ?? null;
    }

    /**
     * Get the center tile
     */
    public getCenterTile(): Entity | null {
        return this.centerTile;
    }

    /**
     * Get all tiles in a radius around a center point
     */
    public getTilesInRadius(center: HexCoordinate, radius: number): Entity[] {
        const tiles: Entity[] = [];
        
        for (let q = -radius; q <= radius; q++) {
            for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
                const tile = this.getTile({ q: center.q + q, r: center.r + r });
                if (tile) {
                    tiles.push(tile);
                }
            }
        }
        
        return tiles;
    }

    /**
     * Get all tiles
     */
    public getAllTiles(): Entity[] {
        return Array.from(this.tiles.values());
    }

    /**
     * Convert hex coordinates to a string key
     */
    private coordinateToKey(coordinate: HexCoordinate): string {
        return `${coordinate.q},${coordinate.r}`;
    }

    /**
     * Convert hex coordinates to world position
     */
    public hexToWorldPosition(coordinate: HexCoordinate, tileSize: number = 1): THREE.Vector3 {
        const x = tileSize * (3/2 * coordinate.q);
        const z = tileSize * (Math.sqrt(3)/2 * coordinate.q + Math.sqrt(3) * coordinate.r);
        return new THREE.Vector3(x, 0, z);
    }

    /**
     * Convert world position to hex coordinates
     */
    public worldToHexPosition(worldPos: THREE.Vector3, tileSize: number = 1): HexCoordinate {
        const q = (2/3 * worldPos.x) / tileSize;
        const r = (-1/3 * worldPos.x + Math.sqrt(3)/3 * worldPos.z) / tileSize;
        return this.hexRound({ q, r });
    }

    /**
     * Get tiles near a world position within a specified radius
     * @param position - World position to search around
     * @param radius - Search radius in world units
     * @param tileSize - Size of tiles (default 1)
     * @returns Array of tiles within the radius
     */
    public getTilesNearPosition(position: THREE.Vector3, radius: number, tileSize: number = 1): Entity[] {
        const tiles: Entity[] = [];
        
        // Convert world position to hex coordinates
        const centerHex = this.worldToHexPosition(position, tileSize);
        
        // Calculate hex radius based on world radius
        const hexRadius = Math.ceil(radius / tileSize);
        
        // Search in hex grid around the center
        for (let q = -hexRadius; q <= hexRadius; q++) {
            for (let r = Math.max(-hexRadius, -q - hexRadius); r <= Math.min(hexRadius, -q + hexRadius); r++) {
                const hexCoord = { q: centerHex.q + q, r: centerHex.r + r };
                const tile = this.getTile(hexCoord);
                
                if (tile) {
                    // Check actual world distance to filter out tiles outside radius
                    const tileWorldPos = this.hexToWorldPosition(hexCoord, tileSize);
                    const distance = position.distanceTo(tileWorldPos);
                    
                    if (distance <= radius) {
                        tiles.push(tile);
                    }
                }
            }
        }
        
        return tiles;
    }

    /**
     * Get the tile at a specific world position
     * @param position - World position to check
     * @param tileSize - Size of tiles (default 1)
     * @returns The tile at the position, or null if none exists
     */
    public getTileAtPosition(position: THREE.Vector3, tileSize: number = 1): Entity | null {
        const hexCoord = this.worldToHexPosition(position, tileSize);
        return this.getTile(hexCoord);
    }

    /**
     * Get all entities that are positioned on a specific tile
     * @param tile - The tile to check
     * @param entities - All entities to search through
     * @param tileSize - Size of tiles (default 1)
     * @param tolerance - Position tolerance for "on tile" detection (default 0.1)
     * @returns Array of entities positioned on the tile
     */
    public getEntitiesOnTile(tile: Entity, entities: readonly Entity[], tileSize: number = 1, tolerance: number = 0.1): Entity[] {
        const entitiesOnTile: Entity[] = [];
        
        // Get tile's world position
        const tileHexCoord = this.getTileHexCoordinate(tile);
        if (!tileHexCoord) return entitiesOnTile;
        
        const tileWorldPos = this.hexToWorldPosition(tileHexCoord, tileSize);
        
        // Check each entity's position
        entities.forEach(entity => {
            // Skip tiles themselves
            if (entity.hasComponent(TileComponent)) return;
            
            // Get entity position (assuming it has PositionComponent)
            const positionComponent = entity.getComponent(PositionComponent);
            if (!positionComponent) return;
            
            const entityPos = positionComponent.toVector3();
            const distance = tileWorldPos.distanceTo(entityPos);
            
            if (distance <= tolerance) {
                entitiesOnTile.push(entity);
            }
        });
        
        return entitiesOnTile;
    }

    /**
     * Get the hex coordinate of a tile entity
     * @param tile - The tile entity
     * @returns The hex coordinate, or null if not found
     */
    private getTileHexCoordinate(tile: Entity): HexCoordinate | null {
        // Search through all tiles to find the one matching the entity
        for (const [key, tileEntity] of this.tiles) {
            if (tileEntity === tile) {
                const parts = key.split(',');
                const qStr = parts[0];
                const rStr = parts[1];
                if (qStr !== undefined && rStr !== undefined) {
                    const q = parseInt(qStr, 10);
                    const r = parseInt(rStr, 10);
                    if (!isNaN(q) && !isNaN(r)) {
                        return { q, r };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Round fractional hex coordinates to nearest hex
     */
    private hexRound(hex: HexCoordinate): HexCoordinate {
        const q = Math.round(hex.q);
        const r = Math.round(hex.r);
        const s = Math.round(-hex.q - hex.r);
        
        const qDiff = Math.abs(q - hex.q);
        const rDiff = Math.abs(r - hex.r);
        const sDiff = Math.abs(s - (-hex.q - hex.r));
        
        if (qDiff > rDiff && qDiff > sDiff) {
            return { q: -r - s, r };
        } else if (rDiff > sDiff) {
            return { q, r: -q - s };
        } else {
            return { q, r };
        }
    }
}
