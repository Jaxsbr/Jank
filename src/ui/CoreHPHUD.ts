import * as THREE from 'three';

export class CoreHPHUD {
    private uiScene: THREE.Scene;
    private uiCamera: THREE.OrthographicCamera;
    private backgroundMesh: THREE.Mesh;
    private fillMesh: THREE.Mesh;
    private borderMesh: THREE.Mesh;
    private outlineMesh: THREE.Mesh;

    private screenWidth: number;
    private screenHeight: number;

    private barWidthPx: number = 20;
    private barHeightPx: number = 200;
    private marginLeftPx: number = 24;

    constructor(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;

        this.uiScene = new THREE.Scene();
        this.uiCamera = new THREE.OrthographicCamera(0, width, height, 0, -10, 10);

        // Create meshes
        this.backgroundMesh = this.createPlane(this.barWidthPx, this.barHeightPx, 0x0a0a14, 0.85);
        this.backgroundMesh.position.z = 0;

        this.fillMesh = this.createPlane(this.barWidthPx, this.barHeightPx, 0x40E0D0, 0.95);
        this.fillMesh.position.z = 0.01;

        this.borderMesh = this.createPlane(this.barWidthPx + 6, this.barHeightPx + 6, 0x40E0D0, 0.35);
        this.borderMesh.position.z = 0.02;

        this.uiScene.add(this.borderMesh);
        this.uiScene.add(this.backgroundMesh);
        this.uiScene.add(this.fillMesh);

        // Add contrasting outline
        this.outlineMesh = this.createPlane(this.barWidthPx + 8, this.barHeightPx + 8, 0xFFD700, 0.7);
        this.outlineMesh.position.z = -0.01;
        this.uiScene.add(this.outlineMesh);

        this.layout();
        this.updateHP(1, 1);
    }

    private createPlane(widthPx: number, heightPx: number, color: number, opacity: number): THREE.Mesh {
        const geometry = new THREE.PlaneGeometry(widthPx, heightPx);
        const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            depthWrite: false
        });
        return new THREE.Mesh(geometry, material);
    }

    private layout(): void {
        // Position left side, vertically centered
        const centerY = this.screenHeight / 2;
        const barCenterX = this.marginLeftPx + this.barWidthPx / 2;

        this.backgroundMesh.position.set(barCenterX, centerY, this.backgroundMesh.position.z);
        this.fillMesh.position.set(barCenterX, centerY, this.fillMesh.position.z);
        this.borderMesh.position.set(barCenterX, centerY, this.borderMesh.position.z);
        this.outlineMesh.position.set(barCenterX, centerY, this.outlineMesh.position.z);
    }

    public updateHP(current: number, max: number): void {
        const pct = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;

        // Scale fill height and anchor to bottom edge
        this.fillMesh.scale.y = pct;
        const barBottom = this.backgroundMesh.position.y - this.barHeightPx / 2;
        const newFillCenterY = barBottom + (this.barHeightPx * pct) / 2;
        this.fillMesh.position.y = newFillCenterY;

        // Color based on percentage
        const color = this.getColorForPercentage(pct);
        (this.fillMesh.material as THREE.MeshBasicMaterial).color.setHex(color);
    }

    private getColorForPercentage(p: number): number {
        if (p > 0.6) return 0x40E0D0; // Cyan
        if (p > 0.3) return this.lerpColor(0xFFD700, 0x40E0D0, (p - 0.3) / 0.3);
        return this.lerpColor(0xFF4444, 0xFFD700, p / 0.3);
    }

    private lerpColor(a: number, b: number, t: number): number {
        const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
        const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
        const r = Math.round(ar + (br - ar) * t);
        const g = Math.round(ag + (bg - ag) * t);
        const bch = Math.round(ab + (bb - ab) * t);
        return (r << 16) | (g << 8) | bch;
    }

    public onResize(width: number, height: number): void {
        this.screenWidth = width;
        this.screenHeight = height;
        this.uiCamera.left = 0;
        this.uiCamera.right = width;
        this.uiCamera.top = height;
        this.uiCamera.bottom = 0;
        this.uiCamera.updateProjectionMatrix();
        this.layout();
    }

    public getUIScene(): THREE.Scene {
        return this.uiScene;
    }

    public getUICamera(): THREE.OrthographicCamera {
        return this.uiCamera;
    }

    public destroy(): void {
        this.uiScene.clear();
        this.backgroundMesh.geometry.dispose();
        this.fillMesh.geometry.dispose();
        this.borderMesh.geometry.dispose();
        this.outlineMesh.geometry.dispose();
        (this.backgroundMesh.material as THREE.Material).dispose();
        (this.fillMesh.material as THREE.Material).dispose();
        (this.borderMesh.material as THREE.Material).dispose();
        (this.outlineMesh.material as THREE.Material).dispose();
    }
}
