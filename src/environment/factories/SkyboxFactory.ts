import * as THREE from 'three';
import { SkyboxConfig } from '../configs/EnvironmentConfig';

export class SkyboxFactory {
    static createSkybox(config: SkyboxConfig): THREE.Group {
        const skyboxGroup = new THREE.Group();

        switch (config.type) {
            case 'color':
                if (config.color !== undefined) {
                    const skyboxGeometry = new THREE.SphereGeometry(config.size, config.segments, config.segments);
                    const skyboxMaterial = new THREE.MeshBasicMaterial({
                        color: config.color,
                        side: THREE.BackSide
                    });
                    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
                    skyboxGroup.add(skybox);
                }
                break;

            case 'gradient':
                if (config.gradient) {
                    const skyboxGeometry = new THREE.SphereGeometry(config.size, config.segments, config.segments);
                    const skyboxMaterial = new THREE.ShaderMaterial({
                        uniforms: {
                            topColor: { value: new THREE.Color(config.gradient.topColor) },
                            bottomColor: { value: new THREE.Color(config.gradient.bottomColor) }
                        },
                        vertexShader: `
                            varying vec3 vWorldPosition;
                            void main() {
                                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                                vWorldPosition = worldPosition.xyz;
                                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                            }
                        `,
                        fragmentShader: `
                            uniform vec3 topColor;
                            uniform vec3 bottomColor;
                            varying vec3 vWorldPosition;
                            void main() {
                                float h = normalize(vWorldPosition + vec3(0.0, 1.0, 0.0)).y;
                                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), 0.5), 0.0)), 1.0);
                            }
                        `,
                        side: THREE.BackSide
                    });
                    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
                    skyboxGroup.add(skybox);
                }
                break;

            case 'texture':
                // TODO: Implement texture-based skybox
                console.warn('Texture skybox not implemented yet');
                break;
        }

        return skyboxGroup;
    }
}
