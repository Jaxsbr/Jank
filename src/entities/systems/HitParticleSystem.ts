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
import { ArcFXConfig, HitFXKind, HitParticleConfig, defaultHitParticleConfig } from '../config/HitParticleConfig';

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

interface ArcFX extends BaseFX {
    kind: 'arcs';
    lines: THREE.Line[];
    material: THREE.LineBasicMaterial;
}

/**
 * Spawns small transient puffs on enemy melee hits.
 */
export class HitParticleSystem implements IEventListener, IEntitySystem {
    private eventDispatcher: EventDispatcherSingleton;
    private entities: readonly Entity[] = [];
    private particles: (ShardFX | FluffyFX | ArcFX)[] = [];
    private config: HitParticleConfig;
    private scene: THREE.Scene | null = null;
    private arcConfigRef: ArcFXConfig;

    constructor(eventDispatcher: EventDispatcherSingleton, scene?: THREE.Scene, config: HitParticleConfig = defaultHitParticleConfig) {
        this.eventDispatcher = eventDispatcher;
        this.config = config;
        this.scene = scene ?? null;
        // Cache arc config reference to avoid repeated unsafe accesses on dynamic config
        this.arcConfigRef = (config).arcs;
        this.eventDispatcher.registerListener('HitParticleSystem', this);
    }

    public setEntities(entities: readonly Entity[]): void {
        this.entities = entities;
    }

    public onEvent(event: Event): void {
        if (event.eventName !== EventType.DamageTaken) return;
        const targetId = event.args['targetId'] as string;
        if (!targetId) return;

        const providedPos = (event.args['position'] as THREE.Vector3) || undefined;
        const entity = EntityFinder.findEntityById(this.entities, targetId);
        if (!entity && !providedPos) return;

        const team = entity ? entity.getComponent(TeamComponent) : undefined;
        const geometry = entity ? entity.getComponent(GeometryComponent) : undefined;

        // Prefer to show on enemies, but if no team component, still show
        if (team && !team.isEnemy()) return;

        this.spawnParticle(entity ?? null, geometry ?? null, providedPos);
    }

    private spawnParticle(entity: Entity | null, geometry: GeometryComponent | null, providedPos?: THREE.Vector3): void {
        this.spawnArcs(entity, geometry, providedPos);

        // ENABLE to spawn effect variations
        // const effectToSpawn: HitFXKind = this.config.mode === 'random'
        //     ? (Math.random() < 0.5 ? 'shards' : 'fluffy')
        //     : this.config.mode;

        // if (effectToSpawn === 'fluffy') {
        //     this.spawnFluffy(entity, geometry);
        // } else {
        //     this.spawnShards(entity, geometry);
        // }
    }

