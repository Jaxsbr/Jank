import { Entity } from '../ecs/Entity';

/**
 * Utility class for finding entities by ID
 * This centralizes entity lookup logic to avoid duplication across systems
 */
export class EntityFinder {
    /**
     * Find an entity by its ID
     * @param entities - Array of entities to search
     * @param id - The ID to search for
     * @returns The entity with the matching ID, or null if not found
     */
    public static findEntityById(entities: readonly Entity[], id: string): Entity | null {
        return entities.find(entity => entity.getId() === id) ?? null;
    }

    /**
     * Find multiple entities by their IDs
     * @param entities - Array of entities to search
     * @param ids - Array of IDs to search for
     * @returns Array of entities with matching IDs
     */
    public static findEntitiesByIds(entities: readonly Entity[], ids: string[]): Entity[] {
        return entities.filter(entity => ids.includes(entity.getId()));
    }

    /**
     * Check if an entity exists by ID
     * @param entities - Array of entities to search
     * @param id - The ID to check
     * @returns True if an entity with the ID exists
     */
    public static hasEntityById(entities: readonly Entity[], id: string): boolean {
        return entities.some(entity => entity.getId() === id);
    }
}
