import * as THREE from 'three';

/**
 * Creates colored axis lines for debugging coordinate system orientation
 * Pure function - returns objects without side effects
 * @param length - Length of each axis line (default: 500)
 * @returns Array of axis line objects
 */
export function createDebugAxes(length: number = 500): THREE.Line[] {
    // X-axis (Green) - from -length to length
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-length, 0, 0),
        new THREE.Vector3(length, 0, 0)
    ]);
    const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // Green
    const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);

    // Y-axis (Red) - from -length to length
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -length, 0),
        new THREE.Vector3(0, length, 0)
    ]);
    const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red
    const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);

    // Z-axis (Blue) - from -length to length
    const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -length),
        new THREE.Vector3(0, 0, length)
    ]);
    const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff }); // Blue
    const zAxis = new THREE.Line(zAxisGeometry, zAxisMaterial);

    return [xAxis, yAxis, zAxis];
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use createDebugAxes() and add objects to scene manually
 */
export function debugAxes(scene: THREE.Scene, length: number = 500): void {
    const axes = createDebugAxes(length);
    axes.forEach(axis => scene.add(axis));
}
