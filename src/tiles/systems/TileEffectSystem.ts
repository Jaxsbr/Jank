import * as THREE from 'three';
import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { TileComponent } from '../components/TileComponent';
import { TileEffectComponent } from '../components/TileEffectComponent';
import { TileVisualComponent } from '../components/TileVisualComponent';

export class TileEffectSystem implements IEntitySystem {
    private effectRadius: number;
    private effectCooldown: number;

    constructor(effectRadius: number = 2.0, effectCooldown: number = 1.0) {
        this.effectRadius = effectRadius;
        this.effectCooldown = effectCooldown;
    }

    update(entities: readonly Entity[]): void {
        const currentTime = performance.now() / 1000; // Convert to seconds

        entities.forEach(entity => {
            if (entity.hasComponent(TileComponent) && entity.hasComponent(TileEffectComponent)) {
                console.log('Processing tile with effect component');
                const tileComponent = entity.getComponent(TileComponent);
                const effectComponent = entity.getComponent(TileEffectComponent);
                const visualComponent = entity.getComponent(TileVisualComponent);
                
                if (tileComponent && effectComponent) {
                    // Update effect state
                    effectComponent.update(currentTime);
                    
                    // Update visual effects based on effect type
                    this.updateVisualEffects(visualComponent, effectComponent, currentTime);
                    
                    // Process effect activation
                    this.processEffectActivation(tileComponent, effectComponent, currentTime);
                }
            }
        });
    }

    /**
     * Update visual effects based on tile effect type
     */
    private updateVisualEffects(
        visualComponent: TileVisualComponent | null, 
        effectComponent: TileEffectComponent, 
        currentTime: number
    ): void {
        if (!visualComponent) return;

        const effectType = effectComponent.getEffectType();
        const isActive = effectComponent.getIsActive();
        
        // Update emissive color based on effect type and state
        if (isActive) {
            switch (effectType) {
                case 'attack':
                    console.log('Setting attack tile emissive - base color:', visualComponent.getTileMesh().material.color.getHexString());
                    visualComponent.setEmissive(0xff4444, 0.5); // Red glow
                    break;
                case 'buff':
                    visualComponent.setEmissive(0x44ff44, 0.3); // Green glow
                    break;
                case 'heal':
                    visualComponent.setEmissive(0x4444ff, 0.4); // Blue glow
                    break;
                case 'shield':
                    visualComponent.setEmissive(0xffff44, 0.6); // Yellow glow
                    break;
                case 'speed':
                    visualComponent.setEmissive(0xff44ff, 0.4); // Magenta glow
                    break;
            }
        } else {
            // Fade out emissive effect
            const timeSinceActivation = effectComponent.getTimeSinceLastActivation(currentTime);
            const fadeTime = 0.5; // 0.5 seconds fade
            const fadeProgress = Math.min(1, timeSinceActivation / fadeTime);
            const material = visualComponent.getTileMesh().material as THREE.MeshStandardMaterial;
            const currentEmissive = material.emissiveIntensity;
            const newEmissive = currentEmissive * (1 - fadeProgress);
            visualComponent.setEmissive(0x000000, newEmissive);
        }
    }

    /**
     * Process effect activation logic
     */
    private processEffectActivation(
        tileComponent: TileComponent, 
        effectComponent: TileEffectComponent, 
        currentTime: number
    ): void {
        // TODO: Implement effect activation logic
        // This would handle:
        // - Triggering effects on nearby entities
        // - Managing effect cooldowns
        // - Spawning projectiles for attack effects
        // - Applying buffs to player
        // - Healing player for heal effects
        
        // For now, just check if effect can be activated
        if (effectComponent.canActivate(currentTime)) {
            // Effect is ready to be activated
            // In a real implementation, this would be triggered by player actions
            // or automatic activation based on game rules
        }
    }

    /**
     * Activate a tile effect
     */
    public activateTileEffect(entity: Entity, currentTime: number): boolean {
        const effectComponent = entity.getComponent(TileEffectComponent);
        if (effectComponent) {
            return effectComponent.activate(currentTime);
        }
        return false;
    }

    /**
     * Get all active effects in a radius
     */
    public getActiveEffectsInRadius(centerEntity: Entity, radius: number): Entity[] {
        // TODO: Implement spatial query to get tiles in radius
        // This would use the TileGrid to find nearby tiles with active effects
        return [];
    }

    /**
     * Set effect radius
     */
    public setEffectRadius(radius: number): void {
        this.effectRadius = Math.max(0, radius);
    }

    /**
     * Set effect cooldown
     */
    public setEffectCooldown(cooldown: number): void {
        this.effectCooldown = Math.max(0, cooldown);
    }

    /**
     * Get effect radius
     */
    public getEffectRadius(): number {
        return this.effectRadius;
    }

    /**
     * Get effect cooldown
     */
    public getEffectCooldown(): number {
        return this.effectCooldown;
    }
}
