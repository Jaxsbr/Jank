import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { Time } from '../../utils/Time';
import { EffectType } from '../EffectType';
import { ActiveEffect, EffectComponent } from '../components/EffectComponent';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TeamComponent } from '../components/TeamComponent';

/**
 * System that updates active effects on entities each frame
 */
export class EffectTickSystem implements IEntitySystem {
    private eventDispatcher: EventDispatcherSingleton;
    private tickInterval: number; // How often to apply tick effects (in seconds)
    private lastTickTime: number;

    constructor(eventDispatcher: EventDispatcherSingleton, tickInterval: number = 1.0) {
        this.eventDispatcher = eventDispatcher;
        this.tickInterval = tickInterval;
        this.lastTickTime = 0;
    }

    update(entities: readonly Entity[]): void {
        const currentTime = Time.now();
        
        // Check if it's time for a tick
        if (currentTime - this.lastTickTime >= this.tickInterval) {
            this.processEffectTicks(entities, currentTime);
            this.lastTickTime = currentTime;
        }

        // Always update effect durations and remove expired effects
        this.updateEffectDurations(entities, currentTime);
    }

    /**
     * Process effect ticks for all entities with effects
     * @param entities - All entities to check
     * @param currentTime - Current time in seconds
     */
    private processEffectTicks(entities: readonly Entity[], currentTime: number): void {
        EntityQuery.from(entities)
            .withComponents(EffectComponent)
            .execute()
            .forEach(({ entity, components }) => {
                const [effectComponent] = components;
                this.processEntityEffectTicks(entity, effectComponent, currentTime);
            });
    }

    /**
     * Process effect ticks for a single entity
     * @param entity - The entity to process
     * @param effectComponent - The entity's effect component
     * @param currentTime - Current time in seconds
     */
    private processEntityEffectTicks(entity: Entity, effectComponent: EffectComponent, currentTime: number): void {
        const activeEffects = effectComponent.getActiveEffects();
        
        for (const effect of activeEffects) {
            this.processEffectTick(entity, effect, currentTime);
        }
    }

    /**
     * Process a single effect tick
     * @param entity - The entity with the effect
     * @param effect - The active effect
     * @param currentTime - Current time in seconds
     */
    private processEffectTick(entity: Entity, effect: ActiveEffect, currentTime: number): void {
        switch (effect.effectType) {
            case EffectType.ATTACK:
                this.processAttackTick(entity, effect, currentTime);
                break;
            case EffectType.HEAL:
                this.processHealTick(entity, effect, currentTime);
                break;
            case EffectType.BUFF:
            case EffectType.SHIELD:
            case EffectType.SPEED:
                // These effects are passive and don't need ticks
                break;
        }
    }

    /**
     * Process attack effect tick (damage over time)
     * @param entity - The entity taking damage
     * @param effect - The attack effect
     * @param currentTime - Current time in seconds
     */
    private processAttackTick(entity: Entity, effect: ActiveEffect, currentTime: number): void {
        const healthComponent = entity.getComponent(HealthComponent);
        if (!healthComponent || !healthComponent.isAlive()) {
            return;
        }

        // Apply damage
        healthComponent.removeHP(effect.strength);

        // Capture position for VFX
        const position = new THREE.Vector3();
        const posComp = entity.getComponent(PositionComponent);
        if (posComp) {
            const p = posComp.getPosition();
            position.set(p.x, p.y, p.z);
        } else {
            const geom = entity.getComponent(GeometryComponent);
            if (geom) {
                geom.getGeometryGroup().getWorldPosition(position);
            }
        }

        // Dispatch damage taken event
        this.eventDispatcher.dispatch(new Event(EventType.DamageTaken, {
            entity: entity,
            entityId: entity.getId(),
            position,
            damage: effect.strength,
            damageType: 'effect',
            effectType: effect.effectType,
            effectSource: effect.source ?? 'unknown',
            damageTime: currentTime
        }));

        // Check if entity died
        if (!healthComponent.isAlive()) {
            const position = new THREE.Vector3();
            const posComp = entity.getComponent(PositionComponent);
            if (posComp) {
                const p = posComp.getPosition();
                position.set(p.x, p.y, p.z);
            } else {
                const geom = entity.getComponent(GeometryComponent);
                if (geom) {
                    geom.getGeometryGroup().getWorldPosition(position);
                }
            }

            // Capture team information before entity is destroyed
            const teamComponent = entity.getComponent(TeamComponent);
            const isCore = teamComponent?.isCore() ?? false;
            const isEnemy = teamComponent?.isEnemy() ?? false;

            this.eventDispatcher.dispatch(new Event(EventType.EntityDeath, {
                entity: entity,
                entityId: entity.getId(),
                position,
                deathTime: currentTime,
                deathCause: 'effect',
                effectType: effect.effectType,
                effectSource: effect.source ?? 'unknown',
                isCore,
                isEnemy
            }));
        }
    }

    /**
     * Process heal effect tick (healing over time)
     * @param entity - The entity being healed
     * @param effect - The heal effect
     * @param currentTime - Current time in seconds
     */
    private processHealTick(entity: Entity, effect: ActiveEffect, currentTime: number): void {
        const healthComponent = entity.getComponent(HealthComponent);
        if (!healthComponent || !healthComponent.isAlive()) {
            return;
        }

        // Apply healing
        healthComponent.addHP(effect.strength);

        // Dispatch heal event (could be useful for visual feedback)
        this.eventDispatcher.dispatch(new Event(EventType.EffectTick, {
            entity: entity,
            entityId: entity.getId(),
            effectType: effect.effectType,
            effectStrength: effect.strength,
            effectSource: effect.source ?? 'unknown',
            tickTime: currentTime
        }));
    }

    /**
     * Update effect durations and remove expired effects
     * @param entities - All entities to check
     * @param currentTime - Current time in seconds
     */
    private updateEffectDurations(entities: readonly Entity[], currentTime: number): void {
        EntityQuery.from(entities)
            .withComponents(EffectComponent)
            .execute()
            .forEach(({ entity, components }) => {
                const [effectComponent] = components;
                const expiredEffects = effectComponent.updateEffects(currentTime);
                
                // Dispatch events for expired effects
                for (const expiredEffect of expiredEffects) {
                    this.eventDispatcher.dispatch(new Event(EventType.EffectExpired, {
                        entity: entity,
                        entityId: entity.getId(),
                        effectType: expiredEffect.effectType,
                        effectSource: expiredEffect.source ?? 'unknown',
                        expirationTime: currentTime
                    }));
                }
            });
    }

    /**
     * Set the tick interval
     * @param interval - New tick interval in seconds
     */
    public setTickInterval(interval: number): void {
        this.tickInterval = Math.max(0.1, interval); // Minimum 0.1 seconds
    }

    /**
     * Get the current tick interval
     * @returns The tick interval in seconds
     */
    public getTickInterval(): number {
        return this.tickInterval;
    }
}
