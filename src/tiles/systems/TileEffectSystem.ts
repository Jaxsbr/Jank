import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EffectType } from '../EffectType';
import { TileEffectType } from '../TileEffectType';
import { TileComponent } from '../components/TileComponent';
import { TileEffectComponent } from '../components/TileEffectComponent';
import { TileVisualComponent } from '../components/TileVisualComponent';

export class TileEffectSystem implements IEntitySystem, IEventListener {
    private effectRadius: number;
    private effectCooldown: number;
    private tileEntities: readonly Entity[] = [];

    constructor(effectRadius: number = 2.0, effectCooldown: number = 1.0) {
        this.effectRadius = effectRadius;
        this.effectCooldown = effectCooldown;
        
        // Register as event listener
        GlobalEventDispatcher.registerListener('TileEffectSystem', this);
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.TileEffectTrigger) {
            const entityIndex = event.args['entityIndex'] as number;
            const currentTime = event.args['currentTime'] as number;
            
            // Get all tiles with effects to match the indexing from main.ts
            const tilesWithEffects = this.tileEntities.filter(tile => 
                tile.hasComponent(TileEffectComponent)
            );
            
            if (typeof entityIndex === 'number' && typeof currentTime === 'number' && entityIndex >= 0 && entityIndex < tilesWithEffects.length) {
                const entity = tilesWithEffects[entityIndex];
                if (entity) {
                    this.activateTileEffect(entity, currentTime);
                }
            }
        }
    }

    update(entities: readonly Entity[]): void {
        this.tileEntities = entities;
        const currentTime = performance.now() / 1000; // Convert to seconds

        entities.forEach(entity => {
            if (entity.hasComponent(TileComponent) && entity.hasComponent(TileEffectComponent)) {
                const tileComponent = entity.getComponent(TileComponent);
                const effectComponent = entity.getComponent(TileEffectComponent);
                const visualComponent = entity.getComponent(TileVisualComponent);
                
                if (tileComponent && effectComponent) {
                    // Update effect state
                    effectComponent.update(currentTime);
                    
                    // Update visual effects based on effect type
                    this.updateVisualEffects(visualComponent, effectComponent, currentTime);
                    
                    // Process effect activation
                    this.processEffectActivation(tileComponent, effectComponent, currentTime);
                }
            }
        });
    }

    /**
     * Update visual effects based on tile effect type
     */
    private updateVisualEffects(
        visualComponent: TileVisualComponent | null, 
        effectComponent: TileEffectComponent, 
        currentTime: number
    ): void {
        if (!visualComponent) return;

        const tileEffectType = effectComponent.getTileEffectType();
        const effectType = effectComponent.getEffectType();
        const isActive = effectComponent.getIsActive();
        
        // Get base effect color based on effect type
        const effectColor = this.getEffectColor(effectType);
        
        // Update emissive color based on tile effect type
        if (isActive) {
            switch (tileEffectType) {
                case TileEffectType.PULSE:
                    this.renderPulseEffect(visualComponent, effectComponent, currentTime, effectColor);
                    break;
                case TileEffectType.STATIC:
                    this.renderStaticEffect(visualComponent, effectComponent, currentTime, effectColor);
                    break;
                case TileEffectType.COLOR_TRANSITION:
                    this.renderColorTransitionEffect(visualComponent, effectComponent, currentTime, effectColor);
                    break;
            }
        } else {
            // Effect is inactive - don't render anything
            visualComponent.setEmissive(0x000000, 0);
        }
    }

    /**
     * Render pulse effect with fade in/out
     */
    private renderPulseEffect(
        visualComponent: TileVisualComponent, 
        effectComponent: TileEffectComponent, 
        currentTime: number,
        fallbackColor: number
    ): void {
        const config = effectComponent.getPulseEffectConfig();
        if (!config) {
            visualComponent.setEmissive(fallbackColor, 0.5);
            return;
        }
        
        const timeSinceActivation = effectComponent.getTimeSinceLastActivation(currentTime);
        const pulseCycleTime = config.pulseDuration / config.pulseFrequency;
        const cycleProgress = (timeSinceActivation % pulseCycleTime) / pulseCycleTime;
        
        // Fade in for first half, fade out for second half
        let intensity: number;
        if (cycleProgress < 0.5) {
            // Fade in: 0 to maxIntensity
            intensity = config.maxIntensity * (cycleProgress * 2);
        } else {
            // Fade out: maxIntensity to 0
            intensity = config.maxIntensity * (1 - (cycleProgress - 0.5) * 2);
        }
        
        visualComponent.setEmissive(config.color, intensity);
    }

    /**
     * Render static effect with fade in/out
     */
    private renderStaticEffect(
        visualComponent: TileVisualComponent, 
        effectComponent: TileEffectComponent, 
        currentTime: number,
        fallbackColor: number
    ): void {
        const config = effectComponent.getStaticEffectConfig();
        if (!config) {
            visualComponent.setEmissive(fallbackColor, 0.5);
            return;
        }
        
        const timeSinceActivation = effectComponent.getTimeSinceLastActivation(currentTime);
        const duration = effectComponent.getDuration();
        const remainingTime = duration - timeSinceActivation;
        
        let intensity = config.staticGlowIntensity;
        
        // Fade in
        if (timeSinceActivation < config.fadeInDuration) {
            intensity = config.staticGlowIntensity * (timeSinceActivation / config.fadeInDuration);
        }
        // Fade out (if within fadeOutDuration of end)
        else if (remainingTime < config.fadeOutDuration) {
            intensity = config.staticGlowIntensity * (remainingTime / config.fadeOutDuration);
        }
        // Hold at full intensity (default)
        
        visualComponent.setEmissive(config.color, intensity);
    }

    /**
     * Render color transition effect that cycles between two colors
     */
    private renderColorTransitionEffect(
        visualComponent: TileVisualComponent, 
        effectComponent: TileEffectComponent, 
        currentTime: number,
        fallbackColor: number
    ): void {
        const config = effectComponent.getColorTransitionEffectConfig();
        if (!config) {
            console.warn('Color transition: No config');
            visualComponent.setEmissive(fallbackColor, 0.5);
            return;
        }
        
        const timeSinceActivation = effectComponent.getTimeSinceLastActivation(currentTime);
        
        // Calculate progress for back-and-forth transition
        const transitionTime = config.transitionDuration * 2; // Full cycle
        const cycleProgress = (timeSinceActivation % transitionTime) / transitionTime;
        
        let currentColor: number;
        if (cycleProgress < 0.5) {
            // Transition from color1 to color2
            const t = cycleProgress * 2;
            currentColor = this.lerpColor(config.color1, config.color2, t);
        } else {
            // Transition from color2 to color1
            const t = (cycleProgress - 0.5) * 2;
            currentColor = this.lerpColor(config.color2, config.color1, t);
        }
        
        visualComponent.setEmissive(currentColor, config.intensity);
    }

    /**
     * Get effect color based on effect type
     */
    private getEffectColor(effectType: EffectType): number {
        switch (effectType) {
            case EffectType.ATTACK:
                return 0xff4444; // Red
            case EffectType.BUFF:
                return 0x44ff44; // Green
            case EffectType.HEAL:
                return 0x4444ff; // Blue
            case EffectType.SHIELD:
                return 0xffff44; // Yellow
            case EffectType.SPEED:
                return 0xff44ff; // Magenta
            default:
                return 0xffffff; // White
        }
    }

    /**
     * Linear interpolation between two colors
     */
    private lerpColor(color1: number, color2: number, t: number): number {
        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;
        
        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;
        
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        
        return (r << 16) | (g << 8) | b;
    }

    /**
     * Process effect activation logic
     */
    private processEffectActivation(
        tileComponent: TileComponent, 
        effectComponent: TileEffectComponent, 
        currentTime: number
    ): void {
        // TODO: Implement effect activation logic
        // This would handle:
        // - Triggering effects on nearby entities
        // - Managing effect cooldowns
        // - Spawning projectiles for attack effects
        // - Applying buffs to player
        // - Healing player for heal effects
        
        // For now, just check if effect can be activated
        if (effectComponent.canActivate(currentTime)) {
            // Effect is ready to be activated
            // In a real implementation, this would be triggered by player actions
            // or automatic activation based on game rules
        }
    }

    /**
     * Activate a tile effect
     */
    public activateTileEffect(entity: Entity, currentTime: number): boolean {
        const effectComponent = entity.getComponent(TileEffectComponent);
        if (effectComponent) {
            return effectComponent.activate(currentTime);
        }
        return false;
    }

    /**
     * Get all active effects in a radius
     */
    public getActiveEffectsInRadius(centerEntity: Entity, radius: number): Entity[] {
        // TODO: Implement spatial query to get tiles in radius
        // This would use the TileGrid to find nearby tiles with active effects
        void centerEntity; // Suppress unused parameter warning
        void radius; // Suppress unused parameter warning
        return [];
    }

    /**
     * Set effect radius
     */
    public setEffectRadius(radius: number): void {
        this.effectRadius = Math.max(0, radius);
    }

    /**
     * Set effect cooldown
     */
    public setEffectCooldown(cooldown: number): void {
        this.effectCooldown = Math.max(0, cooldown);
    }

    /**
     * Get effect radius
     */
    public getEffectRadius(): number {
        return this.effectRadius;
    }

    /**
     * Get effect cooldown
     */
    public getEffectCooldown(): number {
        return this.effectCooldown;
    }
}
