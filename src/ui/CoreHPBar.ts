import * as THREE from 'three';

export class CoreHPBar {
    private group: THREE.Group;
    private backgroundMesh!: THREE.Mesh;
    private fillMesh!: THREE.Mesh;
    private borderMesh!: THREE.Mesh;
    private maxHP: number = 100;
    private currentHP: number = 100;
    private camera: THREE.Camera;

    constructor(camera: THREE.Camera) {
        this.camera = camera;
        this.group = new THREE.Group();
        this.createBackground();
        this.createFill();
        this.createBorder();
        this.setPosition(-8, 0, -5); // Left side of view, closer to camera
    }

    private createBackground(): void {
        const geometry = new THREE.PlaneGeometry(0.25, 4); // Vertical bar: width=0.25, height=4
        const material = new THREE.MeshBasicMaterial({
            color: 0x0a0a14,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });
        
        this.backgroundMesh = new THREE.Mesh(geometry, material);
        this.backgroundMesh.position.z = 0;
        this.group.add(this.backgroundMesh);
    }

    private createFill(): void {
        const geometry = new THREE.PlaneGeometry(0.25, 4); // Vertical bar: width=0.25, height=4
        const material = new THREE.MeshBasicMaterial({
            color: 0x40E0D0, // Start with cyan
            transparent: true,
            opacity: 0.9,
            depthWrite: false
        });
        
        this.fillMesh = new THREE.Mesh(geometry, material);
        this.fillMesh.position.z = 0.01;
        this.group.add(this.fillMesh);
    }

    private createBorder(): void {
        const geometry = new THREE.PlaneGeometry(0.33, 4.08); // Slightly larger than background
        const material = new THREE.MeshBasicMaterial({
            color: 0x40E0D0,
            transparent: true,
            opacity: 0.6,
            depthWrite: false
        });
        
        this.borderMesh = new THREE.Mesh(geometry, material);
        this.borderMesh.position.z = 0.02;
        this.group.add(this.borderMesh);
    }

    public updateHP(current: number, max: number): void {
        this.currentHP = current;
        this.maxHP = max;
        
        const percentage = max > 0 ? current / max : 0;
        
        // Update fill height (vertical bar)
        this.fillMesh.scale.y = percentage;
        
        // Update fill color based on percentage
        const color = this.getColorForPercentage(percentage);
        (this.fillMesh.material as THREE.MeshBasicMaterial).color.setHex(color);
    }

    private getColorForPercentage(percentage: number): number {
        if (percentage > 0.6) {
            return 0x40E0D0; // Cyan
        } else if (percentage > 0.3) {
            // Interpolate between cyan and yellow
            const t = (percentage - 0.3) / 0.3;
            return this.lerpColor(0xFFD700, 0x40E0D0, t);
        } else {
            // Interpolate between yellow and red
            const t = percentage / 0.3;
            return this.lerpColor(0xFF4444, 0xFFD700, t);
        }
    }

    private lerpColor(color1: number, color2: number, t: number): number {
        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;
        
        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;
        
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        return (r << 16) | (g << 8) | b;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.group.position.set(x, y, z);
    }

    public updatePosition(): void {
        // Position bar on left side of screen, always facing camera
        const leftOffset = -8; // Distance from center
        const forwardOffset = -5; // Closer to camera
        
        this.group.position.set(leftOffset, 0, forwardOffset);
        
        // Make bar always face camera (billboard effect)
        this.group.lookAt(this.camera.position);
        
        // Reset rotation to keep bar vertical
        this.group.rotation.x = 0;
        this.group.rotation.z = 0;
    }

    public getGroup(): THREE.Group {
        return this.group;
    }

    public destroy(): void {
        this.group.clear();
        this.backgroundMesh.geometry.dispose();
        this.fillMesh.geometry.dispose();
        this.borderMesh.geometry.dispose();
        (this.backgroundMesh.material as THREE.Material).dispose();
        (this.fillMesh.material as THREE.Material).dispose();
        (this.borderMesh.material as THREE.Material).dispose();
    }
}
