import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { Event } from '../../systems/eventing/Event';
import { EventArgValue } from '../../systems/eventing/EventArgValue';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { EffectType } from '../EffectType';
import { GeometryComponent } from '../components/GeometryComponent';
import { HealthComponent } from '../components/HealthComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TeamComponent } from '../components/TeamComponent';

/**
 * System responsible for applying damage and detecting entity death.
 * Focuses solely on damage application and death detection - does not handle cleanup.
 */
export class CombatSystem implements IEventListener {
    private eventDispatcher: EventDispatcherSingleton;
    private entities: readonly Entity[] = [];
    private reportedEnemyKills = new Set<string>();

    constructor(eventDispatcher: EventDispatcherSingleton) {
        this.eventDispatcher = eventDispatcher;
        // Register as event listener for combat events
        this.eventDispatcher.registerListener('CombatSystem', this);
    }

    /**
     * Set the entities array reference for damage application
     */
    public setEntities(entities: readonly Entity[]): void {
        this.entities = entities;
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.AttackExecuted) {
            this.handleAttackExecuted(event);
        } else if (event.eventName === EventType.ProjectileHit) {
            this.handleProjectileHit(event);
        } else if (event.eventName === EventType.ChargerExplosion) {
            this.handleChargerExplosion(event);
        }
    }

    /**
     * Handle an attack executed event
     * Applies damage to the target and checks for death
     */
    private handleAttackExecuted(event: Event): void {
        const targetId = event.args['targetId'] as string;
        const damage = event.args['damage'] as number;
        const isCritical = event.args['isCritical'] as boolean | undefined;
        const effectType = event.args['effectType'] as EffectType | undefined;

        // Get hit position from target entity (melee attacks use target position)
        const targetEntity = EntityFinder.findEntityById(this.entities, targetId);
        if (!targetEntity) {
            return;
        }

        const hitPosition = new THREE.Vector3();
        const posComp = targetEntity.getComponent(PositionComponent);
        if (posComp) {
            const p = posComp.getPosition();
            hitPosition.set(p.x, p.y, p.z);
        } else {
            const geom = targetEntity.getComponent(GeometryComponent);
            if (geom) {
                geom.getGeometryGroup().getWorldPosition(hitPosition);
            }
        }

        this.applyDamageAndCheckDeath(targetId, damage, hitPosition, isCritical, effectType);
    }

    /**
     * Handle a projectile hit event
     * Applies damage to the target and checks for death
     */
    private handleProjectileHit(event: Event): void {
        const targetId = event.args['targetId'] as string;
        const damage = event.args['damage'] as number;
        const position = event.args['position'] as THREE.Vector3;

        // Use provided position from projectile or fallback to target position
        const targetEntity = EntityFinder.findEntityById(this.entities, targetId);
        if (!targetEntity) {
            return;
        }

        const hitPosition = position?.clone() ?? new THREE.Vector3();
        if (!position) {
            const posComp = targetEntity.getComponent(PositionComponent);
            if (posComp) {
                const p = posComp.getPosition();
                hitPosition.set(p.x, p.y, p.z);
            } else {
                const geom = targetEntity.getComponent(GeometryComponent);
                if (geom) {
                    geom.getGeometryGroup().getWorldPosition(hitPosition);
                }
            }
        }

        // Projectiles don't have critical hits or effect types
        this.applyDamageAndCheckDeath(targetId, damage, hitPosition, false, undefined);
    }

    /**
     * Handle Charger explosion event
     * Applies explosion damage to core and kills the Charger
     */
    private handleChargerExplosion(event: Event): void {
        const attackerId = event.args['attackerId'] as string;
        const targetId = event.args['targetId'] as string;
        const damage = event.args['damage'] as number;

        // Get explosion position from attacker (Charger)
        const chargerEntity = EntityFinder.findEntityById(this.entities, attackerId);
        if (!chargerEntity) {
            return;
        }

        const hitPosition = new THREE.Vector3();
        const posComp = chargerEntity.getComponent(PositionComponent);
        if (posComp) {
            const p = posComp.getPosition();
            hitPosition.set(p.x, p.y, p.z);
        } else {
            const geom = chargerEntity.getComponent(GeometryComponent);
            if (geom) {
                geom.getGeometryGroup().getWorldPosition(hitPosition);
            }
        }

        // Apply explosion damage to core
        this.applyDamageAndCheckDeath(targetId, damage, hitPosition, false, undefined);

        // Kill the Charger (kamikaze explosion)
        const chargerHealth = chargerEntity.getComponent(HealthComponent);
        if (chargerHealth && chargerHealth.isAlive()) {
            // Set HP to 0 to trigger death
            chargerHealth.removeHP(chargerHealth.getHP());
            this.applyDamageAndCheckDeath(attackerId, 0, hitPosition, false, undefined);
        }
    }

    /**
     * Shared logic for applying damage and checking death
     * Used by both melee and projectile attacks
     */
    private applyDamageAndCheckDeath(
        targetId: string,
        damage: number,
        hitPosition: THREE.Vector3,
        isCritical?: boolean,
        effectType?: EffectType
    ): void {
        if (!targetId || typeof damage !== 'number') {
            return;
        }

        // Find the target entity
        const targetEntity = EntityFinder.findEntityById(this.entities, targetId);
        if (!targetEntity) {
            return;
        }

        // Apply damage to target
        const healthComponent = targetEntity.getComponent(HealthComponent);
        if (!healthComponent) {
            return;
        }

        healthComponent.removeHP(damage);

        // Build event args, conditionally including effectType
        const eventArgs: Record<string, EventArgValue> = {
            targetId: targetId,
            damage: damage,
            newHP: healthComponent.getHP(),
            position: hitPosition,
            isCritical: isCritical ?? false
        };
        
        if (effectType) {
            eventArgs['effectType'] = effectType;
        }

        // Dispatch damage taken event for visual feedback
        const damageEvent = new Event(EventType.DamageTaken, eventArgs);
        this.eventDispatcher.dispatch(damageEvent);

        // Check if target is dead
        if (!healthComponent.isAlive()) {
            const team = targetEntity.getComponent(TeamComponent);
            if (team && team.isEnemy() && !this.reportedEnemyKills.has(targetId)) {
                this.reportedEnemyKills.add(targetId);
                const enemyKilledEvent = new Event(EventType.EnemyKilled, {
                    entityId: targetId,
                });
                this.eventDispatcher.dispatch(enemyKilledEvent);
            }

            // Capture position at death time before destruction
            const deathPosition = hitPosition.clone();

            // Capture team information before entity is destroyed
            const teamComponent = targetEntity.getComponent(TeamComponent);
            const isCore = teamComponent?.isCore() ?? false;
            const isEnemy = teamComponent?.isEnemy() ?? false;

            // Dispatch entity death event (EntityManager will handle destruction and cleanup)
            const deathEvent = new Event(EventType.EntityDeath, {
                entityId: targetId,
                position: deathPosition,
                isCore,
                isEnemy
            });
            this.eventDispatcher.dispatch(deathEvent);
        }
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        this.eventDispatcher.deregisterListener('CombatSystem');
    }
}