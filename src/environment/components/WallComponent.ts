import * as THREE from 'three';
import { WallConfig } from '../configs/WallConfig';

export class WallComponent {
    private wallGroup: THREE.Group;
    private config: WallConfig;

    constructor(config: WallConfig) {
        this.config = config;
        this.wallGroup = new THREE.Group();
    }

    public getWallGroup(): THREE.Group {
        return this.wallGroup;
    }

    public updateMaterial(color: number): void {
        this.wallGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.color.setHex(color);
            }
        });
    }

    public updatePosition(position: THREE.Vector3): void {
        this.wallGroup.position.copy(position);
    }

    public updateRotation(rotation: THREE.Euler): void {
        this.wallGroup.rotation.copy(rotation);
    }
}