    private spawnShards(entity: Entity | null, geometry: GeometryComponent | null, providedPos?: THREE.Vector3): void {
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

        // Position burst between core and enemy in WORLD space
        let worldMidpoint: THREE.Vector3 | null = null;
        try {
            // If position provided, use that as world midpoint directly
            if (providedPos) {
                worldMidpoint = providedPos.clone();
            }
            // Find core entity position (first CORE entity)
            const core = this.entities.find((e: Entity) => {
                const t = e.getComponent(TeamComponent) as TeamComponent | undefined;
                return !!t && t.isCore();
            });
            const enemyGeom = entity ? entity.getComponent(GeometryComponent) as GeometryComponent | undefined : geometry;
            if (!worldMidpoint && core && enemyGeom) {
                const coreGeom = core.getComponent(GeometryComponent) as GeometryComponent | undefined;
                if (coreGeom) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const enemyPos = enemyGeom.getPosition();
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const corePos = coreGeom.getPosition();
                    const enemyV = enemyPos;
                    const coreV = corePos;
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

        // Place group in world space
        if (!this.scene) return;
        if (worldMidpoint) {
            group.position.copy(worldMidpoint);
        } else if (geometry) {
            const enemyGroup = geometry.getGeometryGroup();
            group.position.copy(enemyGroup.getWorldPosition(new THREE.Vector3()));
            group.position.y += this.config.shards.yOffset;
        }
        this.scene.add(group);

        const fx: ShardFX = {
            kind: 'shards',
            parentEntityId: entity ? entity.getId() : 'unknown',
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

    private spawnFluffy(entity: Entity | null, geometry: GeometryComponent | null, providedPos?: THREE.Vector3): void {
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

        // Place group at correct world point between enemy and core (reuse midpoint logic)
        let worldMidpoint: THREE.Vector3 | null = null;
        try {
            if (providedPos) {
                worldMidpoint = providedPos.clone();
            }
            const core = this.entities.find((e: Entity) => {
                const t = e.getComponent(TeamComponent) as TeamComponent | undefined;
                return !!t && t.isCore();
            });
            const enemyGeom = entity ? entity.getComponent(GeometryComponent) as GeometryComponent | undefined : geometry;
            if (!worldMidpoint && core && enemyGeom) {
                const coreGeom = core.getComponent(GeometryComponent) as GeometryComponent | undefined;
                if (coreGeom) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const enemyPos = enemyGeom.getPosition();
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const corePos = coreGeom.getPosition();
                    const enemyV = enemyPos;
                    const coreV = corePos;
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

        if (!this.scene) return;
        if (worldMidpoint) {
            group.position.copy(worldMidpoint);
        } else if (geometry) {
            const enemyGroup = geometry.getGeometryGroup();
            group.position.copy(enemyGroup.getWorldPosition(new THREE.Vector3()));
            group.position.y += this.config.fluffy.yOffset;
        }
        this.scene.add(group);

        const fx: FluffyFX = {
            kind: 'fluffy',
            parentEntityId: entity ? entity.getId() : 'unknown',
            group,
            material,
            particles,
            startTime: Time.now(),
            lifetime: this.config.lifetime
        };
        this.particles.push(fx);
    }

    private spawnArcs(entity: Entity | null, geometry: GeometryComponent | null, providedPos?: THREE.Vector3): void {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
        const group = new THREE.Group();

        const arcConf = this.arcConfigRef;
        const material = new THREE.LineBasicMaterial({
            color: arcConf.color,
            transparent: true,
            opacity: arcConf.opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const lines: THREE.Line[] = [];

        // Determine world midpoint (same approach as other effects)
        let worldMidpoint: THREE.Vector3 | null = null;
        try {
            if (providedPos) {
                worldMidpoint = providedPos.clone();
            }
            const core = this.entities.find((e: Entity) => {
                const t = e.getComponent(TeamComponent) as TeamComponent | undefined;
                return !!t && t.isCore();
            });
            const enemyGeom = entity ? entity.getComponent(GeometryComponent) as GeometryComponent | undefined : geometry;
            if (!worldMidpoint && core && enemyGeom) {
                const coreGeom = core.getComponent(GeometryComponent) as GeometryComponent | undefined;
                if (coreGeom) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const enemyPos = enemyGeom.getPosition();
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                    const corePos = coreGeom.getPosition();
                    const enemyV = enemyPos;
                    const coreV = corePos;
                    worldMidpoint = new THREE.Vector3(
                        (enemyV.x + coreV.x) * 0.5,
                        Math.max(enemyV.y, coreV.y) + arcConf.midpointYOffset,
                        (enemyV.z + coreV.z) * 0.5
                    );
                }
            }
        } catch {
            // ignore
        }

        if (!this.scene) return;
        if (worldMidpoint) {
            group.position.copy(worldMidpoint);
        } else if (geometry) {
            const enemyGroup = geometry.getGeometryGroup();
            group.position.copy(enemyGroup.getWorldPosition(new THREE.Vector3()));
            group.position.y += arcConf.midpointYOffset;
        }

        // Create electric arc lines that jitter each frame
        const lineCount = arcConf.count;
        const segments = arcConf.segments;
        for (let i = 0; i < lineCount; i++) {
            const positions = new Float32Array(segments * 3);
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const line = new THREE.Line(geometry, material);
            group.add(line);
            lines.push(line);
        }

        this.scene.add(group);

        const fx: ArcFX = {
            kind: 'arcs',
            parentEntityId: entity ? entity.getId() : 'unknown',
            group,
            material,
            lines,
            startTime: Time.now(),
            lifetime: this.config.lifetime
        };
        this.particles.push(fx);
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
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
                if (this.scene) {
                    this.scene.remove(p.group);
                }
                p.group.clear();
                // dispose materials based on kind
                if (p.kind === 'shards') {
                    (p).material.dispose();
                } else if (p.kind === 'fluffy') {
                    (p).material.dispose();
                } else {
                    // arcs
                    const a = p;
                    a.material.dispose();
                    for (const line of a.lines) {
                        (line.geometry).dispose();
                    }
                }
                this.particles.splice(i, 1);
                continue;
            }

            if (p.kind === 'shards') {
                const s = p;
                const scale = s.startScale + (s.endScale - s.startScale) * t;
                s.group.scale.setScalar(scale);
                s.material.opacity = this.config.shards.opacity * (1 - t);
            } else if (p.kind === 'fluffy') {
                const f = p;
                const dt = Math.max(0.001, Time.getDeltaTime());
                const gravity = this.config.fluffy.gravity; // mild gravity
                for (const part of f.particles) {
                    // Integrate velocity
                    part.velocity.y += gravity * dt;
                    part.mesh.position.addScaledVector(part.velocity, dt);
                }
                f.material.opacity = this.config.fluffy.opacity * (1 - t);
            } else {
                const a = p;
                // ease radius for arcs outward over life
                const eased = 1 - Math.pow(1 - t, 2);
                const arcConf = this.arcConfigRef;
                const radius = THREE.MathUtils.lerp(arcConf.radiusStart, arcConf.radiusEnd, eased);
                const jitter = arcConf.jitter;
                for (const line of a.lines) {
                    const positions = ((line.geometry).attributes['position']) as THREE.BufferAttribute;
                    const segs = positions.count;
                    for (let s = 0; s < segs; s++) {
                        const angle = Math.random() * Math.PI * 2;
                        const r = radius * (0.75 + Math.random() * 0.5);
                        const y = (Math.random() - 0.5) * radius * 0.5;
                        const jx = (Math.random() - 0.5) * jitter;
                        const jz = (Math.random() - 0.5) * jitter;
                        positions.setXYZ(s, Math.cos(angle) * r + jx, y, Math.sin(angle) * r + jz);
                    }
                    positions.needsUpdate = true;
                }
                a.material.opacity = this.arcConfigRef.opacity * (1 - t);
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
            if ((p as ShardFX).kind === 'shards') {
                (p as ShardFX).material.dispose();
            } else if ((p as FluffyFX).kind === 'fluffy') {
                (p as FluffyFX).material.dispose();
            } else {
                const a = p as ArcFX;
                a.material.dispose();
                for (const line of a.lines) {
                    (line.geometry).dispose();
                }
            }
        }
        this.particles = [];
    }
}


