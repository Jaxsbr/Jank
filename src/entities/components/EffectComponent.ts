import { IComponent } from '../../ecs/IComponent';
import { EffectType } from '../EffectType';

/**
 * Represents an active effect on an entity
 */
export interface ActiveEffect {
    id: string;
    effectType: EffectType;
    strength: number;
    duration: number;
    startTime: number;
    source?: string; // Optional source identifier (e.g., tile ID)
    stackable: boolean;
    maxStacks?: number;
}

/**
 * Effect stacking behavior
 */
export enum EffectStackBehavior {
    REPLACE,    // New effect replaces old effect of same type
    STACK,      // Effects stack up to maxStacks
    REFRESH     // New effect refreshes duration but doesn't stack
}

/**
 * Component that tracks active effects on an entity
 */
export class EffectComponent implements IComponent {
    private activeEffects: Map<string, ActiveEffect>;
    private effectStackBehavior: Map<EffectType, EffectStackBehavior>;

    constructor() {
        this.activeEffects = new Map();
        this.effectStackBehavior = new Map();
        
        // Set default stacking behaviors
        this.effectStackBehavior.set(EffectType.ATTACK, EffectStackBehavior.REPLACE);
        this.effectStackBehavior.set(EffectType.BUFF, EffectStackBehavior.STACK);
        this.effectStackBehavior.set(EffectType.HEAL, EffectStackBehavior.REPLACE);
        this.effectStackBehavior.set(EffectType.SHIELD, EffectStackBehavior.STACK);
        this.effectStackBehavior.set(EffectType.SPEED, EffectStackBehavior.REPLACE);
    }

    /**
     * Apply a new effect to the entity
     * @param effectType - The type of effect to apply
     * @param strength - The strength/power of the effect
     * @param duration - How long the effect lasts (in seconds)
     * @param source - Optional source identifier
     * @param currentTime - Current time in seconds
     * @returns true if effect was applied, false if blocked by stacking rules
     */
    public applyEffect(
        effectType: EffectType, 
        strength: number, 
        duration: number, 
        currentTime: number,
        source?: string
    ): boolean {
        const effectId = this.generateEffectId(effectType, source);
        const existingEffect = this.activeEffects.get(effectId);
        const stackBehavior = this.effectStackBehavior.get(effectType) ?? EffectStackBehavior.REPLACE;

        switch (stackBehavior) {
            case EffectStackBehavior.REPLACE:
                // Replace existing effect
                this.activeEffects.set(effectId, {
                    id: effectId,
                    effectType,
                    strength,
                    duration,
                    startTime: currentTime,
                    source,
                    stackable: false
                });
                return true;

            case EffectStackBehavior.STACK:
                if (existingEffect) {
                    // Check if we can stack more
                    const maxStacks = existingEffect.maxStacks ?? 3;
                    const currentStacks = this.getEffectStacks(effectType);
                    if (currentStacks >= maxStacks) {
                        return false; // Can't stack more
                    }
                    
                    // Increase strength and refresh duration
                    existingEffect.strength += strength;
                    existingEffect.duration = Math.max(existingEffect.duration, duration);
                    existingEffect.startTime = currentTime;
                } else {
                    // Create new stacked effect
                    this.activeEffects.set(effectId, {
                        id: effectId,
                        effectType,
                        strength,
                        duration,
                        startTime: currentTime,
                        source,
                        stackable: true,
                        maxStacks: 3
                    });
                }
                return true;

            case EffectStackBehavior.REFRESH:
                if (existingEffect) {
                    // Refresh duration and update strength
                    existingEffect.duration = Math.max(existingEffect.duration, duration);
                    existingEffect.strength = Math.max(existingEffect.strength, strength);
                    existingEffect.startTime = currentTime;
                } else {
                    // Create new effect
                    this.activeEffects.set(effectId, {
                        id: effectId,
                        effectType,
                        strength,
                        duration,
                        startTime: currentTime,
                        source,
                        stackable: false
                    });
                }
                return true;
            default:
                return false;
        }
    }

    /**
     * Remove an effect from the entity
     * @param effectType - The type of effect to remove
     * @param source - Optional source identifier
     */
    public removeEffect(effectType: EffectType, source?: string): void {
        const effectId = this.generateEffectId(effectType, source);
        this.activeEffects.delete(effectId);
    }

