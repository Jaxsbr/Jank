import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { EntityManager } from '../../ecs/EntityManager';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { Time } from '../../utils/Time';
import { DeathEffectComponent } from '../components/DeathEffectComponent';
import { DeathEffectConfig, defaultDeathEffectConfig } from '../config/DeathEffectConfig';

interface ActiveDeathEffect {
    entity: Entity;
    group: THREE.Group;
    sphere: THREE.Mesh;
    arcs: THREE.Line[];
    component: DeathEffectComponent;
}

export class DeathEffectSystem implements IEntitySystem {
    private readonly scene: THREE.Scene;
    private readonly entityManager: EntityManager;
    private readonly eventDispatcher: EventDispatcherSingleton;
    private readonly config: DeathEffectConfig;
    private active: ActiveDeathEffect[] = [];

    constructor(scene: THREE.Scene, entityManager: EntityManager, eventDispatcher: EventDispatcherSingleton, config: DeathEffectConfig = defaultDeathEffectConfig) {
        this.scene = scene;
        this.entityManager = entityManager;
        this.eventDispatcher = eventDispatcher;
        this.config = config;
        this.eventDispatcher.registerListener('DeathEffectSystem', {
            onEvent: (event: Event) => {
                if (event.eventName === EventType.EntityDeath) {
                    const providedPos = (event.args['position'] as THREE.Vector3) || undefined;
                    if (providedPos) {
                        this.spawnEffectAtPosition(providedPos);
                        return;
                    }
                }
            }
        });
    }

    public update(): void {
        if (this.active.length === 0) return;
        const now = Time.now();
        for (let i = this.active.length - 1; i >= 0; i--) {
            const fx = this.active[i];
            if (!fx) {
                continue;
            }
            const t = (now - fx.component.startTime) / fx.component.duration;
            if (t >= 1.0) {
                this.cleanupEffectIndex(i);
                continue;
            }

            // Ease out
            const eased = 1 - Math.pow(1 - t, 2);
            const radius = THREE.MathUtils.lerp(this.config.startRadius, this.config.endRadius, eased);

            // Update sphere scale and emissive intensity fade
            fx.sphere.scale.setScalar(radius);
            const material = fx.sphere.material as THREE.MeshStandardMaterial;
            const intensity = 1.0 - t;
            material.emissive = new THREE.Color(this.config.sphereColor);
            material.emissiveIntensity = 1.2 * intensity;
            material.opacity = 0.9 * (1.0 - t * 0.8);
            material.transparent = true;

            // Jitter arcs
            for (const line of fx.arcs) {
                const positions = ((line.geometry as THREE.BufferGeometry).attributes['position']) as THREE.BufferAttribute;
                const segments = positions.count;
                for (let s = 0; s < segments; s++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = radius * (0.8 + Math.random() * 0.4);
                    const y = (Math.random() - 0.5) * radius * 0.6;
                    positions.setXYZ(s, Math.cos(angle) * r, y, Math.sin(angle) * r);
                }
                positions.needsUpdate = true;
                const lm = line.material as THREE.LineBasicMaterial;
                lm.opacity = 0.9 * (1.0 - t);
                lm.transparent = true;
            }
        }
    }

    private spawnEffectAtPosition(position: THREE.Vector3): void {
        const effectEntity = this.entityManager.createEntity();
        const startTime = Time.now();
        const comp = new DeathEffectComponent(startTime, this.config.durationSeconds);

        const group = new THREE.Group();
        group.position.copy(position);

        // Core glowing sphere
        const sphereGeom = new THREE.SphereGeometry(1.0, 12, 12);
        const sphereMat = new THREE.MeshStandardMaterial({
            color: this.config.sphereColor,
            emissive: new THREE.Color(this.config.sphereColor),
            emissiveIntensity: 1.2,
            transparent: true,
            opacity: 0.9
        });
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        sphere.scale.setScalar(this.config.startRadius);
        group.add(sphere);

        // Electric arcs as lines radiating outward
        const arcs: THREE.Line[] = [];
        for (let i = 0; i < this.config.arcCount; i++) {
            const points = new Float32Array(12 * 3);
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
            const material = new THREE.LineBasicMaterial({ color: this.config.arcColor, transparent: true, opacity: 0.9 });
            const line = new THREE.Line(geometry, material);
            group.add(line);
            arcs.push(line);
        }

        this.scene.add(group);

        // Store effect entry; we handle cleanup manually for this bespoke VFX
        effectEntity.addComponent(comp);

        this.active.push({ entity: effectEntity, group, sphere, arcs, component: comp });
    }

    private cleanupEffectIndex(index: number): void {
        const fx = this.active[index];
        if (!fx) {
            this.active.splice(index, 1);
            return;
        }
        // Remove from scene
        this.scene.remove(fx.group);
        // Dispose sphere resources
        if (fx.sphere.geometry) {
            fx.sphere.geometry.dispose();
        }
        const sphereMat = fx.sphere.material as THREE.MeshStandardMaterial;
        sphereMat.dispose();
        // Dispose arc resources
        for (const line of fx.arcs) {
            (line.geometry as THREE.BufferGeometry).dispose();
            (line.material as THREE.LineBasicMaterial).dispose();
        }
        this.active.splice(index, 1);
        this.entityManager.destroyEntity(fx.entity);
    }
}


