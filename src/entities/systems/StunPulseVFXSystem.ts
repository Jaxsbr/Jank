import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { Time } from '../../utils/Time';
import { PositionComponent } from '../components/PositionComponent';
import { StunPulseVFXConfig, defaultStunPulseVFXConfig } from '../config/StunPulseVFXConfig';

interface StunArc {
    line: THREE.Line;
    material: THREE.LineBasicMaterial;
    segments: number;
    startRadius: number;
    endRadius: number;
    color: number;
}

interface Particle {
    mesh: THREE.Mesh;
    material: THREE.MeshBasicMaterial;
    velocity: THREE.Vector3;
    startScale: number;
    endScale: number;
}

interface CoreBurstEffect {
    kind: 'core';
    arcs: StunArc[];
    ringParticles: Particle[];
    group: THREE.Group;
    startTime: number;
    lifetime: number;
    expansionSpeed: number;
}

interface EnemyBurstEffect {
    kind: 'enemy';
    arcs: StunArc[];
    particles: Particle[];
    group: THREE.Group;
    startTime: number;
    lifetime: number;
}

type StunEffect = CoreBurstEffect | EnemyBurstEffect;

/**
 * Handles visual effects for the stun pulse ability.
 * Creates electric arcs, particles, and ring effects.
 */
export class StunPulseVFXSystem implements IEntitySystem, IEventListener {
    private eventDispatcher: EventDispatcherSingleton;
    private scene: THREE.Scene | null = null;
    private config: StunPulseVFXConfig;
    private effects: StunEffect[] = [];
    private entities: readonly Entity[] = [];

    constructor(eventDispatcher: EventDispatcherSingleton, scene?: THREE.Scene, config: StunPulseVFXConfig = defaultStunPulseVFXConfig) {
        this.eventDispatcher = eventDispatcher;
        this.scene = scene ?? null;
        this.config = config;
        this.eventDispatcher.registerListener('StunPulseVFXSystem', this);
    }

    public setEntities(entities: readonly Entity[]): void {
        this.entities = entities;
    }

    public onEvent(event: Event): void {
        if (event.eventName !== EventType.StunPulseActivated) return;

        const corePosition = event.args['corePosition'] as THREE.Vector3;
        const affectedEnemyIds = event.args['affectedEnemyIds'] as string[];
        const stunLevel = event.args['stunLevel'] as number;

        if (!corePosition || !affectedEnemyIds || !stunLevel) return;

        // Spawn core burst effect
        this.spawnCoreBurst(corePosition, stunLevel);

        // Find and spawn enemy burst effects for each stunned enemy
        const affectedEnemies = EntityFinder.findEntitiesByIds(this.entities, affectedEnemyIds);
        affectedEnemies.forEach(enemy => {
            const position = enemy.getComponent(PositionComponent);
            if (position) {
                const enemyPos = position.toVector3();
                this.spawnEnemyBurst(enemyPos, stunLevel);
            }
        });
    }

    private spawnCoreBurst(position: THREE.Vector3, level: number): void {
        const group = new THREE.Group();
        const levelConfig = level === 1 ? this.config.level1.coreBurst : this.config.level2.coreBurst;
        
        const arcs: StunArc[] = [];
        
        // Create electric arcs radiating outward
        const arcMaterial = new THREE.LineBasicMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        for (let i = 0; i < levelConfig.arcCount; i++) {
            const colorIndex = Math.floor(Math.random() * levelConfig.colors.length);
            const color = levelConfig.colors[colorIndex];
            if (color === undefined) continue;
            
            const segments = 12;
            const positions = new Float32Array(segments * 3);
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const line = new THREE.Line(geometry, arcMaterial.clone());
            line.material = arcMaterial.clone();
            (line.material).color.setHex(color);
            line.material.opacity = levelConfig.arcOpacity;
            group.add(line);

            arcs.push({
                line,
                material: line.material,
                segments,
                startRadius: 0.3,
                endRadius: 1.5,
                color
            });
        }

        // Create expanding ring particles
        const particleMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const ringParticles: Particle[] = [];
        for (let i = 0; i < levelConfig.ringParticleCount; i++) {
            const colorIndex = Math.floor(Math.random() * levelConfig.colors.length);
            const color = levelConfig.colors[colorIndex];
            if (color === undefined) continue;
            
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(levelConfig.ringParticleSize, 8, 8),
                particleMaterial.clone()
            );
            (mesh.material).color.setHex(color);
            mesh.material.opacity = levelConfig.particleOpacity;
            group.add(mesh);

            const angle = (i / levelConfig.ringParticleCount) * Math.PI * 2;
            ringParticles.push({
                mesh,
                material: mesh.material,
                velocity: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize(),
                startScale: 1.0,
                endScale: 2.5
            });
        }

