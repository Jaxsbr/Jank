import { Scene } from 'three';
import { Entity } from '../../ecs/Entity';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';

export class CombatSystem implements IEventListener {
    private entities: Entity[] = [];
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        // Register as event listener for combat events
        GlobalEventDispatcher.registerListener('CombatSystem', this);
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.AttackExecuted) {
            this.handleAttackExecuted(event);
        } else if (event.eventName === EventType.EntityDeath) {
            this.handleEntityDeath(event);
        }
    }

    /**
     * Set the entities array reference for entity removal
     */
    public setEntities(entities: Entity[]): void {
        this.entities = entities;
    }

    /**
     * Handle an attack executed event
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
        GlobalEventDispatcher.dispatch(damageEvent);

        // Check if target is dead
        if (!healthComponent.isAlive()) {
            // Dispatch entity death event
            const deathEvent = new Event(EventType.EntityDeath, {
                entityId: targetId
            });
            GlobalEventDispatcher.dispatch(deathEvent);
        }
    }

    /**
     * Handle an entity death event
     */
    private handleEntityDeath(event: Event): void {
        const deadEntityId = event.args['entityId'] as string;
        if (!deadEntityId) {
            return;
        }

        // Find the dead entity
        const deadEntity = EntityFinder.findEntityById(this.entities, deadEntityId);
        if (!deadEntity) {
            return;
        }

        // Remove entity from scene
        const geometryComponent = deadEntity.getComponent(GeometryComponent);
        if (geometryComponent) {
            this.scene.remove(geometryComponent.getGeometryGroup());
        }

        // Remove entity from entities array
        const entityIndex = this.entities.indexOf(deadEntity);
        if (entityIndex !== -1) {
            this.entities.splice(entityIndex, 1);
        }
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        GlobalEventDispatcher.deregisterListener('CombatSystem');
    }
}
