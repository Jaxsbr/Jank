import * as THREE from 'three';
import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../entities/components/PositionComponent';

/**
 * Utility class for spatial queries on entities
 * Provides efficient spatial operations for game entities
 */
export class SpatialQuery {
    /**
     * Get entities within a specified radius of a center point
     * @param entities - Array of entities to search through
     * @param center - Center position for the radius search
     * @param radius - Search radius
     * @param requirePositionComponent - Whether to filter for entities with PositionComponent (default true)
     * @returns Array of entities within the radius, sorted by distance (closest first)
     */
    public static getEntitiesInRadius(
        entities: readonly Entity[], 
        center: THREE.Vector3, 
        radius: number,
        requirePositionComponent = true
    ): Entity[] {
        const entitiesInRadius: { entity: Entity; distance: number }[] = [];
        
        entities.forEach(entity => {
            if (requirePositionComponent && !entity.hasComponent(PositionComponent)) {
                return;
            }
            
            const positionComponent = entity.getComponent(PositionComponent);
            if (!positionComponent) return;
            
            const entityPosition = positionComponent.toVector3();
            const distance = center.distanceTo(entityPosition);
            
            if (distance <= radius) {
                entitiesInRadius.push({ entity, distance });
            }
        });
        
        // Sort by distance (closest first)
        entitiesInRadius.sort((a, b) => a.distance - b.distance);
        
        return entitiesInRadius.map(item => item.entity);
    }

    /**
     * Get the closest entity to a given position
     * @param entities - Array of entities to search through
     * @param position - Position to find closest entity to
     * @param requirePositionComponent - Whether to filter for entities with PositionComponent (default true)
     * @returns The closest entity, or null if none found
     */
    public static getClosestEntity(
        entities: readonly Entity[], 
        position: THREE.Vector3,
        requirePositionComponent = true
    ): Entity | null {
        let closestEntity: Entity | null = null;
        let closestDistance = Infinity;
        
        entities.forEach(entity => {
            if (requirePositionComponent && !entity.hasComponent(PositionComponent)) {
                return;
            }
            
            const positionComponent = entity.getComponent(PositionComponent);
            if (!positionComponent) return;
            
            const entityPosition = positionComponent.toVector3();
            const distance = position.distanceTo(entityPosition);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEntity = entity;
            }
        });
        
        return closestEntity;
    }

    /**
     * Get entities within a bounding box
     * @param entities - Array of entities to search through
     * @param min - Minimum corner of the bounding box
     * @param max - Maximum corner of the bounding box
     * @param requirePositionComponent - Whether to filter for entities with PositionComponent (default true)
     * @returns Array of entities within the bounding box
     */
    public static getEntitiesInBox(
        entities: readonly Entity[], 
        min: THREE.Vector3, 
        max: THREE.Vector3,
        requirePositionComponent = true
    ): Entity[] {
        const entitiesInBox: Entity[] = [];
        
        entities.forEach(entity => {
            if (requirePositionComponent && !entity.hasComponent(PositionComponent)) {
                return;
            }
            
            const positionComponent = entity.getComponent(PositionComponent);
            if (!positionComponent) return;
            
            const entityPosition = positionComponent.toVector3();
            
            if (entityPosition.x >= min.x && entityPosition.x <= max.x &&
                entityPosition.y >= min.y && entityPosition.y <= max.y &&
                entityPosition.z >= min.z && entityPosition.z <= max.z) {
                entitiesInBox.push(entity);
            }
        });
        
        return entitiesInBox;
    }

    /**
     * Get entities within a radius, sorted by distance with distance information
     * @param entities - Array of entities to search through
     * @param center - Center position for the radius search
     * @param radius - Search radius
     * @param requirePositionComponent - Whether to filter for entities with PositionComponent (default true)
     * @returns Array of objects containing entity and distance, sorted by distance
     */
    public static getEntitiesInRadiusWithDistance(
        entities: readonly Entity[], 
        center: THREE.Vector3, 
        radius: number,
        requirePositionComponent = true
    ): { entity: Entity; distance: number }[] {
        const entitiesInRadius: { entity: Entity; distance: number }[] = [];
        
        entities.forEach(entity => {
            if (requirePositionComponent && !entity.hasComponent(PositionComponent)) {
                return;
            }
            
            const positionComponent = entity.getComponent(PositionComponent);
            if (!positionComponent) return;
            
            const entityPosition = positionComponent.toVector3();
            const distance = center.distanceTo(entityPosition);
            
            if (distance <= radius) {
                entitiesInRadius.push({ entity, distance });
            }
        });
        
        // Sort by distance (closest first)
        entitiesInRadius.sort((a, b) => a.distance - b.distance);
        
        return entitiesInRadius;
    }

    /**
     * Get entities within a 2D radius (ignoring Y coordinate)
     * Useful for ground-based proximity checks
     * @param entities - Array of entities to search through
     * @param center - Center position for the radius search
     * @param radius - Search radius
     * @param requirePositionComponent - Whether to filter for entities with PositionComponent (default true)
     * @returns Array of entities within the 2D radius, sorted by 2D distance
     */
    public static getEntitiesInRadius2D(
        entities: readonly Entity[], 
        center: THREE.Vector3, 
        radius: number,
        requirePositionComponent = true
    ): Entity[] {
        const entitiesInRadius: { entity: Entity; distance: number }[] = [];
        
        entities.forEach(entity => {
            if (requirePositionComponent && !entity.hasComponent(PositionComponent)) {
                return;
            }
            
            const positionComponent = entity.getComponent(PositionComponent);
            if (!positionComponent) return;
            
            const entityPosition = positionComponent.toVector3();
            
            // Calculate 2D distance (ignore Y)
            const dx = center.x - entityPosition.x;
            const dz = center.z - entityPosition.z;
            const distance2D = Math.sqrt(dx * dx + dz * dz);
            
            if (distance2D <= radius) {
                entitiesInRadius.push({ entity, distance: distance2D });
            }
        });
        
        // Sort by distance (closest first)
        entitiesInRadius.sort((a, b) => a.distance - b.distance);
        
        return entitiesInRadius.map(item => item.entity);
    }

    /**
     * Get the closest entity to a given position using 2D distance
     * @param entities - Array of entities to search through
     * @param position - Position to find closest entity to
     * @param requirePositionComponent - Whether to filter for entities with PositionComponent (default true)
     * @returns The closest entity, or null if none found
     */
    public static getClosestEntity2D(
        entities: readonly Entity[], 
        position: THREE.Vector3,
        requirePositionComponent = true
    ): Entity | null {
        let closestEntity: Entity | null = null;
        let closestDistance = Infinity;
        
        entities.forEach(entity => {
            if (requirePositionComponent && !entity.hasComponent(PositionComponent)) {
                return;
            }
            
            const positionComponent = entity.getComponent(PositionComponent);
            if (!positionComponent) return;
            
            const entityPosition = positionComponent.toVector3();
            
            // Calculate 2D distance (ignore Y)
            const dx = position.x - entityPosition.x;
            const dz = position.z - entityPosition.z;
            const distance2D = Math.sqrt(dx * dx + dz * dz);
            
            if (distance2D < closestDistance) {
                closestDistance = distance2D;
                closestEntity = entity;
            }
        });
        
        return closestEntity;
    }
}