        if (!this.scene) return;
        group.position.copy(position);
        this.scene.add(group);

        const effect: CoreBurstEffect = {
            kind: 'core',
            arcs,
            ringParticles,
            group,
            startTime: Time.now(),
            lifetime: levelConfig.lifetime,
            expansionSpeed: levelConfig.ringExpansionSpeed
        };
        this.effects.push(effect);
    }

    private spawnEnemyBurst(position: THREE.Vector3, level: number): void {
        const group = new THREE.Group();
        const levelConfig = level === 1 ? this.config.level1.enemyBurst : this.config.level2.enemyBurst;
        
        const arcs: StunArc[] = [];
        
        // Create smaller electric arcs
        const arcMaterial = new THREE.LineBasicMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        for (let i = 0; i < levelConfig.arcCount; i++) {
            const colorIndex = Math.floor(Math.random() * levelConfig.colors.length);
            const color = levelConfig.colors[colorIndex];
            if (color === undefined) continue;
            
            const segments = 8;
            const positions = new Float32Array(segments * 3);
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const line = new THREE.Line(geometry, arcMaterial.clone());
            line.material = arcMaterial.clone();
            (line.material).color.setHex(color);
            line.material.opacity = levelConfig.arcOpacity;
            group.add(line);

            arcs.push({
                line,
                material: line.material,
                segments,
                startRadius: 0.2,
                endRadius: 0.8,
                color
            });
        }

        // Create upward particles
        const particleMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles: Particle[] = [];
        for (let i = 0; i < levelConfig.particleCount; i++) {
            const colorIndex = Math.floor(Math.random() * levelConfig.colors.length);
            const color = levelConfig.colors[colorIndex];
            if (color === undefined) continue;
            
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(levelConfig.particleSize, 8, 8),
                particleMaterial.clone()
            );
            (mesh.material).color.setHex(color);
            mesh.material.opacity = levelConfig.particleOpacity;
            group.add(mesh);

            particles.push({
                mesh,
                material: mesh.material,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    1.0 + Math.random() * 0.5,
                    (Math.random() - 0.5) * 0.5
                ).normalize().multiplyScalar(2.0),
                startScale: 1.0,
                endScale: 0.5
            });
        }

        if (!this.scene) return;
        group.position.copy(position);
        this.scene.add(group);

        const effect: EnemyBurstEffect = {
            kind: 'enemy',
            arcs,
            particles,
            group,
            startTime: Time.now(),
            lifetime: levelConfig.lifetime
        };
        this.effects.push(effect);
    }

    public update(): void {
        if (this.effects.length === 0) return;
        const now = Time.now();
        const deltaTime = Time.getDeltaTime();

        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            if (!effect) continue;
            
            const t = (now - effect.startTime) / effect.lifetime;

            if (t >= 1) {
                // Cleanup expired effect
                if (this.scene) {
                    this.scene.remove(effect.group);
                }
                effect.group.clear();
                
                // Dispose materials
                if (effect.kind === 'core') {
                    effect.arcs.forEach(arc => arc.material.dispose());
                    effect.ringParticles.forEach(p => {
                        p.material.dispose();
                        p.mesh.geometry.dispose();
                    });
                } else {
                    effect.arcs.forEach(arc => arc.material.dispose());
                    effect.particles.forEach(p => {
                        p.material.dispose();
                        p.mesh.geometry.dispose();
                    });
                }
                
                this.effects.splice(i, 1);
                continue;
            }

            // Animate based on effect type
            if (effect.kind === 'core') {
                this.updateCoreBurst(effect, t, deltaTime);
            } else {
                this.updateEnemyBurst(effect, t, deltaTime);
            }
        }
    }

    private updateCoreBurst(effect: CoreBurstEffect, t: number, deltaTime: number): void {
        // Animate arcs
        effect.arcs.forEach(arc => {
            const easedT = 1 - Math.pow(1 - t, 2);
            const radius = THREE.MathUtils.lerp(arc.startRadius, arc.endRadius, easedT);
            
            const positions = (arc.line.geometry).attributes['position'] as THREE.BufferAttribute;
            for (let s = 0; s < arc.segments; s++) {
                const segmentT = s / (arc.segments - 1);
                const angle = Math.random() * Math.PI * 2;
                const r = radius * (0.8 + Math.random() * 0.4) * segmentT;
                const y = (Math.random() - 0.5) * radius * 0.3;
                const jitter = Math.random() * 0.15;
                positions.setXYZ(s, 
                    Math.cos(angle) * r + (Math.random() - 0.5) * jitter,
                    y + (Math.random() - 0.5) * jitter,
                    Math.sin(angle) * r + (Math.random() - 0.5) * jitter
                );
            }
            positions.needsUpdate = true;
            
            // Fade out
            const firstArc = effect.arcs[0];
            if (firstArc) {
                arc.material.opacity = (1 - t) * firstArc.material.opacity;
            }
        });

        // Animate ring particles
        effect.ringParticles.forEach(particle => {
            const easedT = 1 - Math.pow(1 - t, 2);
            const scale = THREE.MathUtils.lerp(particle.startScale, particle.endScale, easedT);
            particle.mesh.scale.setScalar(scale);
            
            particle.mesh.position.addScaledVector(particle.velocity, effect.expansionSpeed * deltaTime);
            
            const firstParticle = effect.ringParticles[0];
            if (firstParticle) {
                particle.material.opacity = (1 - t) * firstParticle.material.opacity;
            }
        });
    }

    private updateEnemyBurst(effect: EnemyBurstEffect, t: number, deltaTime: number): void {
        // Animate arcs
        effect.arcs.forEach(arc => {
            const easedT = 1 - Math.pow(1 - t, 2);
            const radius = THREE.MathUtils.lerp(arc.startRadius, arc.endRadius, easedT);
            
            const positions = (arc.line.geometry).attributes['position'] as THREE.BufferAttribute;
            for (let s = 0; s < arc.segments; s++) {
                const segmentT = s / (arc.segments - 1);
                const angle = Math.random() * Math.PI * 2;
                const r = radius * (0.8 + Math.random() * 0.4) * segmentT;
                const y = (Math.random() - 0.5) * radius * 0.3;
                const jitter = Math.random() * 0.1;
                positions.setXYZ(s, 
                    Math.cos(angle) * r + (Math.random() - 0.5) * jitter,
                    y + (Math.random() - 0.5) * jitter,
                    Math.sin(angle) * r + (Math.random() - 0.5) * jitter
                );
            }
            positions.needsUpdate = true;
            
            // Fade out
            const firstArc = effect.arcs[0];
            if (firstArc) {
                arc.material.opacity = (1 - t) * firstArc.material.opacity;
            }
        });

        // Animate particles
        effect.particles.forEach(particle => {
            particle.mesh.position.addScaledVector(particle.velocity, deltaTime);
            
            const gravity = -3.0;
            particle.velocity.y += gravity * deltaTime;
            
            const firstParticle = effect.particles[0];
            if (firstParticle) {
                particle.material.opacity = (1 - t) * firstParticle.material.opacity;
            }
        });
    }

    public destroy(): void {
        this.eventDispatcher.deregisterListener('StunPulseVFXSystem');
        
        // Cleanup remaining effects
        for (const effect of this.effects) {
            if (!effect) continue;
            if (this.scene && effect.group.parent) {
                this.scene.remove(effect.group);
            }
            effect.group.clear();
            
            if (effect.kind === 'core') {
                effect.arcs.forEach(arc => arc.material.dispose());
                effect.ringParticles.forEach(p => {
                    p.material.dispose();
                    p.mesh.geometry.dispose();
                });
            } else {
                effect.arcs.forEach(arc => arc.material.dispose());
                effect.particles.forEach(p => {
                    p.material.dispose();
                    p.mesh.geometry.dispose();
                });
            }
        }
        this.effects = [];
    }
}

