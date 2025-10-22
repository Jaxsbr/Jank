import { IComponent } from '../ecs/IComponent';

export class HealthComponent implements IComponent {
    private maxHP: number;
    private hp: number;

    constructor(maxHP: number) {
        this.maxHP = maxHP;
        this.hp = maxHP;
    }

    /**
     * Check if the entity is alive (has HP > 0)
     * @returns true if the entity is alive, false otherwise
     */
    public isAlive(): boolean {
        return this.hp > 0;
    }

    /**
     * Add HP to the entity
     * @param value - The amount of HP to add
     */
    public addHP(value: number): void {
        this.hp = Math.min(this.hp + value, this.maxHP);
    }

    /**
     * Remove HP from the entity
     * @param value - The amount of HP to remove
     */
    public removeHP(value: number): void {
        this.hp = Math.max(this.hp - value, 0);
    }

    /**
     * Get the current HP value
     * @returns The current HP
     */
    public getHP(): number {
        return this.hp;
    }

    /**
     * Get the maximum HP value
     * @returns The maximum HP
     */
    public getMaxHP(): number {
        return this.maxHP;
    }

    /**
     * Set the current HP value
     * @param hp - The new HP value (clamped between 0 and maxHP)
     */
    public setHP(hp: number): void {
        this.hp = Math.max(0, Math.min(hp, this.maxHP));
    }

    /**
     * Get the HP as a percentage of max HP
     * @returns HP percentage (0.0 to 1.0)
     */
    public getHPPercentage(): number {
        return this.maxHP > 0 ? this.hp / this.maxHP : 0;
    }
}