    /**
     * Remove all effects of a specific type
     * @param effectType - The type of effects to remove
     */
    public removeAllEffectsOfType(effectType: EffectType): void {
        for (const [id, effect] of this.activeEffects) {
            if (effect.effectType === effectType) {
                this.activeEffects.delete(id);
            }
        }
    }

    /**
     * Remove all active effects
     */
    public removeAllEffects(): void {
        this.activeEffects.clear();
    }

    /**
     * Check if entity has a specific effect
     * @param effectType - The type of effect to check
     * @param source - Optional source identifier
     * @returns true if effect is active
     */
    public hasEffect(effectType: EffectType, source?: string): boolean {
        const effectId = this.generateEffectId(effectType, source);
        return this.activeEffects.has(effectId);
    }

    /**
     * Get the strength of a specific effect
     * @param effectType - The type of effect
     * @param source - Optional source identifier
     * @returns The strength value, or 0 if effect not found
     */
    public getEffectStrength(effectType: EffectType, source?: string): number {
        const effectId = this.generateEffectId(effectType, source);
        const effect = this.activeEffects.get(effectId);
        return effect ? effect.strength : 0;
    }

    /**
     * Get the total strength of all effects of a specific type
     * @param effectType - The type of effect
     * @returns The total strength value
     */
    public getTotalEffectStrength(effectType: EffectType): number {
        let totalStrength = 0;
        for (const effect of this.activeEffects.values()) {
            if (effect.effectType === effectType) {
                totalStrength += effect.strength;
            }
        }
        return totalStrength;
    }

    /**
     * Get the number of stacks for a specific effect type
     * @param effectType - The type of effect
     * @returns The number of stacks
     */
    public getEffectStacks(effectType: EffectType): number {
        let stacks = 0;
        for (const effect of this.activeEffects.values()) {
            if (effect.effectType === effectType) {
                stacks++;
            }
        }
        return stacks;
    }

    /**
     * Get all active effects
     * @returns Array of active effects
     */
    public getActiveEffects(): ActiveEffect[] {
        return Array.from(this.activeEffects.values());
    }

    /**
     * Get all active effects of a specific type
     * @param effectType - The type of effect
     * @returns Array of active effects of the specified type
     */
    public getActiveEffectsOfType(effectType: EffectType): ActiveEffect[] {
        return Array.from(this.activeEffects.values()).filter(effect => effect.effectType === effectType);
    }

    /**
     * Update effects (remove expired ones)
     * @param currentTime - Current time in seconds
     * @returns Array of effects that expired
     */
    public updateEffects(currentTime: number): ActiveEffect[] {
        const expiredEffects: ActiveEffect[] = [];
        
        for (const [id, effect] of this.activeEffects) {
            if (currentTime - effect.startTime >= effect.duration) {
                expiredEffects.push(effect);
                this.activeEffects.delete(id);
            }
        }
        
        return expiredEffects;
    }

    /**
     * Get remaining duration of a specific effect
     * @param effectType - The type of effect
     * @param source - Optional source identifier
     * @param currentTime - Current time in seconds
     * @returns Remaining duration in seconds, or 0 if effect not found
     */
    public getRemainingDuration(effectType: EffectType, currentTime: number, source?: string): number {
        const effectId = this.generateEffectId(effectType, source);
        const effect = this.activeEffects.get(effectId);
        if (!effect) return 0;
        
        const elapsed = currentTime - effect.startTime;
        return Math.max(0, effect.duration - elapsed);
    }

    /**
     * Set the stacking behavior for an effect type
     * @param effectType - The type of effect
     * @param behavior - The stacking behavior
     */
    public setStackBehavior(effectType: EffectType, behavior: EffectStackBehavior): void {
        this.effectStackBehavior.set(effectType, behavior);
    }

    /**
     * Generate a unique ID for an effect
     * @param effectType - The type of effect
     * @param source - Optional source identifier
     * @returns Unique effect ID
     */
    private generateEffectId(effectType: EffectType, source?: string): string {
        return source ? `${effectType}_${source}` : effectType;
    }
}
