import { IComponent } from '../../ecs/IComponent';

export type EffectType = 'attack' | 'buff' | 'heal' | 'shield' | 'speed';

export class TileEffectComponent implements IComponent {
    private effectType: EffectType;
    private power: number;
    private duration: number;
    private cooldown: number;
    private lastActivation: number;
    private isActive: boolean;

    constructor(effectType: EffectType, power: number, duration: number) {
        this.effectType = effectType;
        this.power = power;
        this.duration = duration;
        this.cooldown = 1.0; // 1 second cooldown by default
        this.lastActivation = 0;
        this.isActive = false;
    }

    /**
     * Activate the tile effect
     */
    public activate(currentTime: number): boolean {
        if (this.canActivate(currentTime)) {
            this.isActive = true;
            this.lastActivation = currentTime;
            return true;
        }
        return false;
    }

    /**
     * Check if the effect can be activated (cooldown check)
     */
    public canActivate(currentTime: number): boolean {
        return currentTime - this.lastActivation >= this.cooldown;
    }

    /**
     * Update the effect (check duration, etc.)
     */
    public update(currentTime: number): void {
        if (this.isActive && currentTime - this.lastActivation >= this.duration) {
            this.isActive = false;
        }
    }

    /**
     * Get effect type
     */
    public getEffectType(): EffectType {
        return this.effectType;
    }

    /**
     * Get effect power
     */
    public getPower(): number {
        return this.power;
    }

    /**
     * Get effect duration
     */
    public getDuration(): number {
        return this.duration;
    }

    /**
     * Get cooldown time
     */
    public getCooldown(): number {
        return this.cooldown;
    }

    /**
     * Check if effect is currently active
     */
    public getIsActive(): boolean {
        return this.isActive;
    }

    /**
     * Set effect power
     */
    public setPower(power: number): void {
        this.power = Math.max(0, power);
    }

    /**
     * Set effect duration
     */
    public setDuration(duration: number): void {
        this.duration = Math.max(0, duration);
    }

    /**
     * Set cooldown time
     */
    public setCooldown(cooldown: number): void {
        this.cooldown = Math.max(0, cooldown);
    }

    /**
     * Force deactivate the effect
     */
    public deactivate(): void {
        this.isActive = false;
    }

    /**
     * Get time since last activation
     */
    public getTimeSinceLastActivation(currentTime: number): number {
        return currentTime - this.lastActivation;
    }

    /**
     * Get remaining cooldown time
     */
    public getRemainingCooldown(currentTime: number): number {
        const elapsed = currentTime - this.lastActivation;
        return Math.max(0, this.cooldown - elapsed);
    }
}
