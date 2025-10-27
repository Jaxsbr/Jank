import { IComponent } from '../../ecs/IComponent';
import { EffectType } from '../EffectType';
import { TileEffectType } from '../TileEffectType';
import { ColorTransitionEffectConfig } from '../configs/ColorTransitionEffectConfig';
import { PulseEffectConfig } from '../configs/PulseEffectConfig';
import { StaticEffectConfig } from '../configs/StaticEffectConfig';

export class TileEffectComponent implements IComponent {
    private effectType: EffectType;
    private tileEffectType: TileEffectType;
    private power: number;
    private duration: number;
    private cooldown: number;
    private lastActivation: number;
    private isActive: boolean;
    private fadeOutStartTime: number;
    private isFadingOut: boolean;
    
    // Effect configs
    private staticEffectConfig?: StaticEffectConfig;
    private pulseEffectConfig?: PulseEffectConfig;
    private colorTransitionEffectConfig?: ColorTransitionEffectConfig;

    constructor(
        effectType: EffectType, 
        power: number, 
        duration: number, 
        tileEffectType: TileEffectType = TileEffectType.STATIC,
        staticConfig?: StaticEffectConfig,
        pulseConfig?: PulseEffectConfig,
        colorTransitionConfig?: ColorTransitionEffectConfig
    ) {
        this.effectType = effectType;
        this.tileEffectType = tileEffectType;
        this.power = power;
        this.duration = duration;
        this.cooldown = 1.0; // 1 second cooldown by default
        this.lastActivation = 0;
        this.isActive = false;
        this.fadeOutStartTime = 0;
        this.isFadingOut = false;
        
        // Store effect configs
        this.staticEffectConfig = staticConfig;
        this.pulseEffectConfig = pulseConfig;
        this.colorTransitionEffectConfig = colorTransitionConfig;
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
     * Force activate the tile effect (bypass cooldown check)
     */
    public forceActivate(currentTime: number): boolean {
        this.isActive = true;
        this.lastActivation = currentTime;
        return true;
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
     * Get tile effect type
     */
    public getTileEffectType(): TileEffectType {
        return this.tileEffectType;
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
     * Set last activation time (for proximity triggers)
     */
    public setLastActivation(time: number): void {
        this.lastActivation = time;
    }

    /**
     * Force deactivate the effect
     */
    public deactivate(): void {
        this.isActive = false;
    }

    /**
     * Start fade out for proximity triggers
     */
    public startFadeOut(currentTime: number): void {
        this.isFadingOut = true;
        this.fadeOutStartTime = currentTime;
    }

    /**
     * Check if effect is currently fading out
     */
    public getIsFadingOut(): boolean {
        return this.isFadingOut;
    }

    /**
     * Get fade out progress (0 = just started, 1 = complete)
     */
    public getFadeOutProgress(currentTime: number, fadeOutDuration: number): number {
        if (!this.isFadingOut) return 0;
        const elapsed = currentTime - this.fadeOutStartTime;
        return Math.min(elapsed / fadeOutDuration, 1);
    }

    /**
     * Complete fade out (call when fade out is done)
     */
    public completeFadeOut(): void {
        this.isActive = false;
        this.isFadingOut = false;
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

    /**
     * Get static effect config
     */
    public getStaticEffectConfig(): StaticEffectConfig | undefined {
        return this.staticEffectConfig;
    }

    /**
     * Get pulse effect config
     */
    public getPulseEffectConfig(): PulseEffectConfig | undefined {
        return this.pulseEffectConfig;
    }

    /**
     * Get color transition effect config
     */
    public getColorTransitionEffectConfig(): ColorTransitionEffectConfig | undefined {
        return this.colorTransitionEffectConfig;
    }
}
