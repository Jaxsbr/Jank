import * as THREE from 'three';
import { IComponent } from '../../ecs/IComponent';

export enum SecondaryGeometryType {
    Sphere = 'sphere',
    Cube = 'cube',
    Cone = 'cone'
}

export interface SecondaryGeometryConfig {
    type: SecondaryGeometryType;
    position: THREE.Vector3;
    size: number;
    segments: number;
}

export class GeometryComponent implements IComponent {
    private group: THREE.Group;
    private mainSphere!: THREE.Mesh;
    private secondaryGeometries: THREE.Mesh[];
    private mainMaterial!: THREE.MeshStandardMaterial;
    private secondaryMaterial!: THREE.MeshStandardMaterial;
    private secondaryPositions: THREE.Vector3[];

    constructor(
        mainSphereRadius: number = 0.5,
        mainSphereSegments: number = 32,
        secondaryConfigs: SecondaryGeometryConfig[] = []
    ) {
        this.group = new THREE.Group();
        this.secondaryGeometries = [];
        this.secondaryPositions = [];

        this.createMainMaterial();
        this.createMainSphere(mainSphereRadius, mainSphereSegments);

        this.createSecondaryMaterial();
        this.createSecondaryGeometries(secondaryConfigs);
    }

    private createMainMaterial(): void {
        this.mainMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            metalness: 0.3,
            roughness: 0.5,
            envMapIntensity: 0.0
        });
    }

    private createSecondaryMaterial(): void {
        this.secondaryMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            metalness: 0.6,
            roughness: 0.3,
            envMapIntensity: 0.0
        });
    }
        
    private createMainSphere(radius: number, segments: number): void {
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        this.mainSphere = new THREE.Mesh(geometry, this.mainMaterial);
        this.mainSphere.castShadow = true;
        this.mainSphere.receiveShadow = true;
        this.group.add(this.mainSphere);
    }

    private createSecondaryGeometries(configs: SecondaryGeometryConfig[]): void {
        configs.forEach(config => {
            const geometry = this.createGeometry(config);
            const mesh = new THREE.Mesh(geometry, this.secondaryMaterial);
            
            mesh.position.copy(config.position);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            this.secondaryGeometries.push(mesh);
            this.secondaryPositions.push(config.position.clone());
            this.group.add(mesh);
        });
    }

    private createGeometry(config: SecondaryGeometryConfig): THREE.BufferGeometry {
        // TODO: Improve size and segment clarity
        // Since we use these for different aspects based on the geometry, knowing
        // what segment and size means is unclear.
        // e.g. for sphere, size = radius and segment = width and height.
        // This differs for cube and cone 
        const size = config.size;
        const segments = config.segments;

        switch (config.type) {
            case SecondaryGeometryType.Sphere:
                return new THREE.SphereGeometry(size, segments, segments);
            case SecondaryGeometryType.Cube:
                return new THREE.BoxGeometry(size * 2, size * 2, size * 2);
            case SecondaryGeometryType.Cone:
                return new THREE.ConeGeometry(size, size * 2, segments);
            default:
                return new THREE.SphereGeometry(size, segments, segments);
        }
    }

    // Main sphere material methods
    public updateMainSphereColor(color: number): void {
        this.mainMaterial.color.setHex(color);
    }

    public updateMainSphereMetalness(metalness: number): void {
        this.mainMaterial.metalness = metalness;
    }

    public updateMainSphereRoughness(roughness: number): void {
        this.mainMaterial.roughness = roughness;
    }

    public updateMainSphereEmissive(color: number, intensity: number): void {
        this.mainMaterial.emissive.setHex(color);
        this.mainMaterial.emissiveIntensity = intensity;
    }

    public updateMainSphereEnvMapIntensity(intensity: number): void {
        this.mainMaterial.envMapIntensity = intensity;
    }

    // Secondary geometries material methods (affects all secondary geometries)
    public updateSecondaryColor(color: number): void {
        this.secondaryMaterial.color.setHex(color);
    }

    public updateSecondaryMetalness(metalness: number): void {
        this.secondaryMaterial.metalness = metalness;
    }

    public updateSecondaryRoughness(roughness: number): void {
        this.secondaryMaterial.roughness = roughness;
    }

    public updateSecondaryEmissive(color: number, intensity: number): void {
        this.secondaryMaterial.emissive.setHex(color);
        this.secondaryMaterial.emissiveIntensity = intensity;
    }

    public updateSecondaryEnvMapIntensity(intensity: number): void {
        this.secondaryMaterial.envMapIntensity = intensity;
    }

    // Utility methods
    public getSecondaryGeometryCount(): number {
        return this.secondaryGeometries.length;
    }

    public getMainSphere(): THREE.Mesh {
        return this.mainSphere;
    }

    public getAllSecondaryGeometries(): THREE.Mesh[] {
        return [...this.secondaryGeometries];
    }

    public getGeometryGroup(): THREE.Group {
        return this.group;
    }

    // Material access
    public getMainMaterial(): THREE.MeshStandardMaterial {
        return this.mainMaterial;
    }

    public getSecondaryMaterial(): THREE.MeshStandardMaterial {
        return this.secondaryMaterial;
    }
}
