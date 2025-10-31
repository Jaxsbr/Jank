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

interface StunVisual {
    entity: Entity;
    originalMainColor: number;
    originalSecondaryColor: number;
    startTime: number;
    duration: number;
}

export class DamageVisualSystem implements IEventListener {
    private damageFlashes: DamageFlash[] = [];
    private effectVisuals: EffectVisual[] = [];
    private stunVisuals: StunVisual[] = [];
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
        } else if (event.eventName === EventType.StunPulseActivated) {
            this.handleStunPulseActivated(event);
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
     * Handle a stun pulse activated event
     */
    private handleStunPulseActivated(event: Event): void {
        const affectedEnemyIds = event.args['affectedEnemyIds'] as string[];
        const stunLevel = event.args['stunLevel'] as number;
        
        if (!affectedEnemyIds || !stunLevel) {
            return;
        }

        // Apply stun visual to all affected enemies
        const affectedEnemies = EntityFinder.findEntitiesByIds(this.entities, affectedEnemyIds);
        affectedEnemies.forEach(enemy => {
            this.applyStunVisual(enemy, stunLevel);
        });
    }

    /**
     * Apply stun visual to an entity
     */
    private applyStunVisual(entity: Entity, stunLevel: number): void {
        const geometryComponent = entity.getComponent(GeometryComponent);
        if (!geometryComponent) {
            return;
        }

        // Remove any existing stun visual for this entity
        this.removeStunVisual(entity);

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

        // Determine stun color based on level (from config)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const cfgLocal = this.config as import('../config/DamageVisualConfig').DamageVisualConfig;
        let stunCfg: { color: number; tintIntensity: number; duration: number };
        if (stunLevel === 1) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            stunCfg = cfgLocal.stunVisual.level1 as { color: number; tintIntensity: number; duration: number };
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            stunCfg = cfgLocal.stunVisual.level2 as { color: number; tintIntensity: number; duration: number };
        }
        const stunColor = stunCfg.color;
        const tintIntensity = stunCfg.tintIntensity;
        
        const tintedMainColor = this.tintColor(originalMainColor, stunColor, tintIntensity);
        const tintedSecondaryColor = this.tintColor(originalSecondaryColor, stunColor, tintIntensity);
        
        geometryComponent.updateMainSphereColor(tintedMainColor);
        geometryComponent.updateSecondaryColor(tintedSecondaryColor);

        // Track the stun visual
        this.stunVisuals.push({
            entity,
            originalMainColor,
            originalSecondaryColor,
            startTime: Time.now(),
            duration: stunCfg.duration
        });
    }

    /**
     * Remove stun visual from an entity
     */
    private removeStunVisual(entity: Entity): void {
        const index = this.stunVisuals.findIndex(v => v.entity === entity);
        if (index !== -1 && this.stunVisuals[index]) {
            const stunVisual = this.stunVisuals[index];
            const geometryComponent = entity.getComponent(GeometryComponent);
            if (geometryComponent && stunVisual) {
                geometryComponent.updateMainSphereColor(stunVisual.originalMainColor);
                geometryComponent.updateSecondaryColor(stunVisual.originalSecondaryColor);
            }
            this.stunVisuals.splice(index, 1);
        }
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
        const tintedMainColor = this.tintColor(originalMainColor, effectColor, this.config.effectTintIntensity);
        const tintedSecondaryColor = this.tintColor(originalSecondaryColor, effectColor, this.config.effectTintIntensity);
        
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const cfgLocal = this.config as import('../config/DamageVisualConfig').DamageVisualConfig;
        switch (effectType) {
            case EffectType.ATTACK:
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
                return cfgLocal.effectColors.ATTACK;
            case EffectType.BUFF:
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
                return cfgLocal.effectColors.BUFF;
            case EffectType.HEAL:
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
                return cfgLocal.effectColors.HEAL;
            case EffectType.SHIELD:
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
                return cfgLocal.effectColors.SHIELD;
            case EffectType.SPEED:
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
                return cfgLocal.effectColors.SPEED;
            default:
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
                return cfgLocal.effectColors.DEFAULT;
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

        // Process stun visuals (remove expired ones)
        for (let i = this.stunVisuals.length - 1; i >= 0; i--) {
            const stunVisual = this.stunVisuals[i];
            
            if (!stunVisual) {
                continue;
            }
            
            if (currentTime - stunVisual.startTime >= stunVisual.duration) {
                // Restore original colors
                const geometryComponent = stunVisual.entity.getComponent(GeometryComponent);
                if (geometryComponent) {
                    geometryComponent.updateMainSphereColor(stunVisual.originalMainColor);
                    geometryComponent.updateSecondaryColor(stunVisual.originalSecondaryColor);
                }
                
                // Remove from array
                this.stunVisuals.splice(i, 1);
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