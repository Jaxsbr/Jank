import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { Time } from '../../utils/Time';
import { EffectType } from '../EffectType';
import { TileEffectType } from '../TileEffectType';
import { TileComponent } from '../components/TileComponent';
import { TileEffectComponent } from '../components/TileEffectComponent';
import { TileTriggerComponent, TileTriggerType } from '../components/TileTriggerComponent';
import { TileVisualComponent } from '../components/TileVisualComponent';

export class TileEffectSystem implements IEntitySystem, IEventListener {
    private effectRadius: number;
    private effectCooldown: number;
    private tileEntities: readonly Entity[] = [];
    private eventDispatcher: EventDispatcherSingleton;

    constructor(eventDispatcher: EventDispatcherSingleton, effectRadius: number = 2.0, effectCooldown: number = 1.0) {
        this.eventDispatcher = eventDispatcher;
        this.effectRadius = effectRadius;
        this.effectCooldown = effectCooldown;
        
        // Register as event listener
        this.eventDispatcher.registerListener('TileEffectSystem', this);
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.EntityEnteredTileRange) {
            const tile = event.args['tile'] as Entity;
            const currentTime = Time.now();
            
            if (tile) {
                this.handleProximityTrigger(tile, currentTime);
            }
        } else if (event.eventName === EventType.TileEffectDeactivated) {
            const tile = event.args['tile'] as Entity;
            const reason = event.args['reason'] as string;
            
            if (tile && reason === 'no_enemies_in_range') {
                this.handleProximityDeactivation(tile);
            }
        }
    }

    update(entities: readonly Entity[]): void {
        this.tileEntities = entities;
        const currentTime = Time.now(); // Time is now in seconds

        EntityQuery.from(entities)
            .withComponents(TileComponent, TileEffectComponent)
            .execute()
            .forEach(({ entity, components }) => {
                const [, effectComponent] = components;
                const triggerComponent = entity.getComponent(TileTriggerComponent);
                const visualComponent = entity.getComponent(TileVisualComponent);
                
                // Check if effect was active before update
                const wasActive = effectComponent.getIsActive();
                
                // Update effect state (but skip duration check for proximity triggers)
                if (!triggerComponent || triggerComponent.getTriggerType() !== TileTriggerType.PROXIMITY) {
                    effectComponent.update(currentTime);
                }
                
                // Check if effect just deactivated
                if (wasActive && !effectComponent.getIsActive()) {
                    this.eventDispatcher.dispatch(new Event(EventType.TileEffectDeactivated, {
                        tile: entity,
                        tileId: entity.getId(),
                        effectType: effectComponent.getEffectType(),
                        deactivationTime: currentTime
                    }));
                }
                
                // Update visual effects based on effect type
                this.updateVisualEffects(visualComponent, effectComponent, currentTime, entity);
                
                // Handle automatic activation based on trigger type
                this.handleAutomaticActivation(entity, triggerComponent, effectComponent, currentTime);
            });
    }

    /**
     * Update visual effects based on tile effect type
     */
    private updateVisualEffects(
        visualComponent: TileVisualComponent | null, 
        effectComponent: TileEffectComponent, 
        currentTime: number,
        entity: Entity
    ): void {
        if (!visualComponent) return;

        const tileEffectType = effectComponent.getTileEffectType();
        const effectType = effectComponent.getEffectType();
        let isActive = effectComponent.getIsActive();
        const isFadingOut = effectComponent.getIsFadingOut();
        
        
        // Get base effect color based on effect type
        const effectColor = this.getEffectColor(effectType);
        
        // Override effect duration is alwaysOn
        const pulseEffectConfig = effectComponent.getPulseEffectConfig()
        if (pulseEffectConfig && pulseEffectConfig.alwaysOn) {
            isActive = true
        }
        
        // Handle fade out completion
        if (isFadingOut) {
            const fadeOutProgress = effectComponent.getFadeOutProgress(currentTime, 1.0); // 1 second fade out
            if (fadeOutProgress >= 1.0) {
                effectComponent.completeFadeOut();
                isActive = false;
            }
        }

        // Update emissive color based on tile effect type
        if (isActive || isFadingOut) {
            switch (tileEffectType) {
                case TileEffectType.PULSE:
                    this.renderPulseEffect(visualComponent, effectComponent, currentTime, effectColor);
                    break;
                case TileEffectType.STATIC:
                    this.renderStaticEffect(visualComponent, effectComponent, currentTime, effectColor, entity);
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
        fallbackColor: number,
        entity?: Entity
    ): void {
        const config = effectComponent.getStaticEffectConfig();
        if (!config) {
            console.log('Static effect: No config, using fallback color');
            visualComponent.setEmissive(fallbackColor, 0.5);
            return;
        }
        
        const timeSinceActivation = effectComponent.getTimeSinceLastActivation(currentTime);
        const duration = effectComponent.getDuration();
        const remainingTime = duration - timeSinceActivation;
        
        // Check if this is a proximity trigger (should stay active indefinitely)
        const triggerComponent = entity?.getComponent(TileTriggerComponent);
        const isProximityTrigger = triggerComponent?.getTriggerType() === TileTriggerType.PROXIMITY;
        
        
        let intensity = config.staticGlowIntensity;
        
        if (isProximityTrigger) {
            // For proximity triggers, only do fade in, then hold at full intensity
            if (timeSinceActivation < config.fadeInDuration) {
                intensity = config.staticGlowIntensity * (timeSinceActivation / config.fadeInDuration);
            } else {
                // Check if we're fading out
                const isFadingOut = effectComponent.getIsFadingOut();
                if (isFadingOut) {
                    const fadeOutProgress = effectComponent.getFadeOutProgress(currentTime, 1.0); // 1 second fade out
                    intensity = config.staticGlowIntensity * (1 - fadeOutProgress);
                }
            }
        } else {
            // For timed effects (AUTO triggers), use normal fade in/out
            // Fade in
            if (timeSinceActivation < config.fadeInDuration) {
                intensity = config.staticGlowIntensity * (timeSinceActivation / config.fadeInDuration);
            }
            // Fade out (if within fadeOutDuration of end)
            else if (remainingTime < config.fadeOutDuration) {
                intensity = config.staticGlowIntensity * (remainingTime / config.fadeOutDuration);
            }
            // Hold at full intensity (default)
        }
        
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
     * Handle proximity-based trigger activation
     */
    private handleProximityTrigger(tile: Entity, currentTime: number): void {
        const triggerComponent = tile.getComponent(TileTriggerComponent);
        const effectComponent = tile.getComponent(TileEffectComponent);
        
        if (triggerComponent && effectComponent && 
            triggerComponent.getTriggerType() === TileTriggerType.PROXIMITY) {
            // For proximity triggers, force activation without cooldown check
            if (!effectComponent.getIsActive()) {
                effectComponent.forceActivate(currentTime);
            } else {
                // If already active, just update the activation time to prevent auto-deactivation
                effectComponent.setLastActivation(currentTime);
            }
        }
    }

    /**
     * Handle proximity-based deactivation when all enemies leave range
     */
    private handleProximityDeactivation(tile: Entity): void {
        const triggerComponent = tile.getComponent(TileTriggerComponent);
        const effectComponent = tile.getComponent(TileEffectComponent);
        
        if (triggerComponent && effectComponent && 
            triggerComponent.getTriggerType() === TileTriggerType.PROXIMITY) {
            // Start smooth fade out instead of immediate deactivation
            const currentTime = Time.now();
            effectComponent.startFadeOut(currentTime);
        }
    }

    /**
     * Handle automatic activation based on trigger type
     */
    private handleAutomaticActivation(
        entity: Entity,
        triggerComponent: TileTriggerComponent | null,
        effectComponent: TileEffectComponent,
        currentTime: number
    ): void {
        if (!triggerComponent) return;

        switch (triggerComponent.getTriggerType()) {
            case TileTriggerType.AUTO:
                if (triggerComponent.canAutoActivate(currentTime) && 
                    effectComponent.canActivate(currentTime)) {
                    this.activateTileEffect(entity, currentTime);
                    triggerComponent.markAutoActivated(currentTime);
                }
                break;
            case TileTriggerType.ALWAYS_ON:
                // Always-on effects are handled in updateVisualEffects
                // No need to activate/deactivate them
                break;
            case TileTriggerType.PROXIMITY:
                // Proximity triggers are handled via events
                break;
            case TileTriggerType.MANUAL:
                // Manual triggers are not implemented yet
                break;
        }
    }

    /**
     * Activate a tile effect
     */
    public activateTileEffect(entity: Entity, currentTime: number): boolean {
        const effectComponent = entity.getComponent(TileEffectComponent);
        if (effectComponent && effectComponent.activate(currentTime)) {
            // Dispatch TileEffectActivated event
            this.eventDispatcher.dispatch(new Event(EventType.TileEffectActivated, {
                tile: entity,
                tileId: entity.getId(),
                effectType: effectComponent.getEffectType(),
                activationTime: currentTime
            }));
            return true;
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
