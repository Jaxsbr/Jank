import { Event } from '../systems/eventing/Event';
import { EventDispatcherSingleton } from '../systems/eventing/EventDispatcher';
import { EventType } from '../systems/eventing/EventType';
import { Entity } from './Entity';

/**
 * Centralized entity lifecycle management system.
 * Handles entity creation, destruction, and provides readonly access to entities.
 * Dispatches EntityCreated and EntityDestroyed events for other systems to react to.
 */
export class EntityManager {
    private entities: Entity[] = [];
    private eventDispatcher: EventDispatcherSingleton;

    constructor(eventDispatcher: EventDispatcherSingleton) {
        this.eventDispatcher = eventDispatcher;
    }

    /**
     * Create a new entity and add it to the managed entities list.
     * Dispatches EntityCreated event.
     * @returns The newly created entity
     */
    public createEntity(): Entity {
        const entity = new Entity();
        this.entities.push(entity);
        
        // Dispatch entity created event
        this.eventDispatcher.dispatch(new Event(EventType.EntityCreated, {
            entityId: entity.getId(),
            entity: entity
        }));
        
        return entity;
    }

    /**
     * Destroy an entity by removing it from the managed entities list.
     * Dispatches EntityDestroyed event.
     * @param entity The entity to destroy
     */
    public destroyEntity(entity: Entity): void {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
            
            // Dispatch entity destroyed event
            this.eventDispatcher.dispatch(new Event(EventType.EntityDestroyed, {
                entityId: entity.getId(),
                entity: entity
            }));
        }
    }

    /**
     * Destroy an entity by its ID.
     * Dispatches EntityDestroyed event.
     * @param id The ID of the entity to destroy
     * @returns true if entity was found and destroyed, false otherwise
     */
    public destroyEntityById(id: string): boolean {
        const entity = this.findEntityById(id);
        if (entity) {
            this.destroyEntity(entity);
            return true;
        }
        return false;
    }

    /**
     * Get a readonly array of all managed entities.
     * @returns Readonly array of entities
     */
    public getEntities(): readonly Entity[] {
        return this.entities;
    }

    /**
     * Find an entity by its ID.
     * @param id The entity ID to search for
     * @returns The entity if found, null otherwise
     */
    public findEntityById(id: string): Entity | null {
        return this.entities.find(entity => entity.getId() === id) ?? null;
    }

    /**
     * Get the total number of managed entities.
     * @returns The count of entities
     */
    public getEntityCount(): number {
        return this.entities.length;
    }

    /**
     * Clear all entities from the manager.
     * Dispatches EntityDestroyed events for each entity.
     */
    public clearAllEntities(): void {
        // Create a copy of entities array to avoid modification during iteration
        const entitiesToDestroy = [...this.entities];
        
        entitiesToDestroy.forEach(entity => {
            this.destroyEntity(entity);
        });
    }
}
