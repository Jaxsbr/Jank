import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Time } from '../../utils/Time';
import { TileVisualComponent } from '../components/TileVisualComponent';

export class TileAnimationSystem implements IEntitySystem {
    private animationSpeed: number;

    constructor(animationSpeed: number = 2.0) {
        this.animationSpeed = animationSpeed;
    }

    update(entities: readonly Entity[]): void {
        const deltaTime = Time.getDeltaTime(); // Use actual delta time from Time system

        EntityQuery.from(entities)
            .withComponents(TileVisualComponent)
            .execute()
            .forEach(({ entity, components }) => {
                const [visualComponent] = components;
                
                // Update height animation
                visualComponent.updateHeight(deltaTime, this.animationSpeed);
                
                // TODO: Add other tile animations like:
                // - Pulsing effects
                // - Rotation animations
                // - Scale animations
                // - Color transitions
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
