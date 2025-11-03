import { Entity } from './Entity';
import { IComponent } from './IComponent';

/**
 * Type helper for component types
 */
export type ComponentType<T extends IComponent> = new (...args: never[]) => T;

/**
 * Type helper for query results - returns tuple of components in the same order as requested
 */
export interface QueryResult<T extends readonly ComponentType<IComponent>[]> {
    entity: Entity;
    components: {
        [K in keyof T]: T[K] extends ComponentType<infer U> ? U : never;
    };
}

/**
 * EntityQuery provides a fluent API for querying entities by components.
 * Reduces boilerplate when filtering entities and accessing their components.
 * 
 * @example
 * ```typescript
 * // Query entities with AttackComponent and TargetComponent
 * const attackers = EntityQuery.from(entities)
 *   .withComponents(AttackComponent, TargetComponent)
 *   .execute();
 * 
 * // Query with additional filtering
 * const aliveAttackers = EntityQuery.from(entities)
 *   .withComponents(AttackComponent, TargetComponent, HealthComponent)
 *   .filter(({ components }) => components[2].isAlive())
 *   .execute();
 * 
 * // Access components with type safety
 * attackers.forEach(({ entity, components }) => {
 *   const [attack, target] = components;
 *   // attack is typed as AttackComponent
 *   // target is typed as TargetComponent
 * });
 * ```
 */
export class EntityQuery<T extends readonly ComponentType<IComponent>[] = readonly ComponentType<IComponent>[]> {
    private entities: readonly Entity[];
    private componentTypes: T | null = null;
    private filterFn: ((result: QueryResult<T>) => boolean) | null = null;

    private constructor(entities: readonly Entity[]) {
        this.entities = entities;
    }

    /**
     * Create a new EntityQuery from an array of entities
     */
    public static from(entities: readonly Entity[]): EntityQuery {
        return new EntityQuery(entities);
    }

    /**
     * Filter entities that have all the specified components.
     * Returns a new query builder for chaining.
     * 
     * @param componentTypes The component types to filter by
     * @returns A new EntityQuery instance with the component filter applied
     */
    public withComponents<U extends readonly ComponentType<IComponent>[]>(
        ...componentTypes: U
    ): EntityQuery<U> {
        const query = new EntityQuery<U>(this.entities);
        query.componentTypes = componentTypes;
        query.filterFn = this.filterFn as ((result: QueryResult<U>) => boolean) | null;
        return query;
    }

    /**
     * Apply additional filtering to the query results.
     * The filter function receives the entity and its components as a typed tuple.
     * 
     * @param filterFn Function that returns true to include the result
     * @returns A new EntityQuery instance with the filter applied
     */
    public filter(filterFn: (result: QueryResult<T>) => boolean): EntityQuery<T> {
        const query = new EntityQuery<T>(this.entities);
        query.componentTypes = this.componentTypes;
        query.filterFn = filterFn;
        return query;
    }

    /**
     * Execute the query and return matching entities with their components.
     * 
     * @returns Array of QueryResult objects containing the entity and its components
     */
    public execute(): QueryResult<T>[] {
        if (!this.componentTypes) {
            throw new Error('EntityQuery: Must call withComponents() before execute()');
        }

        const results: QueryResult<T>[] = [];

        for (const entity of this.entities) {
            // Check if entity has all required components
            const hasAllComponents = this.componentTypes.every(componentType => 
                entity.hasComponent(componentType)
            );

            if (!hasAllComponents) {
                continue;
            }

            // Get all components in the same order as requested
            const components = this.componentTypes.map(componentType => 
                entity.getComponent(componentType)!
            ) as {
                [K in keyof T]: T[K] extends ComponentType<infer U> ? U : never;
            };

            const result: QueryResult<T> = {
                entity,
                components
            };

            // Apply additional filter if provided
            if (!this.filterFn || this.filterFn(result)) {
                results.push(result);
            }
        }

        return results;
    }

    /**
     * Execute the query and return only the entities (without components).
     * Useful when you only need the entities and will get components separately.
     * 
     * @returns Array of entities that match the query
     */
    public executeEntities(): Entity[] {
        if (!this.componentTypes) {
            throw new Error('EntityQuery: Must call withComponents() before executeEntities()');
        }

        const entities: Entity[] = [];

        for (const entity of this.entities) {
            // Check if entity has all required components
            const hasAllComponents = this.componentTypes.every(componentType => 
                entity.hasComponent(componentType)
            );

            if (!hasAllComponents) {
                continue;
            }

            // Apply additional filter if provided
            if (this.filterFn) {
                const components = this.componentTypes.map(componentType => 
                    entity.getComponent(componentType)!
                ) as {
                    [K in keyof T]: T[K] extends ComponentType<infer U> ? U : never;
                };

                const result: QueryResult<T> = {
                    entity,
                    components
                };

                if (!this.filterFn(result)) {
                    continue;
                }
            }

            entities.push(entity);
        }

        return entities;
    }

    /**
     * Execute the query and return the first matching result, or null if none found.
     * 
     * @returns The first QueryResult that matches, or null
     */
    public executeFirst(): QueryResult<T> | null {
        const results = this.execute();
        return results.length > 0 ? results[0]! : null;
    }

    /**
     * Execute the query and return the count of matching entities.
     * More efficient than execute().length when you only need the count.
     * 
     * @returns Number of entities that match the query
     */
    public executeCount(): number {
        if (!this.componentTypes) {
            throw new Error('EntityQuery: Must call withComponents() before executeCount()');
        }

        let count = 0;

        for (const entity of this.entities) {
            // Check if entity has all required components
            const hasAllComponents = this.componentTypes.every(componentType => 
                entity.hasComponent(componentType)
            );

            if (!hasAllComponents) {
                continue;
            }

            // Apply additional filter if provided
            if (this.filterFn) {
                const components = this.componentTypes.map(componentType => 
                    entity.getComponent(componentType)!
                ) as {
                    [K in keyof T]: T[K] extends ComponentType<infer U> ? U : never;
                };

                const result: QueryResult<T> = {
                    entity,
                    components
                };

                if (!this.filterFn(result)) {
                    continue;
                }
            }

            count++;
        }

        return count;
    }
}
