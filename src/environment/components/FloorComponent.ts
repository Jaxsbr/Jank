import * as THREE from 'three';
import { FloorConfig } from '../configs/FloorConfig';

export class FloorComponent {
    private floorGroup: THREE.Group;
    private config: FloorConfig;

    constructor(config: FloorConfig) {
        this.config = config;
        this.floorGroup = new THREE.Group();
    }

    public getFloorGroup(): THREE.Group {
        return this.floorGroup;
    }

    public updateMaterial(color: number): void {
        this.floorGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.color.setHex(color);
            }
        });
    }

    public updateRoughness(roughness: number): void {
        this.floorGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.roughness = roughness;
            }
        });
    }

    public updateMetalness(metalness: number): void {
        this.floorGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.metalness = metalness;
            }
        });
    }
}
