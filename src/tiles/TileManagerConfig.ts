import * as THREE from 'three';

export interface TileManagerConfig {
    tileSize: number;
    maxRadius: number;
    centerPosition: THREE.Vector3;
}
