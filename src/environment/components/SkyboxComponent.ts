import * as THREE from 'three';
import { SkyboxConfig } from '../configs/EnvironmentConfig';

export class SkyboxComponent {
    private skyboxGroup: THREE.Group;
    private config: SkyboxConfig;

    constructor(config: SkyboxConfig) {
        this.config = config;
        this.skyboxGroup = new THREE.Group();
    }

    public getSkyboxGroup(): THREE.Group {
        return this.skyboxGroup;
    }

    public updateColor(color: number): void {
        if (this.config.type === 'color') {
            this.skyboxGroup.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
                    child.material.color.setHex(color);
                }
            });
        }
    }

    public updateGradient(topColor: number, bottomColor: number): void {
        if (this.config.type === 'gradient') {
            this.skyboxGroup.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                    child.material.uniforms.topColor.value.setHex(topColor);
                    child.material.uniforms.bottomColor.value.setHex(bottomColor);
                }
            });
        }
    }
}
