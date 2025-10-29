import * as THREE from 'three';
import { Event } from './eventing/Event';
import { GlobalEventDispatcher } from './eventing/EventDispatcher';
import { EventType } from './eventing/EventType';
import { IEventListener } from './eventing/IEventListener';

export class Renderer implements IEventListener {
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    constructor(width: number, height: number) {
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        // Position camera
        this.camera.position.set(0, 8, 8);
        // this.camera.position.set(0, 20, 0); // top down
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x1a1a1a);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // Allow multi-pass rendering (world then UI overlay)
        this.renderer.autoClear = false;

        const app = document.getElementById('app');
        if (app) {
            app.appendChild(this.renderer.domElement);
            GlobalEventDispatcher.registerListener("Render", this)
        }
        
    }
    onEvent(event: Event): void {
        if (event.eventName === EventType.WindowResize) {
            const { width, height } = event.args as { width: number; height: number };
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);            
        }

        if (event.eventName === EventType.CameraZoomChanged) {
            const { x, y, z } = event.args as { x: number, y: number, z: number };
            this.camera.position.set(x, y, z);
        }
    }

    public update(scene: THREE.Scene): void {
        // Clear once per frame, then render world
        this.renderer.clear();
        this.renderer.render(scene, this.camera);
    }

    public renderOverlay(uiScene: THREE.Scene, uiCamera: THREE.Camera): void {
        // Preserve color, clear depth to render overlay on top
        this.renderer.clearDepth();
        this.renderer.render(uiScene, uiCamera);
    }

    public getCamera(): THREE.Camera {
        return this.camera;
    }
}