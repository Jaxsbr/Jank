import { IComponent } from '../../ecs/IComponent';

/**
 * Component that stores collision properties for an entity.
 * Used by CollisionSystem to detect and resolve collisions between entities.
 */
export class CollisionComponent implements IComponent {
    private collisionRadius: number;
    private immovable: boolean;

    constructor(collisionRadius: number, immovable: boolean = false) {
        this.collisionRadius = collisionRadius;
        this.immovable = immovable;
    }

    /**
     * Get the collision radius
     * @returns The collision radius value
     */
    public getCollisionRadius(): number {
        return this.collisionRadius;
    }

    /**
     * Set the collision radius
     * @param radius - The new collision radius value
     */
    public setCollisionRadius(radius: number): void {
        this.collisionRadius = radius;
    }

    /**
     * Check if this entity is immovable (cannot be pushed by collisions)
     * @returns True if the entity is immovable
     */
    public isImmovable(): boolean {
        return this.immovable;
    }

    /**
     * Set whether this entity is immovable
     * @param immovable - Whether the entity should be immovable
     */
    public setImmovable(immovable: boolean): void {
        this.immovable = immovable;
    }
}

