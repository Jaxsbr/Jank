import * as THREE from 'three';
import { TileGrid } from '../../src/tiles/TileGrid';
import { TileManager } from '../../src/tiles/TileManager';
import { TileComponent } from '../../src/tiles/components/TileComponent';
import { TileVisualComponent } from '../../src/tiles/components/TileVisualComponent';

describe('TileGrid Expansion', () => {
    let scene: THREE.Scene;
    let tileManager: TileManager;
    let tileGrid: TileGrid;

    beforeEach(() => {
        scene = new THREE.Scene();
        tileManager = new TileManager(scene);
        tileGrid = tileManager.getTileGrid();
        tileManager.initialize(); // Creates center tile
    });

    describe('getCurrentRadius', () => {
        it('should return 0 for only center tile', () => {
            expect(tileGrid.getCurrentRadius()).toBe(0);
        });

        it('should return correct radius after adding tiles', () => {
            // Add tiles in ring 1
            tileManager.addTile({ q: 1, r: 0 });
            tileManager.addTile({ q: 0, r: 1 });
            tileManager.addTile({ q: -1, r: 1 });
            
            expect(tileGrid.getCurrentRadius()).toBe(1);
        });
    });

    describe('getRingCoordinates', () => {
        it('should return center coordinate for ring 0', () => {
            const coordinates = tileGrid.getRingCoordinates(0);
            expect(coordinates).toEqual([{ q: 0, r: 0 }]);
        });

        it('should return correct coordinates for ring 1', () => {
            const coordinates = tileGrid.getRingCoordinates(1);
            const expected = [
                { q: 1, r: 0 },
                { q: 0, r: 1 },
                { q: -1, r: 1 },
                { q: -1, r: 0 },
                { q: 0, r: -1 },
                { q: 1, r: -1 }
            ];
            
            expect(coordinates).toHaveLength(6);
            expected.forEach(coord => {
                expect(coordinates).toContainEqual(coord);
            });
        });

        it('should return correct coordinates for ring 2', () => {
            const coordinates = tileGrid.getRingCoordinates(2);
            expect(coordinates).toHaveLength(12); // Ring 2 has 12 tiles
        });
    });

    describe('isCoordinateOccupied', () => {
        it('should return true for occupied coordinates', () => {
            expect(tileGrid.isCoordinateOccupied({ q: 0, r: 0 })).toBe(true); // Center tile
        });

        it('should return false for unoccupied coordinates', () => {
            expect(tileGrid.isCoordinateOccupied({ q: 1, r: 0 })).toBe(false);
        });
    });

    describe('expandByRings', () => {
        it('should add tiles in the next ring', () => {
            const newTiles = tileManager.expandByRings(1);
            
            expect(newTiles.length).toBe(6); // Ring 1 has 6 tiles
            expect(tileGrid.getCurrentRadius()).toBe(1);
        });

        it('should add tiles in multiple rings', () => {
            const newTiles = tileManager.expandByRings(2);
            
            expect(newTiles.length).toBe(18); // Ring 1 (6) + Ring 2 (12)
            expect(tileGrid.getCurrentRadius()).toBe(2);
        });

        it('should not add tiles to already occupied coordinates', () => {
            // Manually add a tile
            tileManager.addTile({ q: 1, r: 0 });
            
            // Check current radius after manual addition
            const currentRadius = tileGrid.getCurrentRadius();
            expect(currentRadius).toBe(1);
            
            // Try to expand by 1 ring - should add ring 2 (12 tiles)
            const newTiles = tileManager.expandByRings(1);
            
            // Should have 12 new tiles (ring 2)
            expect(newTiles.length).toBe(12);
            expect(tileGrid.getCurrentRadius()).toBe(2);
        });

        it('should create tiles with correct components', () => {
            const newTiles = tileManager.expandByRings(1);
            
            newTiles.forEach(tile => {
                expect(tile.hasComponent(TileComponent)).toBe(true);
                expect(tile.hasComponent(TileVisualComponent)).toBe(true);
                
                const tileComponent = tile.getComponent(TileComponent);
                expect(tileComponent).toBeDefined();
                expect(tileComponent!.isCenterTile()).toBe(false);
            });
        });
    });

    describe('unlockNextRing', () => {
        it('should add only the next ring', () => {
            const newTiles = tileManager.unlockNextRing();
            
            expect(newTiles.length).toBe(6); // Ring 1 has 6 tiles
            expect(tileGrid.getCurrentRadius()).toBe(1);
        });

        it('should work multiple times', () => {
            const firstRing = tileManager.unlockNextRing();
            const secondRing = tileManager.unlockNextRing();
            
            expect(firstRing.length).toBe(6);
            expect(secondRing.length).toBe(12);
            expect(tileGrid.getCurrentRadius()).toBe(2);
        });
    });

    describe('getCurrentRadius', () => {
        it('should return correct radius after expansion', () => {
            expect(tileManager.getCurrentRadius()).toBe(0);
            
            tileManager.unlockNextRing();
            expect(tileManager.getCurrentRadius()).toBe(1);
            
            tileManager.unlockNextRing();
            expect(tileManager.getCurrentRadius()).toBe(2);
        });
    });
});
