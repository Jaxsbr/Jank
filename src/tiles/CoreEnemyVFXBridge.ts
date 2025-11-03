import { Entity } from '../ecs/Entity';
import { PositionComponent } from '../entities/components/PositionComponent';
import { TeamComponent, TeamType } from '../entities/components/TeamComponent';
import { Event } from '../systems/eventing/Event';
import { EventDispatcherSingleton } from '../systems/eventing/EventDispatcher';
import { EventType } from '../systems/eventing/EventType';
import { IEventListener } from '../systems/eventing/IEventListener';
import { TileVFXController } from '../tiles/TileVFXController';

/**
 * Bridge between attack/damage events and tile VFX
 */
export class CoreEnemyVFXBridge implements IEventListener {
    private eventDispatcher: EventDispatcherSingleton;
    private tileVFXController: TileVFXController;

    constructor(eventDispatcher: EventDispatcherSingleton, tileVFXController: TileVFXController) {
        this.eventDispatcher = eventDispatcher;
        this.tileVFXController = tileVFXController;
        
        // Register as event listener
        this.eventDispatcher.registerListener('CoreEnemyVFXBridge', this);
    }

    /**
     * Handle attack and damage events
     */
    public onEvent(event: Event): void {
        if (event.eventName === EventType.AttackExecuted) {
            this.handleAttackExecuted(event);
        } else if (event.eventName === EventType.DamageTaken) {
            this.handleDamageTaken(event);
        } else if (event.eventName === EventType.RangedAttackExecuted) {
            this.handleRangedAttackExecuted();
        } else if (event.eventName === EventType.ChargerExplosion) {
            this.handleChargerExplosion(event);
        }
    }

    /**
     * Handle attack executed event
     */
    private handleAttackExecuted(event: Event): void {
        const attacker = event.args['attacker'] as Entity;
        const target = event.args['target'] as Entity;
        
        if (!attacker || !target) return;

        const attackerTeam = attacker.getComponent(TeamComponent);
        const attackerPosition = attacker.getComponent(PositionComponent);
        
        if (!attackerTeam || !attackerPosition) return;

        // Attacker world position not needed here currently

        if (attackerTeam.getTeamType() === TeamType.CORE) {
            // Core attack - emit ripple from center
            this.tileVFXController.emitRippleFromCenter(1.0, 5.0, 0.8);
        } else if (attackerTeam.getTeamType() === TeamType.ENEMY) {
            // Enemy attack - emit local burst at impact point
            const targetPosition = target.getComponent(PositionComponent);
            if (targetPosition) {
                const impactPos = targetPosition.toVector3();
                this.tileVFXController.emitLocalBurst(impactPos, 0.7);
            }
        }
    }

    /**
     * Handle damage taken event
     */
    private handleDamageTaken(event: Event): void {
        const target = event.args['target'] as Entity;
        
        if (!target) return;

        const targetTeam = target.getComponent(TeamComponent);
        const targetPosition = target.getComponent(PositionComponent);
        
        if (!targetTeam || !targetPosition) return;

        // Get target world position
        const targetWorldPos = targetPosition.toVector3();

        if (targetTeam.getTeamType() === TeamType.CORE) {
            // Core took damage - emit shockwave
            this.tileVFXController.emitShockwave(targetWorldPos, 0.9, 10.0, 8.0);
        }
    }

    /**
     * Handle ranged attack executed event
     */
    private handleRangedAttackExecuted(): void {
        // Flash the center tile when ranged attack is fired
        // Color matches the orange pellet projectile
        this.tileVFXController.flashCenterTile(0xFF6600, 1.5);
    }

    /**
     * Handle Charger explosion event
     */
    private handleChargerExplosion(event: Event): void {
        const attacker = event.args['attacker'] as Entity;
        
        if (!attacker) return;

        const attackerPosition = attacker.getComponent(PositionComponent);
        if (!attackerPosition) return;

        const explosionPos = attackerPosition.toVector3();
        
        // Emit orange explosion burst at charger position
        this.tileVFXController.emitLocalBurst(explosionPos, 1.5);
    }

    /**
     * Clean up event listener
     */
    public destroy(): void {
        this.eventDispatcher.deregisterListener('CoreEnemyVFXBridge');
    }
}
