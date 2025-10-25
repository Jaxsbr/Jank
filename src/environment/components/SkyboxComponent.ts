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
                    const uniforms = child.material.uniforms;
                    if (uniforms?.['topColor'] && uniforms['bottomColor']) {
                        const topColorUniform = uniforms['topColor'];
                        const bottomColorUniform = uniforms['bottomColor'];
                        if (topColorUniform && bottomColorUniform && 
                            topColorUniform.value && bottomColorUniform.value) {
                            // Type assertion for uniform values that should have setHex method
                            const topColorValue = topColorUniform.value as { setHex: (color: number) => void };
                            const bottomColorValue = bottomColorUniform.value as { setHex: (color: number) => void };
                            topColorValue.setHex(topColor);
                            bottomColorValue.setHex(bottomColor);
                        }
                    }
                }
            });
        }
    }
}
