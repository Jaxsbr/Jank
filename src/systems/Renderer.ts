import * as THREE from 'three';

export class Renderer {
    private renderer: THREE.WebGLRenderer;
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x1a1a1a);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const app = document.getElementById('app');
        if (app) {
            app.appendChild(this.renderer.domElement);

            // TODO: subscribe to browser resize event, update reneder size
        }
        
    }

    public update(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
        this.renderer.render(scene, camera);
    }
}