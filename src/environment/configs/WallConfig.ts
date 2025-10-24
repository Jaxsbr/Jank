import * as THREE from 'three';

export interface WallConfig {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    size: {
        width: number;
        height: number;
        depth: number;
    };
    material: {
        color: number;
        roughness: number;
        metalness: number;
    };
    shadow: {
        receiveShadow: boolean;
        castShadow: boolean;
    };
}
