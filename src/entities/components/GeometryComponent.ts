import * as THREE from 'three';
import { IComponent } from '../../ecs/IComponent';
import { MaterialConfig, defaultMaterialConfig } from '../config/MaterialConfig';

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
    private cubeMaterial?: THREE.MeshStandardMaterial; // Optional separate material for cubes
    private secondaryPositions: THREE.Vector3[];
    private materialConfig: MaterialConfig;

    constructor(
        mainSphereRadius: number = 0.5,
        mainSphereSegments: number = 32,
        secondaryConfigs: SecondaryGeometryConfig[] = [],
        materialConfig: MaterialConfig = defaultMaterialConfig
    ) {
        this.group = new THREE.Group();
        this.secondaryGeometries = [];
        this.secondaryPositions = [];
        this.materialConfig = materialConfig;

        this.createMainMaterial(materialConfig);
        this.createMainSphere(mainSphereRadius, mainSphereSegments);

        this.createSecondaryMaterial(materialConfig);
        this.createSecondaryGeometries(secondaryConfigs);
    }

    private createMainMaterial(materialConfig: MaterialConfig): void {
        this.mainMaterial = new THREE.MeshStandardMaterial({
            color: materialConfig.main.color,
            metalness: materialConfig.main.metalness,
            roughness: materialConfig.main.roughness,
            envMapIntensity: materialConfig.main.envMapIntensity
        });
        
        // Set emissive properties if provided
        if (materialConfig.main.emissive !== undefined) {
            this.mainMaterial.emissive = new THREE.Color(materialConfig.main.emissive);
            this.mainMaterial.emissiveIntensity = materialConfig.main.emissiveIntensity ?? 1.0;
        }
    }

    private createSecondaryMaterial(materialConfig: MaterialConfig): void {
        this.secondaryMaterial = new THREE.MeshStandardMaterial({
            color: materialConfig.secondary.color,
            metalness: materialConfig.secondary.metalness,
            roughness: materialConfig.secondary.roughness,
            envMapIntensity: materialConfig.secondary.envMapIntensity
        });
        
        // Set emissive properties if provided
        if (materialConfig.secondary.emissive !== undefined) {
            this.secondaryMaterial.emissive = new THREE.Color(materialConfig.secondary.emissive);
            this.secondaryMaterial.emissiveIntensity = materialConfig.secondary.emissiveIntensity ?? 1.0;
        }
        
        // Create separate cube material if cubeColor is specified
        const cubeColor = materialConfig.secondary.cubeColor;
        if (cubeColor !== undefined && cubeColor !== null) {
            this.cubeMaterial = new THREE.MeshStandardMaterial({
                color: cubeColor,
                metalness: materialConfig.secondary.metalness,
                roughness: materialConfig.secondary.roughness,
                envMapIntensity: materialConfig.secondary.envMapIntensity
            });
            
            // Set emissive properties for cube material (use same emissive settings)
            if (materialConfig.secondary.emissive !== undefined) {
                this.cubeMaterial.emissive = new THREE.Color(materialConfig.secondary.emissive);
                this.cubeMaterial.emissiveIntensity = materialConfig.secondary.emissiveIntensity ?? 1.0;
            }
        }
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
            // Use cube material if it exists and this is a cube, otherwise use secondary material
            const isCube = config.type === SecondaryGeometryType.Cube;
            const material = (isCube && this.cubeMaterial !== undefined)
                ? this.cubeMaterial
                : this.secondaryMaterial;
            const mesh = new THREE.Mesh(geometry, material);
            
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

    /**
     * Get the Three.js group for internal use (should only be used by RenderSystem and EntityCleanupSystem)
     * @internal
     */
    public getGeometryGroup(): THREE.Group {
        return this.group;
    }

    // Position manipulation methods
    public setPosition(x: number, y: number, z: number): void {
        this.group.position.set(x, y, z);
    }

    public getPosition(): THREE.Vector3 {
        return this.group.position.clone();
    }

    public setX(x: number): void {
        this.group.position.x = x;
    }

    public setY(y: number): void {
        this.group.position.y = y;
    }

    public setZ(z: number): void {
        this.group.position.z = z;
    }

    // Rotation manipulation methods
    public setRotation(x: number, y: number, z: number): void {
        this.group.rotation.set(x, y, z);
    }

    public rotate(x: number, y: number, z: number): void {
        this.group.rotation.x += x;
        this.group.rotation.y += y;
        this.group.rotation.z += z;
    }

    // Scale manipulation methods
    public setScale(scale: number): void {
        this.group.scale.setScalar(scale);
    }

    public setScaleXYZ(x: number, y: number, z: number): void {
        this.group.scale.set(x, y, z);
    }

    // Material access
    public getMainMaterial(): THREE.MeshStandardMaterial {
        return this.mainMaterial;
    }

    public getSecondaryMaterial(): THREE.MeshStandardMaterial {
        return this.secondaryMaterial;
    }
}
