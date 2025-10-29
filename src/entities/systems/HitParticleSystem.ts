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
import { TeamComponent } from '../components/TeamComponent';
import { HitFXKind, HitParticleConfig, defaultHitParticleConfig } from '../config/HitParticleConfig';

interface BaseFX {
    kind: HitFXKind;
    parentEntityId: string;
    group: THREE.Group;
    startTime: number;
    lifetime: number;
}

interface ShardFX extends BaseFX {
    kind: 'shards';
    material: THREE.MeshBasicMaterial;
    shards: THREE.Mesh[];
    startScale: number;
    endScale: number;
}

interface FluffyParticle {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
}

interface FluffyFX extends BaseFX {
    kind: 'fluffy';
    material: THREE.MeshBasicMaterial;
    particles: FluffyParticle[];
}

/**
 * Spawns small transient puffs on enemy melee hits.
 */
export class HitParticleSystem implements IEventListener, IEntitySystem {
    private eventDispatcher: EventDispatcherSingleton;
    private entities: readonly Entity[] = [];
    private particles: Array<ShardFX | FluffyFX> = [];
    private config: HitParticleConfig;

    constructor(eventDispatcher: EventDispatcherSingleton, config: HitParticleConfig = defaultHitParticleConfig) {
        this.eventDispatcher = eventDispatcher;
        this.config = config;
        this.eventDispatcher.registerListener('HitParticleSystem', this);
    }

    public setEntities(entities: readonly Entity[]): void {
        this.entities = entities;
    }

    public onEvent(event: Event): void {
        if (event.eventName !== EventType.DamageTaken) return;
        const targetId = event.args['targetId'] as string;
        if (!targetId) return;

        const entity = EntityFinder.findEntityById(this.entities, targetId);
        if (!entity) return;

        const team = entity.getComponent(TeamComponent);
        const geometry = entity.getComponent(GeometryComponent);
        if (!geometry) return;

        // Prefer to show on enemies, but if no team component, still show
        if (team && !team.isEnemy()) return;

        this.spawnParticle(entity, geometry);
    }

    private spawnParticle(entity: Entity, geometry: GeometryComponent): void {
        const effectToSpawn: HitFXKind = this.config.mode === 'random'
            ? (Math.random() < 0.5 ? 'shards' : 'fluffy')
            : this.config.mode;

        if (effectToSpawn === 'fluffy') {
            this.spawnFluffy(entity, geometry);
        } else {
            this.spawnShards(entity, geometry);
        }
    }

    private spawnShards(entity: Entity, geometry: GeometryComponent): void {
        const group = new THREE.Group();

        // Additive shard quads for a crisp hit burst
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: this.config.shards.opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        const shards: THREE.Mesh[] = [];
        const shardGeometry = new THREE.PlaneGeometry(this.config.shards.shardWidth, this.config.shards.shardHeight);
        const shardCount = this.config.shards.shardCount;
        for (let i = 0; i < shardCount; i++) {
            const shard = new THREE.Mesh(shardGeometry, material);
            // Randomize orientation for variation
            shard.rotation.set(
                Math.random() * this.config.shards.rotationMaxX,
                Math.random() * this.config.shards.rotationMaxY,
                Math.random() * this.config.shards.rotationMaxZ
            );
            shards.push(shard);
            group.add(shard);
        }

        // Position burst between core and enemy in WORLD space, then convert to enemy LOCAL space
        let worldMidpoint: THREE.Vector3 | null = null;
        try {
            // Find core entity position (first CORE entity)
            const core = this.entities.find((e: Entity) => {
                const t = e.getComponent(TeamComponent) as TeamComponent | undefined;
                return !!t && t.isCore();
            });
            const enemyGeom = entity.getComponent(GeometryComponent) as GeometryComponent | undefined;
            if (core && enemyGeom) {
                const coreGeom = core.getComponent(GeometryComponent) as GeometryComponent | undefined;
                if (coreGeom) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const enemyPos = enemyGeom.getPosition();
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const corePos = coreGeom.getPosition();
                    const enemyV = enemyPos as THREE.Vector3;
                    const coreV = corePos as THREE.Vector3;
                    // Midpoint in world space (on XZ plane)
                    worldMidpoint = new THREE.Vector3(
                        (enemyV.x + coreV.x) * 0.5,
                        Math.max(enemyV.y, coreV.y) + this.config.shards.midpointYOffset,
                        (enemyV.z + coreV.z) * 0.5
                    );
                }
            }
        } catch {
            // Fallback keeps default offset
        }

        // Attach to enemy group and set local position based on world midpoint
        const enemyGroup = geometry.getGeometryGroup();
        if (worldMidpoint) {
            // Convert world midpoint to enemy group's local space so rotation doesn't skew placement
            const localPoint = enemyGroup.worldToLocal(worldMidpoint.clone());
            group.position.copy(localPoint);
        } else {
            // Reasonable default if midpoint failed
            group.position.set(0, this.config.shards.yOffset, 0);
        }
        enemyGroup.add(group);

