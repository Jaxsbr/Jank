import { Entity } from '../../ecs/Entity';
import { IEntitySystem } from '../../ecs/IEntitySystem';
import { Event } from '../../systems/eventing/Event';
import { GlobalEventDispatcher } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { hexRingsToWorldRadius } from '../../utils/SpatialConfig';
import { SpatialQuery } from '../../utils/SpatialQuery';
import { Time } from '../../utils/Time';
import { AbilityComponent } from '../components/AbilityComponent';
import { MetaUpgradeComponent } from '../components/MetaUpgradeComponent';
import { PositionComponent } from '../components/PositionComponent';
import { StunComponent } from '../components/StunComponent';
import { TeamComponent } from '../components/TeamComponent';
import { AbilityConfig, abilityConfigByLevel } from '../config/AbilityConfig';

export class AbilitySystem implements IEntitySystem {
    private pendingActivation: boolean = false;

    constructor() {}

    public activateAbility(): void {
        this.pendingActivation = true;
    }

    public update(entities: readonly Entity[]): void {
        if (!this.pendingActivation) return;

        const currentTime = Time.now();

        // Find the core entity
        const core = entities.find(e => {
            const team = e.getComponent(TeamComponent);
            return team?.isCore();
        });

        if (!core) {
            this.pendingActivation = false;
            return;
        }

        const abilityComp: AbilityComponent | null = core.getComponent(AbilityComponent);
        const metaComp: MetaUpgradeComponent | null = core.getComponent(MetaUpgradeComponent);
        
        if (!abilityComp || !metaComp) {
            this.pendingActivation = false;
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const stunLevel: number = (metaComp as MetaUpgradeComponent).getStunPulseLevel();
        if (stunLevel <= 0) {
            this.pendingActivation = false;
            return;
        }

        if (!abilityComp.canUse(currentTime)) {
            this.pendingActivation = false;
            return;
        }

        const level: 1 | 2 | undefined = stunLevel === 1 || stunLevel === 2 ? stunLevel : undefined;
        if (!level) {
            this.pendingActivation = false;
            return;
        }

        const config = abilityConfigByLevel[level];
        if (!config) {
            this.pendingActivation = false;
            return;
        }

        // Execute the stun pulse
        this.executeStunPulse(core, entities, config, currentTime, stunLevel);

        // Mark ability as used
        abilityComp.use(currentTime);
        this.pendingActivation = false;
    }

    private executeStunPulse(core: Entity, entities: readonly Entity[], config: AbilityConfig, currentTime: number, stunLevel: number): void {
        const positionComp = core.getComponent(PositionComponent);
        if (!positionComp) return;

        const centerPos = positionComp.toVector3();

        // Apply stun to enemies based on positions
        let affectedEnemies: Entity[];
        
        if (config.stunRadius === -1) {
            // Level 2: stun ALL enemies
            affectedEnemies = entities.filter(e => {
                const team = e.getComponent(TeamComponent);
                return team?.isEnemy();
            });
        } else {
            // Level 1: stun enemies in radius
            const stunRadius3D = hexRingsToWorldRadius(config.stunRadius);
            affectedEnemies = SpatialQuery.getEntitiesInRadius2D(entities, centerPos, stunRadius3D)
                .filter(e => {
                    const team = e.getComponent(TeamComponent);
                    return team?.isEnemy();
                });
        }

        affectedEnemies.forEach(enemy => {
            let stunComp = enemy.getComponent(StunComponent);
            if (!stunComp) {
                stunComp = new StunComponent(currentTime + config.stunDuration);
                enemy.addComponent(stunComp);
            } else {
                stunComp.setStunExpiryTime(currentTime + config.stunDuration);
            }
        });

        // Dispatch stun pulse activated event for VFX
        const affectedEnemyIds = affectedEnemies.map(e => e.getId());
        GlobalEventDispatcher.dispatch(new Event(EventType.StunPulseActivated, {
            corePosition: centerPos,
            affectedEnemyIds: affectedEnemyIds,
            stunLevel: stunLevel
        }));
    }
}

