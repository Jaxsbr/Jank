import { Scene } from 'three';
import { Entity } from '../../ecs/Entity';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { GeometryComponent } from '../components/GeometryComponent';

/**
 * Temporary system to handle entity cleanup when entities are destroyed.
 * This will be refactored in Phase 2 to be more comprehensive.
 */
export class EntityCleanupSystem implements IEventListener {
    private scene: Scene;
    private eventDispatcher: EventDispatcherSingleton;

    constructor(scene: Scene, eventDispatcher: EventDispatcherSingleton) {
        this.scene = scene;
        this.eventDispatcher = eventDispatcher;
        // Register as event listener for entity destroyed events
        this.eventDispatcher.registerListener('EntityCleanupSystem', this);
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.EntityDestroyed) {
            this.handleEntityDestroyed(event);
        }
    }

    /**
     * Handle an entity destroyed event
     */
    private handleEntityDestroyed(event: Event): void {
        const entity = event.args['entity'] as Entity;
        if (!entity) {
            return;
        }

        // Remove entity from scene
        const geometryComponent = entity.getComponent(GeometryComponent);
        if (geometryComponent) {
            this.scene.remove(geometryComponent.getGeometryGroup());
        }
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        this.eventDispatcher.deregisterListener('EntityCleanupSystem');
    }
}
