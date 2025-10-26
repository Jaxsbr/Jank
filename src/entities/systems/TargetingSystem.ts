import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { MathUtils } from '../../utils/MathUtils';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TargetComponent } from '../components/TargetComponent';
import { TeamComponent } from '../components/TeamComponent';

export class TargetingSystem implements IEntitySystem, IEventListener {
    private entities: Entity[] = [];

    constructor() {
        // Register as event listener for entity death events
        GlobalEventDispatcher.registerListener('TargetingSystem', this);
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.EntityDeath) {
            const deadEntityId = event.args['entityId'] as string;
            if (deadEntityId) {
                // Find and clear this entity as a target from all other entities
                const deadEntity = EntityFinder.findEntityById(this.entities, deadEntityId);
                if (deadEntity) {
                    this.clearEntityAsTarget(deadEntity);
                }
            }
        }
    }

    /**
     * Update targeting for all entities
     */
    public update(entities: readonly Entity[]): void {
        this.entities = [...entities];
        
        entities.forEach(entity => {
            if (entity.hasComponent(TeamComponent) && 
                entity.hasComponent(TargetComponent) && 
                entity.hasComponent(PositionComponent) &&
                entity.hasComponent(HealthComponent)) {
                
                const team = entity.getComponent(TeamComponent);
                const target = entity.getComponent(TargetComponent);
                const position = entity.getComponent(PositionComponent);
                const health = entity.getComponent(HealthComponent);
                
                if (team && target && position && health && health.isAlive()) {
                    // Clear target if it's no longer valid
                    if (target.hasTarget() && !target.isTargetValid()) {
                        target.clearTarget();
                    }
                    
                    // Find new target if we don't have one
                    if (!target.hasTarget()) {
                        const newTarget = this.findTarget(entity, team, position);
                        if (newTarget) {
                            target.setTarget(newTarget);
                        }
                    }
                }
            }
        });
    }

    /**
     * Find a valid target for the given entity
     */
    private findTarget(entity: Entity, team: TeamComponent, position: PositionComponent): Entity | null {
        let bestTarget: Entity | null = null;
        let bestDistance = Infinity;

        this.entities.forEach(potentialTarget => {
            // Skip self
            if (potentialTarget === entity) {
                return;
            }

            // Check if potential target has required components
            if (!potentialTarget.hasComponent(TeamComponent) || 
                !potentialTarget.hasComponent(PositionComponent) ||
                !potentialTarget.hasComponent(HealthComponent)) {
                return;
            }

            const targetTeam = potentialTarget.getComponent(TeamComponent);
            const targetPosition = potentialTarget.getComponent(PositionComponent);
            const targetHealth = potentialTarget.getComponent(HealthComponent);

            if (!targetTeam || !targetPosition || !targetHealth) {
                return;
            }

            // Check if target is alive
            if (!targetHealth.isAlive()) {
                return;
            }

            // Check if target is hostile
            if (!team.isHostileTo(targetTeam)) {
                return;
            }

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
     * Clear an entity as a target from all other entities
     */
    private clearEntityAsTarget(deadEntity: Entity): void {
        this.entities.forEach(entity => {
            if (entity.hasComponent(TargetComponent)) {
                const target = entity.getComponent(TargetComponent);
                if (target && target.getTarget() === deadEntity) {
                    target.clearTarget();
                }
            }
        });
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        GlobalEventDispatcher.deregisterListener('TargetingSystem');
    }
}
