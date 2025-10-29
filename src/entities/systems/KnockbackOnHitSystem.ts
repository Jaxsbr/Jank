import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { Time } from '../../utils/Time';
import { GeometryComponent } from '../components/GeometryComponent';
import { MovementComponent } from '../components/MovementComponent';
import { PositionComponent } from '../components/PositionComponent';
import { TeamComponent } from '../components/TeamComponent';
import { KnockbackConfig, defaultKnockbackConfig } from '../config/KnockbackConfig';

interface StaggerData {
    untilTime: number;
}

/**
 * Applies instant knockback and brief stagger to enemies when the core lands a melee hit.
 */
export class KnockbackOnHitSystem implements IEventListener, IEntitySystem {
    private eventDispatcher: EventDispatcherSingleton;
    private entities: readonly Entity[] = [];
    private config: KnockbackConfig;
    private staggerMap: Map<string, StaggerData> = new Map();
    // Apply knockback as a decaying velocity for smooth motion
    private knockbackVelocityByEntityId: Map<string, THREE.Vector3> = new Map();
    

    constructor(eventDispatcher: EventDispatcherSingleton, config: KnockbackConfig = defaultKnockbackConfig) {
        this.eventDispatcher = eventDispatcher;
        this.config = config;
        this.eventDispatcher.registerListener('KnockbackOnHitSystem', this);
    }

    public setEntities(entities: readonly Entity[]): void {
        this.entities = entities;
    }

    public onEvent(event: Event): void {
        if (event.eventName !== EventType.AttackExecuted) return;

        const attackerId = event.args['attackerId'] as string;
        const targetId = event.args['targetId'] as string;
        const attacker = EntityFinder.findEntityById(this.entities, attackerId);
        const target = EntityFinder.findEntityById(this.entities, targetId);
        if (!attacker || !target) return;

        const attackerTeam = attacker.getComponent(TeamComponent);
        const targetTeam = target.getComponent(TeamComponent);
        if (!attackerTeam || !targetTeam) return;

        // Only apply for core -> enemy
        if (!(attackerTeam.isCore() && targetTeam.isEnemy())) return;

        const attackerPos = attacker.getComponent(PositionComponent) as PositionComponent | undefined;
        const targetPos = target.getComponent(PositionComponent) as PositionComponent | undefined;
        if (!attackerPos || !targetPos) return;

        // Compute horizontal direction from attacker to target
        const a = attackerPos.toVector3();
        const t = targetPos.toVector3();
        const a2 = new THREE.Vector3(a.x, 0, a.z);
        const t2 = new THREE.Vector3(t.x, 0, t.z);
        const dir = t2.clone().sub(a2);
        if (dir.lengthSq() === 0) return;
        dir.normalize();

        // Apply knockback as initial velocity (XZ only), let update() apply and decay it for smoothness
        const velocity = dir.clone().multiplyScalar(this.config.initialSpeed);
        const current = this.knockbackVelocityByEntityId.get(target.getId());
        if (current) {
            // Combine with existing velocity
            this.knockbackVelocityByEntityId.set(target.getId(), current.add(velocity));
        } else {
            this.knockbackVelocityByEntityId.set(target.getId(), velocity);
        }

        // Stagger (zero speed) for a short duration if movement exists
        const movement = target.getComponent(MovementComponent);
        if (movement) {
            movement.setCurrentSpeed(0);
            this.staggerMap.set(target.getId(), { untilTime: Time.now() + this.config.staggerDuration });
        }
    }

    /**
     * During stagger, keep currentSpeed at 0 to prevent immediate acceleration that looks jittery.
     */
    public update(entities: readonly Entity[]): void {
        const now = Time.now();
        const dt = Time.getDeltaTime();

        // Maintain stagger (brief speed zero)
        if (this.staggerMap.size > 0) {
            for (const [entityId, data] of this.staggerMap) {
                if (now >= data.untilTime) {
                    this.staggerMap.delete(entityId);
                    continue;
                }
                const e = EntityFinder.findEntityById(entities, entityId);
                if (!e) continue;
                const mv = e.getComponent(MovementComponent);
                if (mv) mv.setCurrentSpeed(0);
            }
        }

        // Apply decaying knockback velocities
        if (this.knockbackVelocityByEntityId.size === 0) return;

        for (const [entityId, vel] of this.knockbackVelocityByEntityId) {
            const e = EntityFinder.findEntityById(entities, entityId);
            if (!e) {
                this.knockbackVelocityByEntityId.delete(entityId);
                continue;
            }
            const pos = e.getComponent(PositionComponent) as PositionComponent | undefined;
            const geom = e.getComponent(GeometryComponent) as GeometryComponent | undefined;
            if (!pos || !geom) {
                this.knockbackVelocityByEntityId.delete(entityId);
                continue;
            }

            // Movement step from velocity (XZ only)
            const dx = vel.x * dt;
            const dz = vel.z * dt;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const current = pos.getPosition();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            pos.setPosition(current.x + dx, current.y, current.z + dz);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const geomPos = geom.getPosition();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            geom.setPosition(current.x + dx, geomPos.y, current.z + dz);

            // Exponential damping
            const damping = Math.exp(-this.config.damping * dt);
            vel.multiplyScalar(damping);
            if (vel.lengthSq() < 1e-4) {
                this.knockbackVelocityByEntityId.delete(entityId);
            } else {
                this.knockbackVelocityByEntityId.set(entityId, vel);
            }
        }
    }

    public destroy(): void {
        this.eventDispatcher.deregisterListener('KnockbackOnHitSystem');
        this.staggerMap.clear();
    }
}


