import * as THREE from 'three';
import { IComponent } from '../../ecs/IComponent';

export interface TileMaterial {
    color: number;
    roughness: number;
    metalness: number;
}

export class TileVisualComponent implements IComponent {
    private tileMesh: THREE.Mesh;
    private material: THREE.MeshStandardMaterial;
    private baseHeight: number;
    private currentHeight: number;
    private targetHeight: number;

    constructor(tileSize: number, materialConfig: TileMaterial) {
        this.baseHeight = 0.1;
        this.currentHeight = this.baseHeight;
        this.targetHeight = this.baseHeight;

        // Create hexagon geometry
        const geometry = this.createHexagonGeometry(tileSize);
        
        // Create material that responds to directional lighting
        this.material = new THREE.MeshStandardMaterial({
            color: materialConfig.color,
            roughness: materialConfig.roughness,
            metalness: materialConfig.metalness
        });
        

        // Create mesh
        this.tileMesh = new THREE.Mesh(geometry, this.material);
        this.tileMesh.castShadow = true;
        this.tileMesh.receiveShadow = true;
        this.tileMesh.position.y = this.currentHeight;
    }

    /**
     * Create solid hexagon geometry using Three.js ExtrudeGeometry
     */
    private createHexagonGeometry(size: number): THREE.BufferGeometry {
        const tileHeight = 0.2; // Height of the 3D hexagon
        
        // Create hexagonal shape
        const hexagonShape = new THREE.Shape();
        
        // Create hexagon vertices
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = size * Math.cos(angle);
            const y = size * Math.sin(angle);
            if (i === 0) {
                hexagonShape.moveTo(x, y);
            } else {
                hexagonShape.lineTo(x, y);
            }
        }
        hexagonShape.closePath();

        // Extrude settings for solid hexagon with chamfered corners
        const extrudeSettings = {
            depth: tileHeight,
            bevelEnabled: true,
            bevelThickness: 0.05, // Thickness of the bevel
            bevelSize: 0.05, // Size of the bevel
            bevelOffset: 0, // Offset from the edge
            bevelSegments: 1, // Number of segments for smooth bevel
        };

        // Create solid hexagonal prism
        const geometry = new THREE.ExtrudeGeometry(hexagonShape, extrudeSettings);
        
        // Rotate to match the original orientation (hexagon flat on XZ plane)
        geometry.rotateX(-Math.PI / 2);
        
        return geometry;
    }

    /**
     * Update tile height
     */
    public setTargetHeight(height: number): void {
        this.targetHeight = Math.max(0, height);
    }

    /**
     * Animate height change
     */
    public updateHeight(deltaTime: number, animationSpeed: number = 2.0): void {
        const heightDiff = this.targetHeight - this.currentHeight;
        if (Math.abs(heightDiff) > 0.001) {
            this.currentHeight += heightDiff * animationSpeed * deltaTime;
            this.tileMesh.position.y = this.currentHeight;
        }
    }

    /**
     * Update tile color
     */
    public setColor(color: number): void {
        this.material.color.setHex(color);
    }

    /**
     * Update tile material properties
     */
    public setMaterial(roughness?: number, metalness?: number): void {
        if (roughness !== undefined) {
            this.material.roughness = roughness;
        }
        if (metalness !== undefined) {
            this.material.metalness = metalness;
        }
    }

    /**
     * Set tile emissive color for effects
     */
    public setEmissive(color: number, intensity: number): void {
        this.material.emissive.setHex(color);
        this.material.emissiveIntensity = intensity;
    }

    /**
     * Get the tile mesh
     */
    public getTileMesh(): THREE.Mesh {
        return this.tileMesh;
    }

    /**
     * Get current height
     */
    public getCurrentHeight(): number {
        return this.currentHeight;
    }

    /**
     * Get target height
     */
    public getTargetHeight(): number {
        return this.targetHeight;
    }

    /**
     * Check if height animation is complete
     */
    public isHeightAnimationComplete(): boolean {
        return Math.abs(this.targetHeight - this.currentHeight) < 0.001;
    }


}
