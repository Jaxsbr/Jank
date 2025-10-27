import { Entity } from '../../ecs/Entity';
import { EntityQuery } from '../../ecs/EntityQuery';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { AttackAnimationComponent } from '../components/AttackAnimationComponent';
import { GeometryComponent } from '../components/GeometryComponent';

export class AttackAnimationSystem implements IEventListener {
    private pendingAttackers: string[] = [];

    constructor() {
        // Register as event listener for attack events
        GlobalEventDispatcher.registerListener('AttackAnimationSystem', this);
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.AttackExecuted) {
            this.handleAttackExecuted(event);
        }
    }

    /**
     * Handle an attack executed event
     */
    private handleAttackExecuted(event: Event): void {
        const attackerId = event.args['attackerId'] as string;
        if (attackerId) {
            this.pendingAttackers.push(attackerId);
        }
    }

    /**
     * Update attack animations for all entities
     */
    public update(entities: readonly Entity[]): void {
        // Handle pending attackers
        if (this.pendingAttackers.length > 0) {
            this.pendingAttackers.forEach(attackerId => {
                const attackerEntity = EntityFinder.findEntityById(entities, attackerId);
                if (attackerEntity) {
                    const attackAnimComponent = attackerEntity.getComponent(AttackAnimationComponent);
                    if (attackAnimComponent) {
                        attackAnimComponent.startAttackAnimation();
                    }
                }
            });
            this.pendingAttackers = [];
        }

        // Update all attack animations
        EntityQuery.from(entities)
            .withComponents(AttackAnimationComponent, GeometryComponent)
            .execute()
            .forEach(({ entity, components }) => {
                const [attackAnim, geometry] = components;
                
                // Get current scale multiplier
                const scaleMultiplier = attackAnim.getScaleMultiplier();
                
                // Apply scale to geometry group
                const geometryGroup = geometry.getGeometryGroup();
                geometryGroup.scale.setScalar(scaleMultiplier);
            });
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        GlobalEventDispatcher.deregisterListener('AttackAnimationSystem');
    }
}
