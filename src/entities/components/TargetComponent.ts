import { Entity } from '../../ecs/Entity';
import { IComponent } from '../../ecs/IComponent';
import { HealthComponent } from './HealthComponent';

export class TargetComponent implements IComponent {
    private currentTarget: Entity | null;
    private targetSearchRange: number;

    constructor(targetSearchRange = 10.0) {
        this.currentTarget = null;
        this.targetSearchRange = targetSearchRange;
    }

    /**
     * Get the current target entity
     * @returns The current target entity or null if no target
     */
    public getTarget(): Entity | null {
        return this.currentTarget;
    }

    /**
     * Set the current target entity
     * @param target - The target entity to set
     */
    public setTarget(target: Entity | null): void {
        this.currentTarget = target;
    }

    /**
     * Clear the current target
     */
    public clearTarget(): void {
        this.currentTarget = null;
    }

    /**
     * Check if this entity has a target
     * @returns True if this entity has a target
     */
    public hasTarget(): boolean {
        return this.currentTarget !== null;
    }

    /**
     * Get the target search range
     * @returns The search range value
     */
    public getTargetSearchRange(): number {
        return this.targetSearchRange;
    }

    /**
     * Set the target search range
     * @param range - The new search range value
     */
    public setTargetSearchRange(range: number): void {
        this.targetSearchRange = range;
    }

    /**
     * Check if the current target is valid (not null and alive)
     * @returns True if the target is valid
     */
    public isTargetValid(): boolean {
        if (!this.currentTarget) {
            return false;
        }

        // Check if target has health component and is alive
        const healthComponent = this.currentTarget.getComponent(HealthComponent);
        return healthComponent ? healthComponent.isAlive() : false;
    }

    /**
     * Get the target's ID for event dispatching
     * @returns The target's ID or empty string if no target
     */
    public getTargetId(): string {
        return this.currentTarget ? this.currentTarget.getId() : '';
    }
}
