/**
 * Configuration for collision detection and resolution system.
 */
export interface CollisionConfig {
    /**
     * Default collision radius multiplier relative to geometry size.
     * For example, 1.0 means collision radius equals geometry radius,
     * 1.2 means 20% larger than geometry radius.
     */
    defaultRadiusMultiplier: number;

    /**
     * Minimum separation distance between entities after collision resolution.
     * Entities will be pushed apart until they are at least this distance apart.
     */
    minSeparationDistance: number;

    /**
     * Strength of the push force when resolving collisions.
     * Higher values cause entities to separate more aggressively.
     * Values typically range from 0.1 to 1.0.
     */
    pushForceStrength: number;

    /**
     * Whether to use 2D collisions (ignoring Y coordinate) or 3D collisions.
     * 2D is recommended for ground-based games to prevent Y-axis issues.
     */
    use2D: boolean;
}

export const defaultCollisionConfig: CollisionConfig = {
    defaultRadiusMultiplier: 1.0,
    minSeparationDistance: 0.1, // Small buffer to prevent overlap
    pushForceStrength: 0.5,
    use2D: true
};

