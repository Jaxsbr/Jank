import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { metaPointsService } from '../../utils/MetaPointsService';
import { SpatialQuery } from '../../utils/SpatialQuery';
import { AttackComponent } from '../components/AttackComponent';
import { HealthComponent } from '../components/HealthComponent';
import { MetaUpgradeComponent } from '../components/MetaUpgradeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TargetComponent } from '../components/TargetComponent';
import { TeamComponent } from '../components/TeamComponent';
import { defaultMetaUpgradeConfig } from '../config/MetaUpgradeConfig';

export class TargetingSystem implements IEntitySystem, IEventListener {
    private eventDispatcher: EventDispatcherSingleton;
    private deadEntityIds: string[] = [];

    constructor(eventDispatcher: EventDispatcherSingleton) {
        this.eventDispatcher = eventDispatcher;
        // Register as event listener for entity death events
        this.eventDispatcher.registerListener('TargetingSystem', this);
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.EntityDeath) {
            const deadEntityId = event.args['entityId'] as string;
            if (deadEntityId) {
                // Track this dead entity to clear it as target
                this.deadEntityIds.push(deadEntityId);
            }
        }
    }

    /**
     * Update targeting for all entities
     */
    public update(entities: readonly Entity[]): void {
        // Clear targets pointing to dead entities
        if (this.deadEntityIds.length > 0) {
            EntityQuery.from(entities)
                .withComponents(TargetComponent)
                .execute()
                .forEach(({ components }) => {
                    const [target] = components;
                    if (target.hasTarget()) {
                        const targetEntity = target.getTarget();
                        if (targetEntity && this.deadEntityIds.includes(targetEntity.getId())) {
                            target.clearTarget();
                        }
                    }
                });
            this.deadEntityIds = [];
        }

        // Process entities that can target (have Team, Target, Position, and Health components)
        EntityQuery.from(entities)
            .withComponents(TeamComponent, TargetComponent, PositionComponent, HealthComponent)
            .filter(({ components }) => {
                const [, , , health] = components;
                return health.isAlive();
            })
            .execute()
            .forEach(({ entity, components }) => {
                const [team, target, position] = components;
                
                // Clear target if it's no longer valid
                if (target.hasTarget() && !target.isTargetValid()) {
                    target.clearTarget();
                }
                
                // Check if advanced melee targeting is enabled for core
                const advancedTargetingLevel = team.isCore() 
                    ? metaPointsService.getPurchasedUpgradeLevel('advanced-melee-targeting')
                    : 0;
                
                // For core with advanced targeting, always re-evaluate to pick best target
                // For others, only find target if we don't have one
                if (advancedTargetingLevel > 0 && team.isCore()) {
                    const newTarget = this.findTarget(entity, team, position, entities);
                    if (newTarget && (!target.hasTarget() || target.getTarget() !== newTarget)) {
                        target.setTarget(newTarget);
                    }
                } else if (!target.hasTarget()) {
                    // Default behavior: only find target when we don't have one
                    const newTarget = this.findTarget(entity, team, position, entities);
                    if (newTarget) {
                        target.setTarget(newTarget);
                    }
                }
            });
    }

    /**
     * Find a valid target for the given entity
     */
    private findTarget(entity: Entity, team: TeamComponent, position: PositionComponent, entities: readonly Entity[]): Entity | null {
        // Get all potential targets with required components
        const potentialTargets = EntityQuery.from(entities)
            .withComponents(TeamComponent, PositionComponent, HealthComponent)
            .filter(({ entity: potentialTarget, components }) => {
                const [targetTeam, , targetHealth] = components;
                
                // Skip self
                if (potentialTarget === entity) {
                    return false;
                }
                
                // Check if target is alive
                if (!targetHealth.isAlive()) {
                    return false;
                }
                
                // Check if target is hostile
                if (!team.isHostileTo(targetTeam)) {
                    return false;
                }
                
                return true;
            })
            .execute()
            .map(({ entity }) => entity);

        if (potentialTargets.length === 0) {
            return null;
        }

        const entityPosition = position.toVector3();

        // Apply targeting rules
        if (team.isCore()) {
            // Check if advanced melee targeting is unlocked
            const advancedTargetingLevel = metaPointsService.getPurchasedUpgradeLevel('advanced-melee-targeting');
            if (advancedTargetingLevel > 0) {
                // Advanced targeting mode - filter by attack range and apply mode logic
                const meta = entity.getComponent(MetaUpgradeComponent);
                const attack = entity.getComponent(AttackComponent);
                
                if (meta && attack) {
                    // Calculate effective melee range
                    const meleeRings = Math.min(
                        meta.getMeleeRangeRings(),
                        defaultMetaUpgradeConfig.maxMeleeRangeRings
                    );
                    const baseRange = attack.getRange();
                    const effectiveRange = meleeRings === 0 ? baseRange : baseRange * meleeRings;
                    
                    // Filter targets within attack range
                    const targetsInRange = SpatialQuery.getEntitiesInRadius2D(
                        potentialTargets,
                        entityPosition,
                        effectiveRange
                    );
                    
                    if (targetsInRange.length === 0) {
                        return null;
                    }
                    
                    // Apply targeting mode
                    const targetingMode = meta.getTargetingMode();
                    if (targetingMode === 'lowest') {
                        // Find target with lowest HP
                        let lowestHpTarget: Entity | null = null;
                        let lowestHp = Infinity;
                        
                        for (const target of targetsInRange) {
                            const targetHealth = target.getComponent(HealthComponent);
                            if (targetHealth && targetHealth.isAlive()) {
                                const currentHp = targetHealth.getHP();
                                if (currentHp < lowestHp) {
                                    lowestHp = currentHp;
                                    lowestHpTarget = target;
                                }
                            }
                        }
                        
                        return lowestHpTarget;
                    } else {
                        // 'nearest' mode - find closest
                        return SpatialQuery.getClosestEntity2D(targetsInRange, entityPosition);
                    }
                }
            }
            
            // Default behavior: Core entity can target any enemy - find closest (grudge mode)
            return SpatialQuery.getClosestEntity2D(potentialTargets, entityPosition);
        } else if (team.isEnemy()) {
            // Enemies can only target the core entity
            const coreTargets = potentialTargets.filter(target => {
                const targetTeam = target.getComponent(TeamComponent);
                return targetTeam && targetTeam.isCore();
            });
            
            if (coreTargets.length > 0) {
                return SpatialQuery.getClosestEntity2D(coreTargets, entityPosition);
            }
        }

        return null;
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        this.eventDispatcher.deregisterListener('TargetingSystem');
    }
}
