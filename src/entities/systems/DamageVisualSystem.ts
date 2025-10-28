import { Entity } from '../../ecs/Entity';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { Time } from '../../utils/Time';
import { EffectType } from '../EffectType';
import { GeometryComponent } from '../components/GeometryComponent';
import { TeamComponent } from '../components/TeamComponent';
import { DamageVisualConfig, defaultDamageVisualConfig } from '../config/DamageVisualConfig';

interface DamageFlash {
    entity: Entity;
    originalMainColor: number;
    originalSecondaryColor: number;
    endTime: number;
}

interface EffectVisual {
    entity: Entity;
    effectType: EffectType;
    originalMainColor: number;
    originalSecondaryColor: number;
    effectColor: number;
    startTime: number;
    duration: number;
}

export class DamageVisualSystem implements IEventListener {
    private damageFlashes: DamageFlash[] = [];
    private effectVisuals: EffectVisual[] = [];
    private config: DamageVisualConfig;
    private eventDispatcher: EventDispatcherSingleton;
    private entities: readonly Entity[] = [];

    constructor(eventDispatcher: EventDispatcherSingleton, config: DamageVisualConfig = defaultDamageVisualConfig) {
        this.eventDispatcher = eventDispatcher;
        this.config = config;
        // Register as event listener for damage events
        this.eventDispatcher.registerListener('DamageVisualSystem', this);
    }

