import { Entity } from '../../ecs/Entity';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { EntityFinder } from '../../utils/EntityFinder';
import { GeometryComponent } from '../components/GeometryComponent';
import { TeamComponent } from '../components/TeamComponent';
import { DamageVisualConfig, defaultDamageVisualConfig } from '../config/DamageVisualConfig';

interface DamageFlash {
    entity: Entity;
    originalMainColor: number;
    originalSecondaryColor: number;
    endTime: number;
}

export class DamageVisualSystem implements IEventListener {
    private damageFlashes: DamageFlash[] = [];
    private config: DamageVisualConfig;
    private eventDispatcher: EventDispatcherSingleton;
    private entities: readonly Entity[] = [];

    constructor(eventDispatcher: EventDispatcherSingleton, config: DamageVisualConfig = defaultDamageVisualConfig) {
        this.eventDispatcher = eventDispatcher;
        this.config = config;
        // Register as event listener for damage events
        this.eventDispatcher.registerListener('DamageVisualSystem', this);
    }

    /**
     * Set the entities array reference for entity lookup
     */
    public setEntities(entities: readonly Entity[]): void {
        this.entities = entities;
    }

    /**
     * Handle events from the event dispatcher
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.DamageTaken) {
            this.handleDamageTaken(event);
        }
    }

    /**
     * Handle a damage taken event
     */
    private handleDamageTaken(event: Event): void {
        const targetId = event.args['targetId'] as string;
        if (!targetId) {
            return;
        }

        // Find the entity by ID
        const targetEntity = EntityFinder.findEntityById(this.entities, targetId);
        if (!targetEntity) {
            return;
        }

        this.flashEntity(targetEntity);
    }

    /**
     * Flash an entity red to indicate damage
     */
    private flashEntity(entity: Entity): void {
        const geometryComponent = entity.getComponent(GeometryComponent);
        if (!geometryComponent) {
            return;
        }

        // Determine original colors based on team type
        const teamComponent = entity.getComponent(TeamComponent);
        let originalMainColor: number;
        let originalSecondaryColor: number;
        let flashMainColor: number;
        let flashSecondaryColor: number;
        
        if (teamComponent && teamComponent.isEnemy()) {
            // Enemy entity: use enemy colors from config
            originalMainColor = this.config.teamColors.enemy.original.main;
            originalSecondaryColor = this.config.teamColors.enemy.original.secondary;
            flashMainColor = this.config.teamColors.enemy.flash.main;
            flashSecondaryColor = this.config.teamColors.enemy.flash.secondary;
        } else {
            // Core entity: use core colors from config
            originalMainColor = this.config.teamColors.core.original.main;
            originalSecondaryColor = this.config.teamColors.core.original.secondary;
            flashMainColor = this.config.teamColors.core.flash.main;
            flashSecondaryColor = this.config.teamColors.core.flash.secondary;
        }
        
        // Set flash colors
        geometryComponent.updateMainSphereColor(flashMainColor);
        geometryComponent.updateSecondaryColor(flashSecondaryColor);

        // Schedule color restoration
        const endTime = Date.now() + this.config.flashDuration;
        this.damageFlashes.push({
            entity,
            originalMainColor,
            originalSecondaryColor,
            endTime
        });
    }

    /**
     * Update visual effects (should be called every frame)
     */
    public update(): void {
        const currentTime = Date.now();
        
        // Process damage flashes
        for (let i = this.damageFlashes.length - 1; i >= 0; i--) {
            const flash = this.damageFlashes[i];
            
            if (!flash) {
                continue;
            }
            
            if (currentTime >= flash.endTime) {
                // Restore original colors
                const geometryComponent = flash.entity.getComponent(GeometryComponent);
                if (geometryComponent) {
                    geometryComponent.updateMainSphereColor(flash.originalMainColor);
                    geometryComponent.updateSecondaryColor(flash.originalSecondaryColor);
                }
                
                // Remove from array
                this.damageFlashes.splice(i, 1);
            }
        }
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        this.eventDispatcher.deregisterListener('DamageVisualSystem');
    }
}