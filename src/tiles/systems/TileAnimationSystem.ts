import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { TileVisualComponent } from '../components/TileVisualComponent';

export class TileAnimationSystem implements IEntitySystem {
    private animationSpeed: number;

    constructor(animationSpeed: number = 2.0) {
        this.animationSpeed = animationSpeed;
    }

    update(entities: readonly Entity[]): void {
        const currentTime = performance.now() / 1000; // Convert to seconds
        const deltaTime = 1/60; // Assume 60 FPS for now, could be improved with actual delta time

        entities.forEach(entity => {
            if (entity.hasComponent(TileVisualComponent)) {
                const visualComponent = entity.getComponent(TileVisualComponent);
                
                if (visualComponent) {
                    // Update height animation
                    visualComponent.updateHeight(deltaTime, this.animationSpeed);
                    
                    // TODO: Add other tile animations like:
                    // - Pulsing effects
                    // - Rotation animations
                    // - Scale animations
                    // - Color transitions
                }
            }
        });
    }

    /**
     * Set animation speed
     */
    public setAnimationSpeed(speed: number): void {
        this.animationSpeed = Math.max(0, speed);
    }

    /**
     * Get animation speed
     */
    public getAnimationSpeed(): number {
        return this.animationSpeed;
    }
}
