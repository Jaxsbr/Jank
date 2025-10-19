import * as THREE from 'three';

export enum CoreState {
    Idle = 'idle',
    MeleeHit = 'meleeHit',
    RangedHit = 'rangedHit',
    MeleeAttack = 'meleeAttack',
    RangedAttack = 'rangedAttack'
}

export class Core {
    private group: THREE.Group;
    private mainSphere!: THREE.Mesh;
    private protrudingSpheres: THREE.Mesh[];
    private state: CoreState;
    private animationTime: number;
    
    // Animation properties
    private baseScale: number;
    private baseY: number;
    private scaleAmplitude: number;
    private bobAmplitude: number;
    private animationSpeed: number;

    constructor() {
        this.group = new THREE.Group();
        this.protrudingSpheres = [];
        this.state = CoreState.Idle;
        this.animationTime = 0;
        
        // Animation parameters
        this.baseScale = 1.0;
        this.baseY = 2.0;
        this.scaleAmplitude = 0.2;
        this.bobAmplitude = 0.5;
        this.animationSpeed = 0.02;
        
        this.createMainSphere();
        this.createProtrudingSpheres();
    }

    private createMainSphere(): void {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF, // White
            metalness: 0.3,
            roughness: 0.5,
            envMapIntensity: 0.0
        });
        
        this.mainSphere = new THREE.Mesh(geometry, material);
        this.mainSphere.castShadow = true;
        this.mainSphere.receiveShadow = true;
        this.group.add(this.mainSphere);
    }

    private createProtrudingSpheres(): void {
        // Create 14 smaller spheres embedded in the main sphere (8 + 6 additional)
        // 1/2 of each sphere should protrude from the main sphere
        const mainSphereRadius = 0.5; // extrusion from sphere origin
        const protrusionRadius = 0.15; // protrusion size
        const embedDepth = protrusionRadius * 0.5; // 1/2 embedded, 1/2 protruding
        
        // Using vertices of a cube for even distribution, positioned on sphere surface
        const positions = [
            // Original 8 cube vertices
            { x: 0.4, y: 0.4, z: 0.4 },     // +X +Y +Z
            { x: -0.4, y: 0.4, z: 0.4 },    // -X +Y +Z
            { x: 0.4, y: -0.4, z: 0.4 },    // +X -Y +Z
            { x: -0.4, y: -0.4, z: 0.4 },   // -X -Y +Z
            { x: 0.4, y: 0.4, z: -0.4 },    // +X +Y -Z
            { x: -0.4, y: 0.4, z: -0.4 },   // -X +Y -Z
            { x: 0.4, y: -0.4, z: -0.4 },   // +X -Y -Z
            { x: -0.4, y: -0.4, z: -0.4 },   // -X -Y -Z
            
            // Additional 6 knobs for symmetric distribution
            { x: 0.0, y: 0.4, z: 0.0 },     // Top center
            { x: 0.0, y: -0.4, z: 0.0 },    // Bottom center
            { x: 0.4, y: 0.0, z: 0.0 },     // Right center
            { x: -0.4, y: 0.0, z: 0.0 },    // Left center
            { x: 0.0, y: 0.0, z: 0.4 },     // Front center
            { x: 0.0, y: 0.0, z: -0.4 }     // Back center
        ];

        positions.forEach(pos => {
            // Normalize the position to be on the sphere surface
            const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
            const normalizedX = pos.x / length;
            const normalizedY = pos.y / length;
            const normalizedZ = pos.z / length;
            
            // Position the sphere so it's embedded (1/2 inside, 1/2 outside)
            const embedPosition = mainSphereRadius - embedDepth;
            const finalX = normalizedX * embedPosition;
            const finalY = normalizedY * embedPosition;
            const finalZ = normalizedZ * embedPosition;
            
            const geometry = new THREE.SphereGeometry(protrusionRadius, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color: 0xFFFFFF, // White
                metalness: 0.6,
                roughness: 0.3
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(finalX, finalY, finalZ);
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            
            this.protrudingSpheres.push(sphere);
            this.group.add(sphere);
        });
    }

    public update(): void {
        this.animationTime += this.animationSpeed;
        
        switch (this.state) {
            case CoreState.Idle:
                this.updateIdleAnimation();
                break;
            case CoreState.MeleeHit:
                this.updateMeleeHitAnimation();
                break;
            case CoreState.RangedHit:
                this.updateRangedHitAnimation();
                break;
            case CoreState.MeleeAttack:
                this.updateMeleeAttackAnimation();
                break;
            case CoreState.RangedAttack:
                this.updateRangedAttackAnimation();
                break;
        }
    }

    private updateIdleAnimation(): void {
        // Bob up and down animation (Y-axis only)
        const bobOffset = Math.sin(this.animationTime * 1.5) * this.bobAmplitude;
        this.group.position.y = this.baseY + bobOffset;
        
        // Slow rotation
        this.group.rotation.y += 0.005;
    }

    private updateMeleeHitAnimation(): void {
        // TODO: Implement melee hit animation
        // Could include quick scale pulse, color flash, etc.
    }

    private updateRangedHitAnimation(): void {
        // TODO: Implement ranged hit animation
        // Could include different visual effects
    }

    private updateMeleeAttackAnimation(): void {
        // TODO: Implement melee attack animation
        // Could include forward thrust, rotation, etc.
    }

    private updateRangedAttackAnimation(): void {
        // TODO: Implement ranged attack animation
        // Could include energy buildup, particle effects, etc.
    }

    public setState(newState: CoreState): void {
        this.state = newState;
        this.animationTime = 0; // Reset animation time for new state
    }

    public getState(): CoreState {
        return this.state;
    }

    public getGroup(): THREE.Group {
        return this.group;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.group.position.set(x, y, z);
    }

    public getPosition(): THREE.Vector3 {
        return this.group.position.clone();
    }

    public updateMainSphereColor(color: number): void {
        if (this.mainSphere && this.mainSphere.material instanceof THREE.MeshStandardMaterial) {
            this.mainSphere.material.color.setHex(color);
        }
    }

    public updateMainSphereMetalness(metalness: number): void {
        if (this.mainSphere && this.mainSphere.material instanceof THREE.MeshStandardMaterial) {
            this.mainSphere.material.metalness = metalness;
        }
    }

    public updateMainSphereRoughness(roughness: number): void {
        if (this.mainSphere && this.mainSphere.material instanceof THREE.MeshStandardMaterial) {
            this.mainSphere.material.roughness = roughness;
        }
    }

    public updateMainSphereEmissive(color: number, intensity: number): void {
        if (this.mainSphere && this.mainSphere.material instanceof THREE.MeshStandardMaterial) {
            this.mainSphere.material.emissive.setHex(color);
            this.mainSphere.material.emissiveIntensity = intensity;
        }
    }

    public updateKnobSpheresEmissive(color: number, intensity: number): void {
        this.protrudingSpheres.forEach(sphere => {
            if (sphere.material instanceof THREE.MeshStandardMaterial) {
                sphere.material.emissive.setHex(color);
                sphere.material.emissiveIntensity = intensity;
            }
        });
    }
}
