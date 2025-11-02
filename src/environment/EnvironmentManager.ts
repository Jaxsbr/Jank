import * as THREE from 'three';
import { FloorComponent } from './components/FloorComponent';
import { LightingComponent } from './components/LightingComponent';
import { SkyboxComponent } from './components/SkyboxComponent';
import { WallComponent } from './components/WallComponent';
import { EnvironmentConfig } from './configs/EnvironmentConfig';
import { FloorFactory } from './factories/FloorFactory';
import { SkyboxFactory } from './factories/SkyboxFactory';
import { WallFactory } from './factories/WallFactory';

export class EnvironmentManager {
    private scene: THREE.Scene;
    private environmentGroup: THREE.Group;
    private floorComponent!: FloorComponent;
    private floorGroup!: THREE.Group;
    private wallComponents: WallComponent[] = [];
    private skyboxComponent?: SkyboxComponent;
    private lightingComponent: LightingComponent;

    constructor(scene: THREE.Scene, config: EnvironmentConfig) {
        this.scene = scene;
        this.environmentGroup = new THREE.Group();
        this.scene.add(this.environmentGroup);

        this.lightingComponent = new LightingComponent();
        this.scene.add(this.lightingComponent.getAmbientLight());
        this.scene.add(this.lightingComponent.getDirectionalLight());

        this.createEnvironment(config);
    }

    private createEnvironment(config: EnvironmentConfig): void {
        // Create floor
        const floor = FloorFactory.createFloor(config.floor);
        this.floorGroup = floor;
        this.floorComponent = new FloorComponent(config.floor);
        this.environmentGroup.add(floor);

        // Create walls
        if (config.walls) {
            config.walls.forEach(wallConfig => {
                const wall = WallFactory.createWall(wallConfig);
                const wallComponent = new WallComponent(wallConfig);
                this.wallComponents.push(wallComponent);
                this.environmentGroup.add(wall);
            });
        }

        // Create skybox
        if (config.skybox) {
            const skybox = SkyboxFactory.createSkybox(config.skybox);
            this.skyboxComponent = new SkyboxComponent(config.skybox);
            this.environmentGroup.add(skybox);
        }
    }

    public getFloorComponent(): FloorComponent {
        return this.floorComponent;
    }

    public getWallComponents(): WallComponent[] {
        return this.wallComponents;
    }

    public getSkyboxComponent(): SkyboxComponent | undefined {
        return this.skyboxComponent;
    }

    public getLightingComponent(): LightingComponent {
        return this.lightingComponent;
    }

    public getEnvironmentGroup(): THREE.Group {
        return this.environmentGroup;
    }

    public updateFloorShaderAnimation(deltaTime: number): void {
        // Update shader uniforms for animated floor patterns
        this.floorGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                if (child.material.uniforms?.['uTime']) {
                    child.material.uniforms['uTime'].value += deltaTime;
                }
            }
        });
    }
}
