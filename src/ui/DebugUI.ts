import * as THREE from 'three';
import { Core, CoreState } from '../game/Core';

export class DebugUI {
    private container!: HTMLDivElement;
    private isVisible: boolean = false;
    private core: Core;
    private camera: THREE.PerspectiveCamera;
    private floor: THREE.Group;

    constructor(core: Core, camera: THREE.PerspectiveCamera, floor: THREE.Group) {
        this.core = core;
        this.camera = camera;
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
        title.textContent = 'Core Control Panel';
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 10px;
            color: #40E0D0;
            text-align: center;
        `;
        this.container.appendChild(title);

        // Create state picker
        const stateLabel = document.createElement('div');
        stateLabel.textContent = 'Core State:';
        stateLabel.style.marginBottom = '5px';
        this.container.appendChild(stateLabel);

        const stateSelect = document.createElement('select');
        stateSelect.id = 'core-state-select';
        stateSelect.style.cssText = `
            width: 100%;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #40E0D0;
            border-radius: 4px;
            color: white;
            font-family: inherit;
            font-size: 24px;
        `;

        // Add options for each CoreState
        Object.values(CoreState).forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });

        // Set default to Idle
        stateSelect.value = CoreState.Idle;

        // Add change listener
        stateSelect.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            this.core.setState(target.value as CoreState);
        });

        this.container.appendChild(stateSelect);

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
        zoomSlider.min = '5';
        zoomSlider.max = '50';
        zoomSlider.step = '5';
        zoomSlider.value = '50'; // Default to current position
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
            this.camera.position.set(0, distance, distance);
            zoomValue.textContent = `Distance: ${distance}`;
        });

        this.container.appendChild(zoomSlider);
        this.container.appendChild(zoomValue);

        // Add Core Material Controls
        const materialLabel = document.createElement('div');
        materialLabel.textContent = 'Core Material:';
        materialLabel.style.cssText = `
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
            color: #40E0D0;
        `;
        this.container.appendChild(materialLabel);

        // Note: Main sphere is now white, controlled by glow

        // Metalness control
        const metalnessLabel = document.createElement('div');
        metalnessLabel.textContent = 'Metalness:';
        metalnessLabel.style.cssText = `
            margin-top: 15px;
            margin-bottom: 5px;
        `;
        this.container.appendChild(metalnessLabel);

        const metalnessSlider = document.createElement('input');
        metalnessSlider.type = 'range';
        metalnessSlider.id = 'metalness-slider';
        metalnessSlider.min = '0';
        metalnessSlider.max = '1';
        metalnessSlider.step = '0.1';
        metalnessSlider.value = '0.3';
        metalnessSlider.style.cssText = `
            width: 100%;
            height: 30px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #40E0D0;
            border-radius: 4px;
            outline: none;
        `;

        const metalnessValue = document.createElement('div');
        metalnessValue.id = 'metalness-value';
        metalnessValue.textContent = `Metalness: ${metalnessSlider.value}`;
        metalnessValue.style.cssText = `
            margin-top: 5px;
            font-size: 20px;
            color: #40E0D0;
            text-align: center;
        `;

        metalnessSlider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const metalness = parseFloat(target.value);
            this.core.updateMainSphereMetalness(metalness);
            metalnessValue.textContent = `Metalness: ${metalness.toFixed(1)}`;
        });

        this.container.appendChild(metalnessSlider);
        this.container.appendChild(metalnessValue);

        // Add Glow Controls
        const glowLabel = document.createElement('div');
        glowLabel.textContent = 'Glow Effect:';
        glowLabel.style.cssText = `
            margin-top: 15px;
            margin-bottom: 5px;
        `;
        this.container.appendChild(glowLabel);

        // Glow color control
        const glowColorLabel = document.createElement('div');
        glowColorLabel.textContent = 'Glow Color:';
        glowColorLabel.style.marginBottom = '5px';
        this.container.appendChild(glowColorLabel);

        const glowColorInput = document.createElement('input');
        glowColorInput.type = 'color';
        glowColorInput.id = 'glow-color-picker';
        glowColorInput.value = '#000000'; // Default to black (no glow)
        glowColorInput.style.cssText = `
            width: 100%;
            height: 40px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #40E0D0;
            border-radius: 4px;
        `;
        this.container.appendChild(glowColorInput);

        // Glow intensity control
        const glowIntensityLabel = document.createElement('div');
        glowIntensityLabel.textContent = 'Glow Intensity:';
        glowIntensityLabel.style.cssText = `
            margin-top: 10px;
            margin-bottom: 5px;
        `;
        this.container.appendChild(glowIntensityLabel);

        const glowIntensitySlider = document.createElement('input');
        glowIntensitySlider.type = 'range';
        glowIntensitySlider.id = 'glow-intensity-slider';
        glowIntensitySlider.min = '0';
        glowIntensitySlider.max = '2';
        glowIntensitySlider.step = '0.1';
        glowIntensitySlider.value = '0';
        glowIntensitySlider.style.cssText = `
            width: 100%;
            height: 30px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #40E0D0;
            border-radius: 4px;
            outline: none;
        `;

        const glowIntensityValue = document.createElement('div');
        glowIntensityValue.id = 'glow-intensity-value';
        glowIntensityValue.textContent = `Intensity: ${glowIntensitySlider.value}`;
        glowIntensityValue.style.cssText = `
            margin-top: 5px;
            font-size: 20px;
            color: #40E0D0;
            text-align: center;
        `;

        // Update glow when either color or intensity changes
        const updateGlow = () => {
            const color = glowColorInput.value.replace('#', '0x');
            const intensity = parseFloat(glowIntensitySlider.value);
            this.core.updateMainSphereEmissive(parseInt(color, 16), intensity);
            glowIntensityValue.textContent = `Intensity: ${intensity.toFixed(1)}`;
        };

        glowColorInput.addEventListener('change', updateGlow);
        glowIntensitySlider.addEventListener('input', updateGlow);

        this.container.appendChild(glowIntensitySlider);
        this.container.appendChild(glowIntensityValue);

        // Add Knob Glow Controls
        const knobGlowLabel = document.createElement('div');
        knobGlowLabel.textContent = 'Knob Glow:';
        knobGlowLabel.style.cssText = `
            margin-top: 15px;
            margin-bottom: 5px;
        `;
        this.container.appendChild(knobGlowLabel);

        // Knob glow color control
        const knobGlowColorLabel = document.createElement('div');
        knobGlowColorLabel.textContent = 'Knob Glow Color:';
        knobGlowColorLabel.style.marginBottom = '5px';
        this.container.appendChild(knobGlowColorLabel);

        const knobGlowColorInput = document.createElement('input');
        knobGlowColorInput.type = 'color';
        knobGlowColorInput.id = 'knob-glow-color-picker';
        knobGlowColorInput.value = '#8A2BE2'; // Default to violet
        knobGlowColorInput.style.cssText = `
            width: 100%;
            height: 40px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #40E0D0;
            border-radius: 4px;
        `;
        this.container.appendChild(knobGlowColorInput);

        // Knob glow intensity control
        const knobGlowIntensityLabel = document.createElement('div');
        knobGlowIntensityLabel.textContent = 'Knob Glow Intensity:';
        knobGlowIntensityLabel.style.cssText = `
            margin-top: 10px;
            margin-bottom: 5px;
        `;
        this.container.appendChild(knobGlowIntensityLabel);

        const knobGlowIntensitySlider = document.createElement('input');
        knobGlowIntensitySlider.type = 'range';
        knobGlowIntensitySlider.id = 'knob-glow-intensity-slider';
        knobGlowIntensitySlider.min = '0';
        knobGlowIntensitySlider.max = '2';
        knobGlowIntensitySlider.step = '0.1';
        knobGlowIntensitySlider.value = '0';
        knobGlowIntensitySlider.style.cssText = `
            width: 100%;
            height: 30px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #40E0D0;
            border-radius: 4px;
            outline: none;
        `;

        const knobGlowIntensityValue = document.createElement('div');
        knobGlowIntensityValue.id = 'knob-glow-intensity-value';
        knobGlowIntensityValue.textContent = `Intensity: ${knobGlowIntensitySlider.value}`;
        knobGlowIntensityValue.style.cssText = `
            margin-top: 5px;
            font-size: 20px;
            color: #40E0D0;
            text-align: center;
        `;

        // Update knob glow when either color or intensity changes
        const updateKnobGlow = () => {
            const color = knobGlowColorInput.value.replace('#', '0x');
            const intensity = parseFloat(knobGlowIntensitySlider.value);
            this.core.updateKnobSpheresEmissive(parseInt(color, 16), intensity);
            knobGlowIntensityValue.textContent = `Intensity: ${intensity.toFixed(1)}`;
        };

        knobGlowColorInput.addEventListener('change', updateKnobGlow);
        knobGlowIntensitySlider.addEventListener('input', updateKnobGlow);

        this.container.appendChild(knobGlowIntensitySlider);
        this.container.appendChild(knobGlowIntensityValue);

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