    /**
     * Set the entities array reference for entity lookup
     */
    public setEntities(entities: readonly Entity[]): void {
        this.entities = entities;
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.DamageTaken) {
            this.handleDamageTaken(event);
        } else if (event.eventName === EventType.EffectApplied) {
            this.handleEffectApplied(event);
        } else if (event.eventName === EventType.EffectRemoved) {
            this.handleEffectRemoved(event);
        } else if (event.eventName === EventType.EffectExpired) {
            this.handleEffectExpired(event);
        }
    }

    /**
     * Handle a damage taken event
     */
    private handleDamageTaken(event: Event): void {
        const targetId = event.args['targetId'] as string;
        if (!targetId) {
            return;
        }

        // Find the entity by ID
        const targetEntity = EntityFinder.findEntityById(this.entities, targetId);
        if (!targetEntity) {
            return;
        }

        this.flashEntity(targetEntity);
    }

    /**
     * Handle an effect applied event
     */
    private handleEffectApplied(event: Event): void {
        const entity = event.args['entity'] as Entity;
        const effectType = event.args['effectType'] as EffectType;
        const effectDuration = event.args['effectDuration'] as number;
        
        if (!entity || !effectType) {
            return;
        }

        this.applyEffectVisual(entity, effectType, effectDuration);
    }

    /**
     * Handle an effect removed event
     */
    private handleEffectRemoved(event: Event): void {
        const entity = event.args['entity'] as Entity;
        const effectType = event.args['effectType'] as EffectType;
        
        if (!entity || !effectType) {
            return;
        }

        this.removeEffectVisual(entity, effectType);
    }

    /**
     * Handle an effect expired event
     */
    private handleEffectExpired(event: Event): void {
        const entity = event.args['entity'] as Entity;
        const effectType = event.args['effectType'] as EffectType;
        
        if (!entity || !effectType) {
            return;
        }

        this.removeEffectVisual(entity, effectType);
    }

    /**
     * Flash an entity red to indicate damage
     */
    private flashEntity(entity: Entity): void {
        const geometryComponent = entity.getComponent(GeometryComponent);
        if (!geometryComponent) {
            return;
        }

        // Determine original colors based on team type
        const teamComponent = entity.getComponent(TeamComponent);
        let originalMainColor: number;
        let originalSecondaryColor: number;
        let flashMainColor: number;
        let flashSecondaryColor: number;
        
        if (teamComponent && teamComponent.isEnemy()) {
            // Enemy entity: use enemy colors from config
            originalMainColor = this.config.teamColors.enemy.original.main;
            originalSecondaryColor = this.config.teamColors.enemy.original.secondary;
            flashMainColor = this.config.teamColors.enemy.flash.main;
            flashSecondaryColor = this.config.teamColors.enemy.flash.secondary;
        } else {
            // Core entity: use core colors from config
            originalMainColor = this.config.teamColors.core.original.main;
            originalSecondaryColor = this.config.teamColors.core.original.secondary;
            flashMainColor = this.config.teamColors.core.flash.main;
            flashSecondaryColor = this.config.teamColors.core.flash.secondary;
        }
        
        // Set flash colors
        geometryComponent.updateMainSphereColor(flashMainColor);
        geometryComponent.updateSecondaryColor(flashSecondaryColor);

        // Schedule color restoration
        const endTime = Time.now() + this.config.flashDuration;
        this.damageFlashes.push({
            entity,
            originalMainColor,
            originalSecondaryColor,
            endTime
        });
    }

    /**
     * Apply visual effect to an entity
     */
    private applyEffectVisual(entity: Entity, effectType: EffectType, duration: number): void {
        const geometryComponent = entity.getComponent(GeometryComponent);
        if (!geometryComponent) {
            return;
        }

        // Remove any existing effect visual for this entity and effect type
        this.removeEffectVisual(entity, effectType);

        // Get original colors
        const teamComponent = entity.getComponent(TeamComponent);
        let originalMainColor: number;
        let originalSecondaryColor: number;
        
        if (teamComponent && teamComponent.isEnemy()) {
            originalMainColor = this.config.teamColors.enemy.original.main;
            originalSecondaryColor = this.config.teamColors.enemy.original.secondary;
        } else {
            originalMainColor = this.config.teamColors.core.original.main;
            originalSecondaryColor = this.config.teamColors.core.original.secondary;
        }

        // Get effect color
        const effectColor = this.getEffectColor(effectType);
        
        // Apply effect color (tint the entity)
        const tintedMainColor = this.tintColor(originalMainColor, effectColor, 0.3);
        const tintedSecondaryColor = this.tintColor(originalSecondaryColor, effectColor, 0.3);
        
        geometryComponent.updateMainSphereColor(tintedMainColor);
        geometryComponent.updateSecondaryColor(tintedSecondaryColor);

        // Track the effect visual
        this.effectVisuals.push({
            entity,
            effectType,
            originalMainColor,
            originalSecondaryColor,
            effectColor,
            startTime: Time.now(),
            duration
        });
    }

    /**
     * Remove visual effect from an entity
     */
    private removeEffectVisual(entity: Entity, effectType: EffectType): void {
        // Find and remove the effect visual
        for (let i = this.effectVisuals.length - 1; i >= 0; i--) {
            const effectVisual = this.effectVisuals[i];
            if (effectVisual && effectVisual.entity === entity && effectVisual.effectType === effectType) {
                // Restore original colors
                const geometryComponent = entity.getComponent(GeometryComponent);
                if (geometryComponent) {
                    geometryComponent.updateMainSphereColor(effectVisual.originalMainColor);
                    geometryComponent.updateSecondaryColor(effectVisual.originalSecondaryColor);
                }
                
                // Remove from array
                this.effectVisuals.splice(i, 1);
                break;
            }
        }
    }

    /**
     * Get color for effect type
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
     * Tint a color with another color
     */
    private tintColor(baseColor: number, tintColor: number, intensity: number): number {
        const r1 = (baseColor >> 16) & 0xff;
        const g1 = (baseColor >> 8) & 0xff;
        const b1 = baseColor & 0xff;
        
        const r2 = (tintColor >> 16) & 0xff;
        const g2 = (tintColor >> 8) & 0xff;
        const b2 = tintColor & 0xff;
        
        const r = Math.round(r1 + (r2 - r1) * intensity);
        const g = Math.round(g1 + (g2 - g1) * intensity);
        const b = Math.round(b1 + (b2 - b1) * intensity);
        
        return (r << 16) | (g << 8) | b;
    }

    /**
     * Update visual effects (should be called every frame)
     */
    public update(): void {
        const currentTime = Time.now();
        
        // Process damage flashes
        for (let i = this.damageFlashes.length - 1; i >= 0; i--) {
            const flash = this.damageFlashes[i];
            
            if (!flash) {
                continue;
            }
            
            if (currentTime >= flash.endTime) {
                // Restore original colors
                const geometryComponent = flash.entity.getComponent(GeometryComponent);
                if (geometryComponent) {
                    geometryComponent.updateMainSphereColor(flash.originalMainColor);
                    geometryComponent.updateSecondaryColor(flash.originalSecondaryColor);
                }
                
                // Remove from array
                this.damageFlashes.splice(i, 1);
            }
        }

        // Process effect visuals (remove expired ones)
        for (let i = this.effectVisuals.length - 1; i >= 0; i--) {
            const effectVisual = this.effectVisuals[i];
            
            if (!effectVisual) {
                continue;
            }
            
            if (currentTime - effectVisual.startTime >= effectVisual.duration) {
                // Restore original colors
                const geometryComponent = effectVisual.entity.getComponent(GeometryComponent);
                if (geometryComponent) {
                    geometryComponent.updateMainSphereColor(effectVisual.originalMainColor);
                    geometryComponent.updateSecondaryColor(effectVisual.originalSecondaryColor);
                }
                
                // Remove from array
                this.effectVisuals.splice(i, 1);
            }
        }
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        this.eventDispatcher.deregisterListener('DamageVisualSystem');
    }
}