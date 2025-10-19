import * as THREE from 'three';

export function createAmbientLight(): THREE.AmbientLight {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    return ambientLight;
}

export function createDirectionalLight(): THREE.DirectionalLight {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    return directionalLight;
}