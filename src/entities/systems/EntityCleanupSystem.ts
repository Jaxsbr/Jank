import { Scene } from 'three';
import { Entity } from '../../ecs/Entity';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { GeometryComponent } from '../components/GeometryComponent';

/**
 * System responsible for cleaning up entity resources when entities are destroyed.
 * Removes geometries from the scene and disposes of Three.js resources to prevent memory leaks.
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
     * Removes the entity's geometry from the scene and disposes of Three.js resources
     */
    private handleEntityDestroyed(event: Event): void {
        const entity = event.args['entity'] as Entity;
        if (!entity) {
            return;
        }

        // Remove entity main geometry from scene and dispose resources
        const geometryComponent = entity.getComponent(GeometryComponent);
        if (geometryComponent) {
            const group = geometryComponent.getGeometryGroup();
            
            // Remove from scene
            this.scene.remove(group);
            
            // Dispose of geometries and materials
            this.disposeGeometryComponent(geometryComponent);
        }

        // If any auxiliary visuals were attached, they should be removed by their own systems
    }

    /**
     * Dispose of all Three.js resources in a GeometryComponent
     */
    private disposeGeometryComponent(component: GeometryComponent): void {
        // Dispose main sphere
        const mainSphere = component.getMainSphere();
        if (mainSphere.geometry) {
            mainSphere.geometry.dispose();
        }
        
        // Dispose main material
        const mainMaterial = component.getMainMaterial();
        mainMaterial.dispose();
        
        // Dispose secondary geometries
        const secondaryGeometries = component.getAllSecondaryGeometries();
        secondaryGeometries.forEach(mesh => {
            if (mesh.geometry) {
                mesh.geometry.dispose();
            }
        });
        
        // Dispose secondary material
        const secondaryMaterial = component.getSecondaryMaterial();
        secondaryMaterial.dispose();
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        this.eventDispatcher.deregisterListener('EntityCleanupSystem');
    }
}
