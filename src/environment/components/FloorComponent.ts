import * as THREE from 'three';
import { FloorConfig } from '../configs/FloorConfig';
import { FloorPatternGenerator } from '../utils/FloorPatternGenerator';

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

    public updatePattern(patternConfig: FloorConfig['pattern']): void {
        if (!patternConfig) {
            // Remove pattern if config is null/undefined
            this.floorGroup.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    if (child.material.map) {
                        child.material.map.dispose();
                        child.material.map = null;
                    }
                    child.material.needsUpdate = true;
                }
            });
            return;
        }

        const patternTexture = FloorPatternGenerator.generatePatternTexture(
            patternConfig,
            this.config.material.color
        );

        if (patternTexture) {
            const repeatCount = this.config.size / 20;
            patternTexture.repeat.set(repeatCount, repeatCount);

            this.floorGroup.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    // Dispose old texture if exists
                    if (child.material.map) {
                        child.material.map.dispose();
                    }
                    child.material.map = patternTexture;
                    child.material.needsUpdate = true;
                }
            });
        }
    }
}
