import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Time } from '../../utils/Time';
import { TileVisualComponent } from '../components/TileVisualComponent';

export class TileAnimationSystem implements IEntitySystem {
    private animationSpeed: number;
    private heartbeatTime: number;

    constructor(animationSpeed: number = 2.0) {
        this.animationSpeed = animationSpeed;
        this.heartbeatTime = 0;
    }

    update(entities: readonly Entity[]): void {
        const deltaTime = Time.getDeltaTime(); // Use actual delta time from Time system
        this.heartbeatTime += deltaTime;

        EntityQuery.from(entities)
            .withComponents(TileVisualComponent)
            .execute()
            .forEach(({ components }) => {
                const [visualComponent] = components;
                
                // Update height animation
                visualComponent.updateHeight(deltaTime, this.animationSpeed);
                
                // Update glow intensity animation
                visualComponent.updateGlowIntensity(deltaTime, 2.0);
                
                // Update idle heartbeat modulation
                visualComponent.updateIdleHeartbeat(this.heartbeatTime);
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
