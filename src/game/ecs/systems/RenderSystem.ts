import { Scene } from 'three';
import { Renderer } from '../../../systems/Renderer';

export class RenderSystem {
    private renderer: Renderer;
    private scene: Scene;

    constructor(renderer: Renderer, scene: Scene) {
        this.renderer = renderer
        this.scene = scene
    }

    update(): void {        
        this.renderer.update(this.scene)
    }
}