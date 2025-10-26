import { Entity } from '../../ecs/Entity';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { HealthComponent } from '../components/HealthComponent';

/**
 * System responsible for applying damage and detecting entity death.
 * Focuses solely on damage application and death detection - does not handle cleanup.
 */
export class CombatSystem implements IEventListener {
    private eventDispatcher: EventDispatcherSingleton;
    private entities: readonly Entity[] = [];

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

        // Dispatch damage taken event for visual feedback
        const damageEvent = new Event(EventType.DamageTaken, {
            targetId: targetId,
            damage: damage,
            newHP: healthComponent.getHP()
        });
        this.eventDispatcher.dispatch(damageEvent);

        // Check if target is dead
        if (!healthComponent.isAlive()) {
            // Dispatch entity death event (EntityManager will handle destruction and cleanup)
            const deathEvent = new Event(EventType.EntityDeath, {
                entityId: targetId
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