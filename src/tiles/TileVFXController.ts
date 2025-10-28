import * as THREE from 'three';
import { Entity } from '../ecs/Entity';
import { Event } from '../systems/eventing/Event';
import { EventDispatcherSingleton } from '../systems/eventing/EventDispatcher';
import { EventType } from '../systems/eventing/EventType';
import { IEventListener } from '../systems/eventing/IEventListener';
import { TileGrid } from './TileGrid';
import { TileComponent } from './components/TileComponent';
import { TileVisualComponent } from './components/TileVisualComponent';

export interface VFXConfig {
    pulseStrength: number;
    pulseFalloff: number;
    pulseDecayPerSecond: number;
    shockwaveStrength: number;
    shockwaveRadius: number;
    shockwaveDecayPerSecond: number;
}

export interface ActiveWave {
    kind: 'ripple' | 'shock' | 'burst';
    origin: THREE.Vector3;
    radius: number;
    speed: number;
    strength: number;
    falloff: number;
    alive: boolean;
    maxRadius: number;
}

export class TileVFXController implements IEventListener {
    private eventDispatcher: EventDispatcherSingleton;
    private tiles: Entity[] = [];
    private config: VFXConfig;
    private centerPosition: THREE.Vector3;
    private activeWaves: ActiveWave[] = [];

    constructor(eventDispatcher: EventDispatcherSingleton, config?: Partial<VFXConfig>) {
        this.eventDispatcher = eventDispatcher;
        this.config = {
            pulseStrength: 2.0,
            pulseFalloff: 0.6,
            pulseDecayPerSecond: 3.0,
            shockwaveStrength: 1.8,
            shockwaveRadius: 10.0,
            shockwaveDecayPerSecond: 2.0,
            ...config
        };
        this.centerPosition = new THREE.Vector3(0, 0, 0);

        // Register as a listener with the global dispatcher
        this.eventDispatcher.registerListener('TileVFXController', this);
    }

    /**
     * Set the tiles array for VFX operations
     */
    public setTiles(tiles: Entity[]): void {
        this.tiles = tiles;
        this.detectCenterPosition();
    }

    /**
     * Set center position from tile grid
     */
    public setCenterFromGrid(tileGrid: TileGrid): void {
        const centerTile = tileGrid.getCenterTile();
        if (centerTile) {
            const visualComponent = centerTile.getComponent(TileVisualComponent);
            if (visualComponent) {
                this.centerPosition = visualComponent.getPosition();
            }
        }
    }

    /**
     * Detect center position from tiles
     */
    private detectCenterPosition(): void {
        const centerTile = this.tiles.find(tile => {
            const tileComponent = tile.getComponent(TileComponent);
            return tileComponent && tileComponent.isCenterTile();
        });
        
        if (centerTile) {
            const visualComponent = centerTile.getComponent(TileVisualComponent);
            if (visualComponent) {
                this.centerPosition = visualComponent.getPosition();
            }
        }
    }

    /**
     * Emit a ripple effect from the center
     */
    public emitRippleFromCenter(strength: number = 1.0, speed: number = 5.0, falloff: number = 0.8): void {
        const wave: ActiveWave = {
            kind: 'ripple',
            origin: this.centerPosition.clone(),
            radius: 0,
            speed: speed,
            strength: strength,
            falloff: falloff,
            alive: true,
            maxRadius: 15.0
        };
        this.activeWaves.push(wave);
    }

    /**
     * Emit a shockwave effect from the given origin
     */
    public emitShockwave(origin: THREE.Vector3, strength: number = 0.9, radius: number = 10.0, speed: number = 8.0): void {
        const wave: ActiveWave = {
            kind: 'shock',
            origin: origin.clone(),
            radius: 0,
            speed: speed,
            strength: strength,
            falloff: 0.6,
            alive: true,
            maxRadius: radius
        };
        this.activeWaves.push(wave);
    }

