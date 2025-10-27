import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { MathUtils } from '../../utils/MathUtils';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TargetComponent } from '../components/TargetComponent';
import { TeamComponent } from '../components/TeamComponent';

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
                .forEach(({ entity, components }) => {
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
                const [team, target, position, health] = components;
                
                // Clear target if it's no longer valid
                if (target.hasTarget() && !target.isTargetValid()) {
                    target.clearTarget();
                }
                
                // Find new target if we don't have one
                if (!target.hasTarget()) {
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
        let bestTarget: Entity | null = null;
        let bestDistance = Infinity;

        // Query for potential targets with required components
        EntityQuery.from(entities)
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
            .forEach(({ entity: potentialTarget, components }) => {
                const [targetTeam, targetPosition, targetHealth] = components;

                // Apply targeting rules
                if (team.isCore()) {
                    // Core entity can target any enemy
                    const distance = MathUtils.calculate2DDistance(position, targetPosition);
                    if (distance < bestDistance) {
                        bestTarget = potentialTarget;
                        bestDistance = distance;
                    }
                } else if (team.isEnemy()) {
                    // Enemies can only target the core entity
                    if (targetTeam.isCore()) {
                        const distance = MathUtils.calculate2DDistance(position, targetPosition);
                        if (distance < bestDistance) {
                            bestTarget = potentialTarget;
                            bestDistance = distance;
                        }
                    }
                }
            });

        return bestTarget;
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        this.eventDispatcher.deregisterListener('TargetingSystem');
    }
}
