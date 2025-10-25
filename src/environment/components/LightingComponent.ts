import * as THREE from 'three';

export class LightingComponent {
    private ambientLight: THREE.AmbientLight;
    private directionalLight: THREE.DirectionalLight;

    constructor() {
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(5, 10, 5); // Position light at an angle for better shadows
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 50;
        this.directionalLight.shadow.camera.left = -10;
        this.directionalLight.shadow.camera.right = 10;
        this.directionalLight.shadow.camera.top = 10;
        this.directionalLight.shadow.camera.bottom = -10;
        this.directionalLight.shadow.bias = -0.0001; // Reduce shadow acne
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
