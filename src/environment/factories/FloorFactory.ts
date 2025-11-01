import * as THREE from 'three';
import { FloorConfig } from '../configs/FloorConfig';
import { FloorPatternGenerator } from '../utils/FloorPatternGenerator';

export class FloorFactory {
    static createFloor(config: FloorConfig): THREE.Group {
        const floorGroup = new THREE.Group();

        const geometry = new THREE.CircleGeometry(config.size / 2, 32);
        const material = new THREE.MeshStandardMaterial({
            color: config.material.color,
            transparent: config.material.transparent,
            opacity: config.material.opacity,
            wireframe: config.material.wireframe,
            roughness: config.material.roughness,
            metalness: config.material.metalness
        });

        // Generate and apply pattern texture if configured
        if (config.pattern) {
            const patternTexture = FloorPatternGenerator.generatePatternTexture(
                config.pattern,
                config.material.color
            );
            if (patternTexture) {
                // Scale texture to repeat across floor
                const repeatCount = config.size / 20; // Adjust to control pattern density
                patternTexture.repeat.set(repeatCount, repeatCount);
                material.map = patternTexture;
            }
        }

        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = config.shadow.receiveShadow;
        floor.castShadow = config.shadow.castShadow;

        floorGroup.add(floor);
        return floorGroup;
    }
}
