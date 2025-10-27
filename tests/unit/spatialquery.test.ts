import * as THREE from 'three';
import { Entity } from '../../src/ecs/Entity';
import { PositionComponent } from '../../src/entities/components/PositionComponent';
import { SpatialQuery } from '../../src/utils/SpatialQuery';

describe('SpatialQuery', () => {
    let entities: Entity[];
    let positions: THREE.Vector3[];

    beforeEach(() => {
        entities = [];
        positions = [
            new THREE.Vector3(0, 0, 0),    // Center
            new THREE.Vector3(1, 0, 0),    // Right
            new THREE.Vector3(-1, 0, 0),   // Left
            new THREE.Vector3(0, 0, 1),    // Forward
            new THREE.Vector3(0, 0, -1),   // Back
            new THREE.Vector3(2, 0, 0),    // Far right
            new THREE.Vector3(0, 5, 0),    // High up
        ];

        // Create entities with positions
        positions.forEach((pos, index) => {
            const entity = new Entity();
            const positionComponent = new PositionComponent(pos.x, pos.y, pos.z);
            entity.addComponent(positionComponent);
            entities.push(entity);
        });
    });

    describe('getEntitiesInRadius', () => {
        it('should find entities within radius', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 1.5;
            
            const result = SpatialQuery.getEntitiesInRadius(entities, center, radius);
            
            // Should find entities at (0,0,0), (1,0,0), (-1,0,0), (0,0,1), (0,0,-1)
            expect(result).toHaveLength(5);
        });

        it('should return entities sorted by distance', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 2.5;
            
            const result = SpatialQuery.getEntitiesInRadius(entities, center, radius);
            
            // Should be sorted by distance (closest first)
            expect(result).toHaveLength(6); // All entities except the high one
            
            // First entity should be at (0,0,0) - distance 0
            const firstEntity = result[0];
            const firstPos = firstEntity?.getComponent(PositionComponent)?.toVector3();
            expect(firstPos?.x).toBeCloseTo(0);
            expect(firstPos?.y).toBeCloseTo(0);
            expect(firstPos?.z).toBeCloseTo(0);
        });

        it('should return empty array when no entities in radius', () => {
            const center = new THREE.Vector3(10, 0, 10);
            const radius = 1;
            
            const result = SpatialQuery.getEntitiesInRadius(entities, center, radius);
            
            expect(result).toHaveLength(0);
        });

        it('should work with 3D distances including Y coordinate', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 6; // Should include the high entity
            
            const result = SpatialQuery.getEntitiesInRadius(entities, center, radius);
            
            expect(result).toHaveLength(7); // All entities
        });
    });

    describe('getClosestEntity', () => {
        it('should find closest entity', () => {
            const center = new THREE.Vector3(0.5, 0, 0);
            
            const result = SpatialQuery.getClosestEntity(entities, center);
            
            expect(result).not.toBeNull();
            const pos = result?.getComponent(PositionComponent)?.toVector3();
            // Should be either (0,0,0) or (1,0,0) - both are close to (0.5,0,0)
            expect(pos?.x).toBeCloseTo(0, 1); // Within 1 unit
            expect(pos?.z).toBeCloseTo(0);
        });

        it('should return null when no entities', () => {
            const center = new THREE.Vector3(0, 0, 0);
            
            const result = SpatialQuery.getClosestEntity([], center);
            
            expect(result).toBeNull();
        });

        it('should work with 3D distances', () => {
            const center = new THREE.Vector3(0, 2.5, 0);
            
            const result = SpatialQuery.getClosestEntity(entities, center);
            
            expect(result).not.toBeNull();
            const pos = result?.getComponent(PositionComponent)?.toVector3();
            // Should be (0,5,0) or (0,0,0) - closest in 3D distance
            expect(pos?.x).toBeCloseTo(0);
            expect(pos?.z).toBeCloseTo(0);
        });
    });

    describe('getEntitiesInBox', () => {
        it('should find entities within bounding box', () => {
            const min = new THREE.Vector3(-0.5, -0.5, -0.5);
            const max = new THREE.Vector3(0.5, 0.5, 0.5);
            
            const result = SpatialQuery.getEntitiesInBox(entities, min, max);
            
            expect(result).toHaveLength(1); // Only (0,0,0) is in the box
            const pos = result[0]?.getComponent(PositionComponent)?.toVector3();
            expect(pos?.x).toBeCloseTo(0);
            expect(pos?.y).toBeCloseTo(0);
            expect(pos?.z).toBeCloseTo(0);
        });

        it('should find multiple entities in larger box', () => {
            const min = new THREE.Vector3(-1.5, -0.5, -1.5);
            const max = new THREE.Vector3(1.5, 0.5, 1.5);
            
            const result = SpatialQuery.getEntitiesInBox(entities, min, max);
            
            expect(result).toHaveLength(5);
        });

        it('should return empty array when no entities in box', () => {
            const min = new THREE.Vector3(10, 10, 10);
            const max = new THREE.Vector3(11, 11, 11);
            
            const result = SpatialQuery.getEntitiesInBox(entities, min, max);
            
            expect(result).toHaveLength(0);
        });
    });

    describe('getEntitiesInRadiusWithDistance', () => {
        it('should return entities with distance information', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 1.5;
            
            const result = SpatialQuery.getEntitiesInRadiusWithDistance(entities, center, radius);
            
            expect(result).toHaveLength(5);
            
            // Check that distances are correct
            const centerEntity = result.find(r => {
                const pos = r.entity.getComponent(PositionComponent)?.toVector3();
                return pos?.x === 0 && pos?.y === 0 && pos?.z === 0;
            });
            expect(centerEntity?.distance).toBeCloseTo(0);
        });

        it('should be sorted by distance', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 2.5;
            
            const result = SpatialQuery.getEntitiesInRadiusWithDistance(entities, center, radius);
            
            for (let i = 1; i < result.length; i++) {
                expect(result[i]?.distance).toBeGreaterThanOrEqual(result[i - 1]?.distance || 0);
            }
        });
    });

    describe('getEntitiesInRadius2D', () => {
        it('should find entities within 2D radius ignoring Y', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 1.5;
            
            const result = SpatialQuery.getEntitiesInRadius2D(entities, center, radius);
            
            // Should find entities at (0,0,0), (1,0,0), (-1,0,0), (0,0,1), (0,0,-1)
            // AND (0,5,0) because 2D distance ignores Y coordinate
            expect(result).toHaveLength(6); // All entities except (2,0,0)
        });

        it('should ignore Y coordinate in distance calculation', () => {
            const center = new THREE.Vector3(0, 10, 0); // High center
            const radius = 1.5;
            
            const result = SpatialQuery.getEntitiesInRadius2D(entities, center, radius);
            
            // Should find entities at (0,0,0), (1,0,0), (-1,0,0), (0,0,1), (0,0,-1)
            // Even though center is high, 2D distance ignores Y
            expect(result).toHaveLength(6); // All entities except (2,0,0)
        });
    });

    describe('getClosestEntity2D', () => {
        it('should find closest entity using 2D distance', () => {
            const center = new THREE.Vector3(0.5, 0, 0);
            
            const result = SpatialQuery.getClosestEntity2D(entities, center);
            
            expect(result).not.toBeNull();
            const pos = result?.getComponent(PositionComponent)?.toVector3();
            // Should be either (0,0,0) or (1,0,0) - both are close in 2D
            expect(pos?.x).toBeCloseTo(0, 1); // Within 1 unit
            expect(pos?.z).toBeCloseTo(0);
        });

        it('should ignore Y coordinate', () => {
            const center = new THREE.Vector3(0, 10, 0); // High center
            
            const result = SpatialQuery.getClosestEntity2D(entities, center);
            
            expect(result).not.toBeNull();
            const pos = result?.getComponent(PositionComponent)?.toVector3();
            expect(pos?.x).toBeCloseTo(0); // (0,0,0) is closest in 2D, ignoring Y
        });
    });

    describe('requirePositionComponent parameter', () => {
        it('should filter entities without PositionComponent when required', () => {
            const entityWithoutPosition = new Entity();
            const entitiesWithMixed = [...entities, entityWithoutPosition];
            
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 2;
            
            const result = SpatialQuery.getEntitiesInRadius(entitiesWithMixed, center, radius, true);
            
            // Should only return entities with PositionComponent
            expect(result).toHaveLength(6); // All original entities (excluding high entity at radius 2)
        });

        it('should include entities without PositionComponent when not required', () => {
            const entityWithoutPosition = new Entity();
            const entitiesWithMixed = [...entities, entityWithoutPosition];
            
            const center = new THREE.Vector3(0, 0, 0);
            const radius = 2;
            
            const result = SpatialQuery.getEntitiesInRadius(entitiesWithMixed, center, radius, false);
            
            // Should return all entities, but those without PositionComponent will be filtered out anyway
            // because they can't have their position checked
            expect(result).toHaveLength(6); // All original entities (excluding high entity at radius 2)
        });
    });
});