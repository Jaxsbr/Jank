import * as THREE from 'three';

export function createCube(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0.5; // Position above the floor
    cube.castShadow = true;
    cube.receiveShadow = true;
    return cube
}

export function createSphere(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.y = 2; // Position above the floor
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    return sphere;
}


interface FloorConfig {
    size: number;
    material: {
        color: number;
        transparent: boolean;
        opacity: number;
        wireframe: boolean;
        roughness: number;
        metalness: number;
    };
    shadow: {
        receiveShadow: boolean;
        castShadow: boolean;
    };
}

export function createFloor(config: FloorConfig): THREE.Group {
    const floorGroup = new THREE.Group();

    // Create floor plane
    const floorGeometry = new THREE.PlaneGeometry(config.size, config.size);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: config.material.color,
        transparent: config.material.transparent,
        opacity: config.material.opacity,
        wireframe: config.material.wireframe,
        roughness: config.material.roughness,
        metalness: config.material.metalness
    });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    floor.receiveShadow = config.shadow.receiveShadow;
    floor.castShadow = config.shadow.castShadow;
    floorGroup.add(floor);

    return floorGroup;
}
