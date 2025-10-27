import * as THREE from 'three';
import { Entity } from '../../src/ecs/Entity';
import { PositionComponent } from '../../src/entities/components/PositionComponent';
import { HexCoordinate } from '../../src/tiles/HexCoordinate';
import { TileGrid } from '../../src/tiles/TileGrid';
import { TileComponent } from '../../src/tiles/components/TileComponent';

describe('TileGrid Spatial Queries', () => {
    let tileGrid: TileGrid;
    let scene: THREE.Scene;
    let entities: Entity[];

    beforeEach(() => {
        scene = new THREE.Scene();
        tileGrid = new TileGrid(scene);
        entities = [];

        // Create some test entities with positions
        const positions = [
            new THREE.Vector3(0, 0, 0),    // Center
            new THREE.Vector3(1, 0, 0),    // Right
            new THREE.Vector3(-1, 0, 0),   // Left
            new THREE.Vector3(0, 0, 1),    // Forward
            new THREE.Vector3(0, 0, -1),   // Back
        ];

        positions.forEach((pos, index) => {
            const entity = new Entity();
            const positionComponent = new PositionComponent(pos.x, pos.y, pos.z);
            entity.addComponent(positionComponent);
            entities.push(entity);
        });
    });

    describe('getTilesNearPosition', () => {
        beforeEach(() => {
            // Add tiles to the grid
            const tilePositions: HexCoordinate[] = [
                { q: 0, r: 0 },  // Center
                { q: 1, r: 0 }, // Right
                { q: -1, r: 0 }, // Left
                { q: 0, r: 1 },  // Forward
                { q: 0, r: -1 }, // Back
                { q: 2, r: 0 },  // Far right
            ];

            tilePositions.forEach((coord, index) => {
                const tile = new Entity();
                const tileComponent = new TileComponent(coord.q, coord.r, 'test', false);
                tile.addComponent(tileComponent);
                tileGrid.addTile(tile, coord);
            });
        });

        it('should find tiles within radius', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 2.0; // Radius needs to be large enough for hex grid
            
            const result = tileGrid.getTilesNearPosition(center, radius);
            
            // Should find tiles at center, right, left, forward, back
            expect(result).toHaveLength(5);
        });

        it('should not find tiles outside radius', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 1.0;
            
            const result = tileGrid.getTilesNearPosition(center, radius);
            
            // Should only find center tile
            expect(result).toHaveLength(1);
        });

        it('should work with custom tile size', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 2.0;
            const tileSize = 0.5; // Smaller tiles
            
            const result = tileGrid.getTilesNearPosition(center, radius, tileSize);
            
            // With smaller tiles, more tiles should be within radius
            expect(result.length).toBeGreaterThan(1);
        });
    });

    describe('getTileAtPosition', () => {
        beforeEach(() => {
            // Add a tile at center
            const tile = new Entity();
            const tileComponent = new TileComponent(0, 0, 'center', true);
            tile.addComponent(tileComponent);
            tileGrid.addTile(tile, { q: 0, r: 0 });
        });

        it('should find tile at exact position', () => {
            const position = new THREE.Vector3(0, 0, 0);
            
            const result = tileGrid.getTileAtPosition(position);
            
            expect(result).not.toBeNull();
        });

        it('should find tile near position within tolerance', () => {
            const position = new THREE.Vector3(0.1, 0, 0.1); // Slightly offset
            
            const result = tileGrid.getTileAtPosition(position);
            
            expect(result).not.toBeNull();
        });

        it('should return null when no tile at position', () => {
            const position = new THREE.Vector3(10, 0, 10);
            
            const result = tileGrid.getTileAtPosition(position);
            
            expect(result).toBeNull();
        });
    });

    describe('getEntitiesOnTile', () => {
        beforeEach(() => {
            // Add a tile at center
            const tile = new Entity();
            const tileComponent = new TileComponent(0, 0, 'center', true);
            tile.addComponent(tileComponent);
            tileGrid.addTile(tile, { q: 0, r: 0 });
        });

        it('should find entities positioned on tile', () => {
            const tile = tileGrid.getTileAtPosition(new THREE.Vector3(0, 0, 0));
            expect(tile).not.toBeNull();
            
            const result = tileGrid.getEntitiesOnTile(tile!, entities);
            
            // Should find entity at (0,0,0)
            expect(result).toHaveLength(1);
            const pos = result[0]?.getComponent(PositionComponent)?.toVector3();
            expect(pos?.x).toBeCloseTo(0);
            expect(pos?.y).toBeCloseTo(0);
            expect(pos?.z).toBeCloseTo(0);
        });

        it('should use tolerance for position matching', () => {
            const tile = tileGrid.getTileAtPosition(new THREE.Vector3(0, 0, 0));
            expect(tile).not.toBeNull();
            
            // Create entity slightly offset from tile center
            const offsetEntity = new Entity();
            const positionComponent = new PositionComponent(0.05, 0, 0.05);
            offsetEntity.addComponent(positionComponent);
            const entitiesWithOffset = [...entities, offsetEntity];
            
            const result = tileGrid.getEntitiesOnTile(tile!, entitiesWithOffset, 1, 0.1);
            
            // Should find both center entity and offset entity
            expect(result).toHaveLength(2);
        });

        it('should exclude tiles from results', () => {
            const tile = tileGrid.getTileAtPosition(new THREE.Vector3(0, 0, 0));
            expect(tile).not.toBeNull();
            
            // Add a tile entity to the entities list
            const tileEntity = new Entity();
            const tileComponent = new TileComponent(0, 0, 'test', false);
            const positionComponent = new PositionComponent(0, 0, 0);
            tileEntity.addComponent(tileComponent);
            tileEntity.addComponent(positionComponent);
            const entitiesWithTile = [...entities, tileEntity];
            
            const result = tileGrid.getEntitiesOnTile(tile!, entitiesWithTile);
            
            // Should not include the tile entity in results
            expect(result).toHaveLength(1); // Only the original entity at (0,0,0)
        });

        it('should return empty array when no entities on tile', () => {
            const tile = tileGrid.getTileAtPosition(new THREE.Vector3(0, 0, 0));
            expect(tile).not.toBeNull();
            
            // Create entities far from the tile
            const farEntities = [
                new Entity(),
            ];
            const positionComponent = new PositionComponent(10, 0, 10);
            farEntities[0]?.addComponent(positionComponent);
            
            const result = tileGrid.getEntitiesOnTile(tile!, farEntities);
            
            expect(result).toHaveLength(0);
        });
    });

    describe('hex coordinate conversion', () => {
        it('should convert world position to hex coordinates correctly', () => {
            const worldPos = new THREE.Vector3(0, 0, 0);
            const hexCoord = tileGrid.worldToHexPosition(worldPos);
            
            expect(hexCoord.q).toBeCloseTo(0);
            expect(hexCoord.r).toBeCloseTo(0);
        });

        it('should convert hex coordinates to world position correctly', () => {
            const hexCoord: HexCoordinate = { q: 0, r: 0 };
            const worldPos = tileGrid.hexToWorldPosition(hexCoord);
            
            expect(worldPos.x).toBeCloseTo(0);
            expect(worldPos.y).toBeCloseTo(0);
            expect(worldPos.z).toBeCloseTo(0);
        });

        it('should maintain consistency between hex and world conversions', () => {
            const originalHex: HexCoordinate = { q: 1, r: 1 };
            const worldPos = tileGrid.hexToWorldPosition(originalHex);
            const convertedHex = tileGrid.worldToHexPosition(worldPos);
            
            expect(convertedHex.q).toBeCloseTo(originalHex.q);
            expect(convertedHex.r).toBeCloseTo(originalHex.r);
        });
    });
});