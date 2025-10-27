import { IComponent } from '../../ecs/IComponent';

/**
 * Defines how a tile effect is triggered
 */
export enum TileTriggerType {
    AUTO = 'auto',           // Automatic activation based on cooldown
    PROXIMITY = 'proximity', // Activation when entities enter range
    MANUAL = 'manual',       // Manual activation (for future use)
    ALWAYS_ON = 'always_on'  // Always active (like center tile)
}

/**
 * Component that defines how a tile effect is triggered
 */
export class TileTriggerComponent implements IComponent {
    private triggerType: TileTriggerType;
    private proximityRadius: number;
    private autoCooldown: number;
    private lastAutoActivation: number;

    constructor(
        triggerType: TileTriggerType = TileTriggerType.AUTO,
        proximityRadius: number = 2.0,
        autoCooldown: number = 3.0
    ) {
        this.triggerType = triggerType;
        this.proximityRadius = proximityRadius;
        this.autoCooldown = autoCooldown;
        this.lastAutoActivation = 0;
    }

    /**
     * Get the trigger type
     */
    public getTriggerType(): TileTriggerType {
        return this.triggerType;
    }

    /**
     * Get proximity radius for proximity-based triggers
     */
    public getProximityRadius(): number {
        return this.proximityRadius;
    }

    /**
     * Get auto cooldown for auto triggers
     */
    public getAutoCooldown(): number {
        return this.autoCooldown;
    }

    /**
     * Check if auto trigger can activate (cooldown check)
     */
    public canAutoActivate(currentTime: number): boolean {
        return currentTime - this.lastAutoActivation >= this.autoCooldown;
    }

    /**
     * Mark auto trigger as activated
     */
    public markAutoActivated(currentTime: number): void {
        this.lastAutoActivation = currentTime;
    }

    /**
     * Set trigger type
     */
    public setTriggerType(triggerType: TileTriggerType): void {
        this.triggerType = triggerType;
    }

    /**
     * Set proximity radius
     */
    public setProximityRadius(radius: number): void {
        this.proximityRadius = Math.max(0, radius);
    }

    /**
     * Set auto cooldown
     */
    public setAutoCooldown(cooldown: number): void {
        this.autoCooldown = Math.max(0, cooldown);
    }
}
