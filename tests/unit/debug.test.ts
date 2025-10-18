import * as THREE from 'three';
import { createDebugAxes, debugAxes } from '../../src/utils/debug';

describe('createDebugAxes (Pure Function)', () => {
    it('should return three axis line objects', () => {
        const axes = createDebugAxes();

        expect(axes).toHaveLength(3);
        expect(axes.every(axis => axis instanceof THREE.Line)).toBe(true);
    });

    it('should create X-axis line with correct geometry and material', () => {
        const axes = createDebugAxes();

        const xAxis = axes.find(axis =>
            axis instanceof THREE.Line &&
            axis.material instanceof THREE.LineBasicMaterial &&
            ((axis.material as THREE.LineBasicMaterial).color.getHex() === 0x00ff00)
        );

        expect(xAxis).toBeDefined();
        expect(xAxis).toBeInstanceOf(THREE.Line);
    });

    it('should create Y-axis line with correct geometry and material', () => {
        const axes = createDebugAxes();

        const yAxis = axes.find(axis =>
            axis instanceof THREE.Line &&
            axis.material instanceof THREE.LineBasicMaterial &&
            ((axis.material as THREE.LineBasicMaterial).color.getHex() === 0xff0000)
        );

        expect(yAxis).toBeDefined();
        expect(yAxis).toBeInstanceOf(THREE.Line);
    });

    it('should create Z-axis line with correct geometry and material', () => {
        const axes = createDebugAxes();

        const zAxis = axes.find(axis =>
            axis instanceof THREE.Line &&
            axis.material instanceof THREE.LineBasicMaterial &&
            ((axis.material as THREE.LineBasicMaterial).color.getHex() === 0x0000ff)
        );

        expect(zAxis).toBeDefined();
        expect(zAxis).toBeInstanceOf(THREE.Line);
    });

    it('should use default length of 500 when no length parameter provided', () => {
        const axes = createDebugAxes();

        expect(axes).toHaveLength(3);

        // Check that all axes have the correct geometry points
        axes.forEach(axis => {
            const geometry = axis.geometry as THREE.BufferGeometry;
            const positions = geometry.attributes.position.array;

            // Each line should have 2 points (start and end)
            expect(positions.length).toBe(6); // 2 points * 3 coordinates (x, y, z)
        });
    });

    it('should use custom length when provided', () => {
        const customLength = 1000;
        const axes = createDebugAxes(customLength);

        expect(axes).toHaveLength(3);

        // Verify the geometry extends to the custom length
        axes.forEach(axis => {
            const geometry = axis.geometry as THREE.BufferGeometry;
            const positions = geometry.attributes.position.array;

            // Check that the line extends from -customLength to +customLength
            const startX = positions[0];
            const endX = positions[3];
            const startY = positions[1];
            const endY = positions[4];
            const startZ = positions[2];
            const endZ = positions[5];

            // At least one axis should extend to the custom length
            const maxDistance = Math.max(
                Math.abs(endX - startX),
                Math.abs(endY - startY),
                Math.abs(endZ - startZ)
            );

            expect(maxDistance).toBe(customLength * 2); // Total length should be 2 * customLength
        });
    });

    it('should create lines with correct colors', () => {
        const axes = createDebugAxes();
        const colors = axes.map(axis => (axis.material as THREE.LineBasicMaterial).color.getHex());

        expect(colors).toContain(0x00ff00); // Green (X-axis)
        expect(colors).toContain(0xff0000); // Red (Y-axis)
        expect(colors).toContain(0x0000ff); // Blue (Z-axis)
    });

    it('should be a pure function with no side effects', () => {
        const scene = new THREE.Scene();
        const initialChildrenCount = scene.children.length;

        const axes = createDebugAxes();

        // Scene should be unchanged
        expect(scene.children.length).toBe(initialChildrenCount);

        // Should return objects without modifying anything
        expect(axes).toHaveLength(3);
        expect(axes.every(axis => axis instanceof THREE.Line)).toBe(true);
    });
});

