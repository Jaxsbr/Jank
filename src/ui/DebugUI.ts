import * as THREE from 'three';
import { Event } from '../systems/eventing/Event';
import { GlobalEventDispatcher } from '../systems/eventing/EventDispatcher';
import { EventType } from '../systems/eventing/EventType';

export class DebugUI {
    private container!: HTMLDivElement;
    private isVisible: boolean = false;
    private floor: THREE.Group;

    constructor(floor: THREE.Group) {
        this.floor = floor;
        this.createUI();
        this.setupEventListeners();
    }

    private createUI(): void {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'debug-ui';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #40E0D0;
            border-radius: 8px;
            padding: 30px;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 28px;
            min-width: 400px;
            display: none;
            z-index: 1000;
        `;

        // Create title
        const title = document.createElement('div');
        title.textContent = 'Debug Control Panel';
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 10px;
            color: #40E0D0;
            text-align: center;
        `;
        this.container.appendChild(title);

        // Add zoom control
        const zoomLabel = document.createElement('div');
        zoomLabel.textContent = 'Camera Zoom:';
        zoomLabel.style.cssText = `
            margin-top: 20px;
            margin-bottom: 5px;
        `;
        this.container.appendChild(zoomLabel);

        const zoomSlider = document.createElement('input');
        zoomSlider.type = 'range';
        zoomSlider.id = 'zoom-slider';
        zoomSlider.min = '2';
        zoomSlider.max = '30';
        zoomSlider.step = '1';
        zoomSlider.value = '5'; // Default to current position
        zoomSlider.style.cssText = `
            width: 100%;
            height: 30px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #40E0D0;
            border-radius: 4px;
            outline: none;
        `;

        // Add zoom value display
        const zoomValue = document.createElement('div');
        zoomValue.id = 'zoom-value';
        zoomValue.textContent = `Distance: ${zoomSlider.value}`;
        zoomValue.style.cssText = `
            margin-top: 5px;
            font-size: 20px;
            color: #40E0D0;
            text-align: center;
        `;

        // Add change listener for zoom
        zoomSlider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const distance = parseInt(target.value);
            GlobalEventDispatcher.dispatch(new Event<{ x: number, y: number, z: number }>(
                EventType.CameraZoomChanged, {
                    x: 0,
                    y: distance,
                    z: distance
                }));
            zoomValue.textContent = `Distance: ${distance}`;
        });

        this.container.appendChild(zoomSlider);
        this.container.appendChild(zoomValue);


        // Add Floor Material Controls
        const floorLabel = document.createElement('div');
        floorLabel.textContent = 'Floor Material:';
        floorLabel.style.cssText = `
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
            color: #40E0D0;
        `;
        this.container.appendChild(floorLabel);

        // Floor color control
        const floorColorLabel = document.createElement('div');
        floorColorLabel.textContent = 'Floor Color:';
        floorColorLabel.style.marginBottom = '5px';
        this.container.appendChild(floorColorLabel);

        const floorColorInput = document.createElement('input');
        floorColorInput.type = 'color';
        floorColorInput.id = 'floor-color-picker';
        floorColorInput.value = '#009900'; // Default grass green
        floorColorInput.style.cssText = `
            width: 100%;
            height: 40px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #40E0D0;
            border-radius: 4px;
        `;
        floorColorInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            const hexColor = target.value.replace('#', '0x');
            this.updateFloorColor(parseInt(hexColor, 16));
        });
        this.container.appendChild(floorColorInput);

        // Add instructions
        const instructions = document.createElement('div');
        instructions.textContent = 'Press D to toggle this panel';
        instructions.style.cssText = `
            margin-top: 20px;
            font-size: 24px;
            color: #888;
            text-align: center;
        `;
        this.container.appendChild(instructions);

        // Add to document
        document.body.appendChild(this.container);
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'd') {
                this.toggle();
            }
        });
    }

    public toggle(): void {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'block' : 'none';
    }

    public show(): void {
        this.isVisible = true;
        this.container.style.display = 'block';
    }

    public hide(): void {
        this.isVisible = false;
        this.container.style.display = 'none';
    }

    public destroy(): void {
        if (this.container?.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }

    private updateFloorColor(color: number): void {
        this.floor.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.color.setHex(color);
            }
        });
    }
}
