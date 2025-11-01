import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { Event } from '../../systems/eventing/Event';
import { EventArgValue } from '../../systems/eventing/EventArgValue';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { EffectType } from '../EffectType';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TeamComponent } from '../components/TeamComponent';

/**
 * System responsible for applying damage and detecting entity death.
 * Focuses solely on damage application and death detection - does not handle cleanup.
 */
export class CombatSystem implements IEventListener {
    private eventDispatcher: EventDispatcherSingleton;
    private entities: readonly Entity[] = [];
    private reportedEnemyKills: Set<string> = new Set();

    constructor(eventDispatcher: EventDispatcherSingleton) {
        this.eventDispatcher = eventDispatcher;
        // Register as event listener for combat events
        this.eventDispatcher.registerListener('CombatSystem', this);
    }

    /**
     * Set the entities array reference for damage application
     */
    public setEntities(entities: readonly Entity[]): void {
        this.entities = entities;
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.AttackExecuted) {
            this.handleAttackExecuted(event);
        }
    }

    /**
     * Handle an attack executed event
     * Applies damage to the target and checks for death
     */
    private handleAttackExecuted(event: Event): void {
        const attackerId = event.args['attackerId'] as string;
        const targetId = event.args['targetId'] as string;
        const damage = event.args['damage'] as number;

        if (!attackerId || !targetId || typeof damage !== 'number') {
            return;
        }

        // Find the target entity
        const targetEntity = EntityFinder.findEntityById(this.entities, targetId);
        if (!targetEntity) {
            return;
        }

        // Apply damage to target
        const healthComponent = targetEntity.getComponent(HealthComponent);
        if (!healthComponent) {
            return;
        }

        // Apply damage
        healthComponent.removeHP(damage);

        // Capture target position for hit VFX
        const hitPosition = new THREE.Vector3();
        const posComp = targetEntity.getComponent(PositionComponent);
        if (posComp) {
            const p = posComp.getPosition();
            hitPosition.set(p.x, p.y, p.z);
        } else {
            const geom = targetEntity.getComponent(GeometryComponent);
            if (geom) {
                geom.getGeometryGroup().getWorldPosition(hitPosition);
            }
        }

        // Extract additional damage metadata from AttackExecuted event if available
        const isCritical = event.args['isCritical'] as boolean | undefined;
        const effectType = event.args['effectType'] as EffectType | undefined;

        // Build event args, conditionally including effectType
        const eventArgs: Record<string, EventArgValue> = {
            targetId: targetId,
            damage: damage,
            newHP: healthComponent.getHP(),
            position: hitPosition,
            isCritical: isCritical ?? false
        };
        
        if (effectType) {
            eventArgs['effectType'] = effectType;
        }

        // Dispatch damage taken event for visual feedback
        const damageEvent = new Event(EventType.DamageTaken, eventArgs);
        this.eventDispatcher.dispatch(damageEvent);

        // Check if target is dead
        if (!healthComponent.isAlive()) {
            const team = targetEntity.getComponent(TeamComponent);
            if (team && team.isEnemy() && !this.reportedEnemyKills.has(targetId)) {
                this.reportedEnemyKills.add(targetId);
                const enemyKilledEvent = new Event(EventType.EnemyKilled, {
                    entityId: targetId,
                });
                this.eventDispatcher.dispatch(enemyKilledEvent);
            }
            // Capture position at death time before destruction
            const position = new THREE.Vector3();
            const posComp = targetEntity.getComponent(PositionComponent);
            if (posComp) {
                const p = posComp.getPosition();
                position.set(p.x, p.y, p.z);
            } else {
                const geom = targetEntity.getComponent(GeometryComponent);
                if (geom) {
                    geom.getGeometryGroup().getWorldPosition(position);
                }
            }

            // Capture team information before entity is destroyed
            const teamComponent = targetEntity.getComponent(TeamComponent);
            const isCore = teamComponent?.isCore() ?? false;
            const isEnemy = teamComponent?.isEnemy() ?? false;

            // Dispatch entity death event (EntityManager will handle destruction and cleanup)
            const deathEvent = new Event(EventType.EntityDeath, {
                entityId: targetId,
                position,
                isCore,
                isEnemy
            });
            this.eventDispatcher.dispatch(deathEvent);
        }
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        this.eventDispatcher.deregisterListener('CombatSystem');
    }
}