    /**
     * Emit a local burst effect from the given origin
     */
    public emitLocalBurst(origin: THREE.Vector3, strength: number = 0.7): void {
        const wave: ActiveWave = {
            kind: 'burst',
            origin: origin.clone(),
            radius: 0,
            speed: 12.0,
            strength: strength,
            falloff: 0.4,
            alive: true,
            maxRadius: 5.0
        };
        this.activeWaves.push(wave);
    }

    /**
     * Handle dispatched events
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.CoreSpecialAttack) {
            const position = (event.args['position'] as THREE.Vector3) || undefined;
            const strength = (event.args['strength'] as number) || this.config.pulseStrength;
            if (position) {
                this.emitRippleFromCenter(strength, 5.0, this.config.pulseFalloff);
            }
        } else if (event.eventName === EventType.CoreHit) {
            const position = (event.args['position'] as THREE.Vector3) || undefined;
            const strength = (event.args['strength'] as number) || this.config.shockwaveStrength;
            if (position) {
                this.emitShockwave(position, strength, this.config.shockwaveRadius, 8.0);
            }
        }
    }

    /**
     * Clean up listener registration
     */
    public destroy(): void {
        this.eventDispatcher.deregisterListener('TileVFXController');
    }

    /**
     * Update VFX waves and apply effects to tiles
     */
    public update(deltaTime: number): void {
        // Update active waves
        for (let i = this.activeWaves.length - 1; i >= 0; i--) {
            const wave = this.activeWaves[i];
            if (!wave) continue;
            
            // Advance wave radius
            wave.radius += wave.speed * deltaTime;
            
            // Check if wave has reached max radius
            if (wave.radius >= wave.maxRadius) {
                this.activeWaves.splice(i, 1);
                continue;
            }
            
            // Apply wave effect to tiles
            this.applyWaveToTiles(wave);
        }
        
        // Reset tile glow intensities for next frame
        this.tiles.forEach(tile => {
            const visualComponent = tile.getComponent(TileVisualComponent);
            if (visualComponent) {
                visualComponent.setTargetGlowIntensity(0);
            }
        });
    }

    /**
     * Apply wave effect to all tiles
     */
    private applyWaveToTiles(wave: ActiveWave): void {
        this.tiles.forEach(tile => {
            const tileComponent = tile.getComponent(TileComponent);
            const visualComponent = tile.getComponent(TileVisualComponent);

            if (!tileComponent || !visualComponent) return;

            // Skip center tile for most effects
            if (tileComponent.isCenterTile() && wave.kind !== 'ripple') return;

            const tilePosition = visualComponent.getPosition();
            const distance = wave.origin.distanceTo(tilePosition);
            
            // Calculate wave intensity based on distance from wavefront
            const wavefrontDistance = Math.abs(distance - wave.radius);
            const intensity = this.calculateWaveIntensity(wave, wavefrontDistance);
            
            if (intensity > 0) {
                const currentIntensity = visualComponent.getTargetGlowIntensity();
                visualComponent.setTargetGlowIntensity(Math.max(currentIntensity, intensity));
            }
        });
    }

    /**
     * Calculate wave intensity based on wavefront distance
     */
    private calculateWaveIntensity(wave: ActiveWave, wavefrontDistance: number): number {
        const waveWidth = 2.0; // Width of the wave effect
        if (wavefrontDistance > waveWidth) return 0;
        
        const normalizedDistance = wavefrontDistance / waveWidth;
        const baseIntensity = wave.strength * Math.pow(1.0 - normalizedDistance, wave.falloff);
        
        // Add some variation based on wave type
        switch (wave.kind) {
            case 'ripple':
                return baseIntensity * 1.5; // Stronger ripple
            case 'shock':
                return baseIntensity * 2.0; // Much stronger shockwave
            case 'burst':
                return baseIntensity * 1.8; // Stronger burst
            default:
                return baseIntensity;
        }
    }

    /**
     * Set VFX configuration
     */
    public setConfig(config: Partial<VFXConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get current VFX configuration
     */
    public getConfig(): VFXConfig {
        return { ...this.config };
    }
}
