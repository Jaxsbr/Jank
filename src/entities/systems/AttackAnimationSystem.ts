import { Entity } from '../../ecs/Entity';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { AttackAnimationComponent } from '../components/AttackAnimationComponent';
import { GeometryComponent } from '../components/GeometryComponent';

export class AttackAnimationSystem implements IEventListener {
    private entities: Entity[] = [];

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
     * Set the entities array reference
     */
    public setEntities(entities: Entity[]): void {
        this.entities = entities;
    }

    /**
     * Handle an attack executed event
     */
    private handleAttackExecuted(event: Event): void {
        const attackerId = event.args['attackerId'] as string;
        if (!attackerId) {
            return;
        }

        // Find the attacker entity
        const attackerEntity = EntityFinder.findEntityById(this.entities, attackerId);
        if (!attackerEntity) {
            return;
        }

        // Start attack animation
        const attackAnimComponent = attackerEntity.getComponent(AttackAnimationComponent);
        if (attackAnimComponent) {
            attackAnimComponent.startAttackAnimation();
        }
    }

    /**
     * Update attack animations for all entities
     */
    public update(): void {
        this.entities.forEach(entity => {
            if (entity.hasComponent(AttackAnimationComponent) && 
                entity.hasComponent(GeometryComponent)) {
                
                const attackAnim = entity.getComponent(AttackAnimationComponent);
                const geometry = entity.getComponent(GeometryComponent);
                
                if (attackAnim && geometry) {
                    // Get current scale multiplier
                    const scaleMultiplier = attackAnim.getScaleMultiplier();
                    
                    // Apply scale to geometry group
                    const geometryGroup = geometry.getGeometryGroup();
                    geometryGroup.scale.setScalar(scaleMultiplier);
                }
            }
        });
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        GlobalEventDispatcher.deregisterListener('AttackAnimationSystem');
    }
}
