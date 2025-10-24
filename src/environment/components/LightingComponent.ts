import * as THREE from 'three';

export class LightingComponent {
    private ambientLight: THREE.AmbientLight;
    private directionalLight: THREE.DirectionalLight;

    constructor() {
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(0, 10, 0);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
    }

    public getAmbientLight(): THREE.AmbientLight {
        return this.ambientLight;
    }

    public getDirectionalLight(): THREE.DirectionalLight {
        return this.directionalLight;
    }

    public updateAmbientIntensity(intensity: number): void {
        this.ambientLight.intensity = intensity;
    }

    public updateDirectionalIntensity(intensity: number): void {
        this.directionalLight.intensity = intensity;
    }

    public updateDirectionalColor(color: number): void {
        this.directionalLight.color.setHex(color);
    }

    public updateDirectionalPosition(position: THREE.Vector3): void {
        this.directionalLight.position.copy(position);
    }
}