describe('debugAxes (Legacy Mutation Function)', () => {
    let scene: THREE.Scene;

    beforeEach(() => {
        scene = new THREE.Scene();
    });

    it('should add three axis lines to the scene', () => {
        const initialChildrenCount = scene.children.length;

        debugAxes(scene);

        expect(scene.children.length).toBe(initialChildrenCount + 3);
    });

    it('should create X-axis line with correct geometry and material', () => {
        debugAxes(scene);

        const xAxis = scene.children.find(child =>
            child instanceof THREE.Line &&
            (child as THREE.Line).material instanceof THREE.LineBasicMaterial &&
            ((child as THREE.Line).material as THREE.LineBasicMaterial).color.getHex() === 0x00ff00
        );

        expect(xAxis).toBeDefined();
        expect(xAxis).toBeInstanceOf(THREE.Line);
    });

    it('should create Y-axis line with correct geometry and material', () => {
        debugAxes(scene);

        const yAxis = scene.children.find(child =>
            child instanceof THREE.Line &&
            (child as THREE.Line).material instanceof THREE.LineBasicMaterial &&
            ((child as THREE.Line).material as THREE.LineBasicMaterial).color.getHex() === 0xff0000
        );

        expect(yAxis).toBeDefined();
        expect(yAxis).toBeInstanceOf(THREE.Line);
    });

    it('should create Z-axis line with correct geometry and material', () => {
        debugAxes(scene);

        const zAxis = scene.children.find(child =>
            child instanceof THREE.Line &&
            (child as THREE.Line).material instanceof THREE.LineBasicMaterial &&
            ((child as THREE.Line).material as THREE.LineBasicMaterial).color.getHex() === 0x0000ff
        );

        expect(zAxis).toBeDefined();
        expect(zAxis).toBeInstanceOf(THREE.Line);
    });

    it('should use default length of 500 when no length parameter provided', () => {
        debugAxes(scene);

        const axes = scene.children.filter(child => child instanceof THREE.Line);
        expect(axes).toHaveLength(3);

        // Check that all axes have the correct geometry points
        axes.forEach(axis => {
            const line = axis as THREE.Line;
            const geometry = line.geometry as THREE.BufferGeometry;
            const positions = geometry.attributes.position.array;

            // Each line should have 2 points (start and end)
            expect(positions.length).toBe(6); // 2 points * 3 coordinates (x, y, z)
        });
    });

    it('should use custom length when provided', () => {
        const customLength = 1000;
        debugAxes(scene, customLength);

        const axes = scene.children.filter(child => child instanceof THREE.Line);
        expect(axes).toHaveLength(3);

        // Verify the geometry extends to the custom length
        axes.forEach(axis => {
            const line = axis as THREE.Line;
            const geometry = line.geometry as THREE.BufferGeometry;
            const positions = geometry.attributes.position.array;

            // Check that the line extends from -customLength to +customLength
            const startX = positions[0];
            const endX = positions[3];
            const startY = positions[1];
            const endY = positions[4];
            const startZ = positions[2];
            const endZ = positions[5];

            // At least one axis should extend to the custom length
            const maxDistance = Math.max(
                Math.abs(endX - startX),
                Math.abs(endY - startY),
                Math.abs(endZ - startZ)
            );

            expect(maxDistance).toBe(customLength * 2); // Total length should be 2 * customLength
        });
    });

    it('should create lines with correct colors', () => {
        debugAxes(scene);

        const axes = scene.children.filter(child => child instanceof THREE.Line) as THREE.Line[];
        const colors = axes.map(axis => (axis.material as THREE.LineBasicMaterial).color.getHex());

        expect(colors).toContain(0x00ff00); // Green (X-axis)
        expect(colors).toContain(0xff0000); // Red (Y-axis)
        expect(colors).toContain(0x0000ff); // Blue (Z-axis)
    });

    it('should not affect existing scene children', () => {
        // Add some existing objects to the scene
        const existingCube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        scene.add(existingCube);

        const initialChildrenCount = scene.children.length;

        debugAxes(scene);

        // Should have added 3 axis lines
        expect(scene.children.length).toBe(initialChildrenCount + 3);

        // Original cube should still be there
        expect(scene.children).toContain(existingCube);
    });

    it('should handle multiple calls without issues', () => {
        debugAxes(scene);
        const firstCallCount = scene.children.length;

        debugAxes(scene);

        // Should add 3 more lines (total 6)
        expect(scene.children.length).toBe(firstCallCount + 3);
    });
});
