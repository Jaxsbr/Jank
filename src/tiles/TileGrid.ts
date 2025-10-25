import * as THREE from 'three';
import { Entity } from '../ecs/Entity';

export interface HexCoordinate {
    q: number;
    r: number;
}

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