        const fx: ShardFX = {
            kind: 'shards',
            parentEntityId: entity.getId(),
            group,
            material,
            shards,
            startTime: Time.now(),
            lifetime: this.config.lifetime,
            startScale: this.config.startScale,
            endScale: this.config.endScale
        };
        this.particles.push(fx);
    }

    private spawnFluffy(entity: Entity, geometry: GeometryComponent): void {
        const group = new THREE.Group();

        // Additive small spheres with outward velocity and gravity
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: this.config.fluffy.opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles: FluffyParticle[] = [];
        const count = this.config.fluffy.count;
        for (let i = 0; i < count; i++) {
            const size = this.config.fluffy.sizeMin + Math.random() * (this.config.fluffy.sizeMax - this.config.fluffy.sizeMin);
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), material);
            // random slight local offset
            mesh.position.set(
                (Math.random() - 0.5) * this.config.fluffy.localJitterXZ,
                (Math.random() + this.config.fluffy.localJitterYBias) * this.config.fluffy.localJitterY,
                (Math.random() - 0.5) * this.config.fluffy.localJitterXZ
            );
            group.add(mesh);

            // velocity biased away from core along XZ
            const v = new THREE.Vector3(
                (Math.random() - 0.5),
                this.config.fluffy.baseUpwardVelocity + Math.random() * this.config.fluffy.upwardRandom,
                (Math.random() - 0.5)
            ).normalize().multiplyScalar(this.config.fluffy.randomVelocityScale + Math.random() * this.config.fluffy.velocityRandom);
            particles.push({ mesh, velocity: v });
        }

        // Place group at correct local point between enemy and core (reuse midpoint logic)
        let worldMidpoint: THREE.Vector3 | null = null;
        try {
            const core = this.entities.find((e: Entity) => {
                const t = e.getComponent(TeamComponent) as TeamComponent | undefined;
                return !!t && t.isCore();
            });
            const enemyGeom = entity.getComponent(GeometryComponent) as GeometryComponent | undefined;
            if (core && enemyGeom) {
                const coreGeom = core.getComponent(GeometryComponent) as GeometryComponent | undefined;
                if (coreGeom) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const enemyPos = enemyGeom.getPosition();
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const corePos = coreGeom.getPosition();
                    const enemyV = enemyPos as THREE.Vector3;
                    const coreV = corePos as THREE.Vector3;
                    worldMidpoint = new THREE.Vector3(
                        (enemyV.x + coreV.x) * 0.5,
                        Math.max(enemyV.y, coreV.y) + this.config.fluffy.midpointYOffset,
                        (enemyV.z + coreV.z) * 0.5
                    );
                }
            }
        } catch {
            // ignore
        }

        const enemyGroup = geometry.getGeometryGroup();
        if (worldMidpoint) {
            const localPoint = enemyGroup.worldToLocal(worldMidpoint.clone());
            group.position.copy(localPoint);
        } else {
            group.position.set(0, this.config.fluffy.yOffset, 0);
        }
        enemyGroup.add(group);

        const fx: FluffyFX = {
            kind: 'fluffy',
            parentEntityId: entity.getId(),
            group,
            material,
            particles,
            startTime: Time.now(),
            lifetime: this.config.lifetime
        };
        this.particles.push(fx);
    }

    public update(): void {
        if (this.particles.length === 0) return;
        const now = Time.now();

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (!p) continue;
            const t = (now - p.startTime) / p.lifetime;

            if (t >= 1) {
                // Cleanup
                if (p.group.parent) {
                    p.group.parent.remove(p.group);
                }
                p.group.clear();
                // dispose materials based on kind
                if (p.kind === 'shards') {
                    (p as ShardFX).material.dispose();
                } else {
                    (p as FluffyFX).material.dispose();
                }
                this.particles.splice(i, 1);
                continue;
            }

            if (p.kind === 'shards') {
                const s = p as ShardFX;
                const scale = s.startScale + (s.endScale - s.startScale) * t;
                s.group.scale.setScalar(scale);
                s.material.opacity = this.config.shards.opacity * (1 - t);
            } else {
                const f = p as FluffyFX;
                const dt = Math.max(0.001, Time.getDeltaTime());
                const gravity = this.config.fluffy.gravity; // mild gravity
                for (const part of f.particles) {
                    // Integrate velocity
                    part.velocity.y += gravity * dt;
                    part.mesh.position.addScaledVector(part.velocity, dt);
                }
                f.material.opacity = this.config.fluffy.opacity * (1 - t);
            }
        }
    }

    public destroy(): void {
        this.eventDispatcher.deregisterListener('HitParticleSystem');
        // Best-effort cleanup of remaining particles
        for (const p of this.particles) {
            if (!p) continue;
            if (p.group.parent) p.group.parent.remove(p.group);
            p.group.clear();
            p.material.dispose();
        }
        this.particles = [];
    }
}


