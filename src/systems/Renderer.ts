import * as THREE from 'three';
import { Event, GlobalEventDispatcher, IEventListener } from './eventing';

export class Renderer implements IEventListener {
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
            GlobalEventDispatcher.registerListener("Render", this)
        }
        
    }
    onEvent(event: Event): boolean {
        const { width, height } = event.args as { width: number; height: number };
        this.renderer.setSize(width, height);
        return true;
    }

    public update(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
        this.renderer.render(scene, camera);
    }
}