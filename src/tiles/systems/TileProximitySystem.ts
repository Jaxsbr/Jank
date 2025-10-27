import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { PositionComponent } from '../../entities/components/PositionComponent';
import { TeamComponent } from '../../entities/components/TeamComponent';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { TileComponent } from '../components/TileComponent';
import { TileTriggerComponent, TileTriggerType } from '../components/TileTriggerComponent';
import { TileVisualComponent } from '../components/TileVisualComponent';

/**
 * System that tracks entity proximity to tiles and dispatches range events
 */
export class TileProximitySystem implements IEntitySystem {
    private eventDispatcher: EventDispatcherSingleton;
    private entityProximityMap: Map<string, Set<string>>; // tileId -> Set of entityIds in range
    private tileProximityMap: Map<string, Set<string>>;   // entityId -> Set of tileIds in range

    constructor(eventDispatcher: EventDispatcherSingleton) {
        this.eventDispatcher = eventDispatcher;
        this.entityProximityMap = new Map();
        this.tileProximityMap = new Map();
    }

    update(entities: readonly Entity[]): void {
        // Separate entities and tiles
        const gameEntities = entities.filter(entity => 
            entity.hasComponent(PositionComponent) && 
            !entity.hasComponent(TileComponent)
        );
        
        // Filter for enemy entities only (tiles are allied with core)
        const enemyEntities = gameEntities.filter(entity => {
            const teamComponent = entity.getComponent(TeamComponent);
            return teamComponent && teamComponent.isEnemy();
        });
        
        
        const tiles = entities.filter(entity => 
            entity.hasComponent(TileComponent) && 
            entity.hasComponent(TileTriggerComponent) &&
            entity.hasComponent(TileVisualComponent)
        );

        // Check proximity for each tile
        tiles.forEach(tile => {
            const tileComponent = tile.getComponent(TileComponent);
            const triggerComponent = tile.getComponent(TileTriggerComponent);
            const visualComponent = tile.getComponent(TileVisualComponent);

            if (!tileComponent || !triggerComponent || !visualComponent) return;

            // Only check proximity for proximity-based triggers
            if (triggerComponent.getTriggerType() !== TileTriggerType.PROXIMITY) return;

            const tileId = tile.getId();
            const tilePosition = visualComponent.getTileMesh().position;
            const proximityRadius = triggerComponent.getProximityRadius();

            // Get current enemy entities in range
            const currentEntitiesInRange = new Set<string>();
            
            enemyEntities.forEach(entity => {
                const positionComponent = entity.getComponent(PositionComponent);
                if (!positionComponent) return;

                const entityPosition = positionComponent.getPosition();
                const distance = tilePosition.distanceTo(entityPosition);

                if (distance <= proximityRadius) {
                    const entityId = entity.getId();
                    currentEntitiesInRange.add(entityId);

                    // Check if entity just entered range
                    const previousEntitiesInRange = this.entityProximityMap.get(tileId) || new Set();
                    if (!previousEntitiesInRange.has(entityId)) {
                        this.dispatchEntityEnteredTileRange(entity, tile);
                    }
                }
            });

            // Check for entities that left range
            const previousEntitiesInRange = this.entityProximityMap.get(tileId) || new Set();
            previousEntitiesInRange.forEach(entityId => {
                if (!currentEntitiesInRange.has(entityId)) {
                    const entity = enemyEntities.find(e => e.getId() === entityId);
                    if (entity) {
                        this.dispatchEntityExitedTileRange(entity, tile);
                    }
                }
            });

            // Update proximity map
            this.entityProximityMap.set(tileId, currentEntitiesInRange);
            
            // Check if tile should deactivate (no enemies in range)
            const wasActive = previousEntitiesInRange.size > 0;
            const isActive = currentEntitiesInRange.size > 0;
            
            if (wasActive && !isActive) {
                // All enemies left range - dispatch deactivation event
                this.dispatchTileEffectDeactivation(tile);
            }
        });

        // Update entity proximity map (reverse lookup)
        this.tileProximityMap.clear();
        this.entityProximityMap.forEach((entityIds, tileId) => {
            entityIds.forEach(entityId => {
                if (!this.tileProximityMap.has(entityId)) {
                    this.tileProximityMap.set(entityId, new Set());
                }
                this.tileProximityMap.get(entityId)!.add(tileId);
            });
        });
    }

    /**
     * Dispatch EntityEnteredTileRange event
     */
    private dispatchEntityEnteredTileRange(entity: Entity, tile: Entity): void {
        this.eventDispatcher.dispatch(new Event(EventType.EntityEnteredTileRange, {
            entity: entity,
            tile: tile,
            entityId: entity.getId(),
            tileId: tile.getId()
        }));
    }

    /**
     * Dispatch EntityExitedTileRange event
     */
    private dispatchEntityExitedTileRange(entity: Entity, tile: Entity): void {
        this.eventDispatcher.dispatch(new Event(EventType.EntityExitedTileRange, {
            entity: entity,
            tile: tile,
            entityId: entity.getId(),
            tileId: tile.getId()
        }));
    }

    /**
     * Dispatch tile effect deactivation when all enemies leave range
     */
    private dispatchTileEffectDeactivation(tile: Entity): void {
        this.eventDispatcher.dispatch(new Event(EventType.TileEffectDeactivated, {
            tile: tile,
            tileId: tile.getId(),
            reason: 'no_enemies_in_range',
            deactivationTime: performance.now() / 1000
        }));
    }

    /**
     * Get all tiles currently in range of an entity
     */
    public getTilesInRangeOfEntity(entityId: string): string[] {
        const tileIds = this.tileProximityMap.get(entityId);
        return tileIds ? Array.from(tileIds) : [];
    }

    /**
     * Get all entities currently in range of a tile
     */
    public getEntitiesInRangeOfTile(tileId: string): string[] {
        const entityIds = this.entityProximityMap.get(tileId);
        return entityIds ? Array.from(entityIds) : [];
    }

    /**
     * Check if an entity is in range of a specific tile
     */
    public isEntityInRangeOfTile(entityId: string, tileId: string): boolean {
        const tileIds = this.tileProximityMap.get(entityId);
        return tileIds ? tileIds.has(tileId) : false;
    }
}
