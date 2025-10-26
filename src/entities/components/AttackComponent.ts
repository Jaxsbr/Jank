import { IComponent } from '../../ecs/IComponent';

export class AttackComponent implements IComponent {
    private damage: number;
    private range: number;
    private cooldownDuration: number; // in milliseconds
    private lastAttackTime: number;

    constructor(damage: number, range: number, cooldownDuration: number) {
        this.damage = damage;
        this.range = range;
        this.cooldownDuration = cooldownDuration;
        this.lastAttackTime = 0;
    }

    /**
     * Get the attack damage
     * @returns The damage value
     */
    public getDamage(): number {
        return this.damage;
    }

    /**
     * Set the attack damage
     * @param damage - The new damage value
     */
    public setDamage(damage: number): void {
        this.damage = damage;
    }

    /**
     * Get the attack range
     * @returns The range value
     */
    public getRange(): number {
        return this.range;
    }

    /**
     * Set the attack range
     * @param range - The new range value
     */
    public setRange(range: number): void {
        this.range = range;
    }

    /**
     * Get the cooldown duration in milliseconds
     * @returns The cooldown duration
     */
    public getCooldownDuration(): number {
        return this.cooldownDuration;
    }

    /**
     * Set the cooldown duration
     * @param cooldownDuration - The new cooldown duration in milliseconds
     */
    public setCooldownDuration(cooldownDuration: number): void {
        this.cooldownDuration = cooldownDuration;
    }

    /**
     * Get the last attack time
     * @returns The timestamp of the last attack
     */
    public getLastAttackTime(): number {
        return this.lastAttackTime;
    }

    /**
     * Check if the entity can attack (cooldown has expired)
     * @param currentTime - The current timestamp
     * @returns True if the entity can attack
     */
    public canAttack(currentTime: number): boolean {
        return currentTime - this.lastAttackTime >= this.cooldownDuration;
    }

    /**
     * Check if a target is within attack range
     * @param distance - The distance to the target
     * @returns True if the target is within range
     */
    public isInRange(distance: number): boolean {
        return distance <= this.range;
    }

    /**
     * Perform an attack (update last attack time)
     * @param currentTime - The current timestamp
     */
    public performAttack(currentTime: number): void {
        this.lastAttackTime = currentTime;
    }

    /**
     * Get the time remaining until the next attack is available
     * @param currentTime - The current timestamp
     * @returns The time remaining in milliseconds
     */
    public getTimeUntilNextAttack(currentTime: number): number {
        const timeSinceLastAttack = currentTime - this.lastAttackTime;
        return Math.max(0, this.cooldownDuration - timeSinceLastAttack);
    }
}
