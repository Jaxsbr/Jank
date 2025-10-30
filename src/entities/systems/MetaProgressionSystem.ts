import { Entity } from '../../ecs/Entity';
import { Event } from '../../systems/eventing/Event';
import { EventDispatcherSingleton } from '../../systems/eventing/EventDispatcher';
import { EventType } from '../../systems/eventing/EventType';
import { IEventListener } from '../../systems/eventing/IEventListener';
import { MetaUpgradeComponent } from '../components/MetaUpgradeComponent';
import { TeamComponent } from '../components/TeamComponent';
import { defaultMetaProgressionTestConfig, MetaProgressionTestConfig } from '../config/MetaProgressionTestConfig';
import { defaultMetaUpgradeConfig } from '../config/MetaUpgradeConfig';

export class MetaProgressionSystem implements IEventListener {
    private eventDispatcher: EventDispatcherSingleton;
    private entities: readonly Entity[] = [];
    private killCount = 0;
    private nextMilestoneIndex = 0;
    private config: MetaProgressionTestConfig;

    constructor(eventDispatcher: EventDispatcherSingleton, config: MetaProgressionTestConfig = defaultMetaProgressionTestConfig) {
        this.eventDispatcher = eventDispatcher;
        this.config = config;
        this.eventDispatcher.registerListener('MetaProgressionSystem', this);
    }

    public setEntities(entities: readonly Entity[]): void {
        this.entities = entities;
    }

    public onEvent(event: Event): void {
        if (event.eventName === EventType.EnemyKilled) {
            this.handleEnemyKilled();
        }
    }

    private handleEnemyKilled(): void {
        this.killCount += 1;
        if (this.nextMilestoneIndex >= this.config.killMilestones.length) return;

        const milestone = this.config.killMilestones[this.nextMilestoneIndex];
        if (this.killCount >= milestone) {
            const award = this.config.awards[this.nextMilestoneIndex];
            this.applyAward(award);
            this.nextMilestoneIndex += 1;
        }
    }

    private applyAward(award: MetaProgressionTestConfig['awards'][number]): void {
        const core = this.entities.find(e => {
            const t = e.getComponent(TeamComponent);
            return t?.isCore();
        });
        if (!core) return;

        let meta = core.getComponent(MetaUpgradeComponent);
        if (!meta) {
            meta = new MetaUpgradeComponent(
                defaultMetaUpgradeConfig.defaultExtraMeleeTargets,
                defaultMetaUpgradeConfig.defaultMeleeRangeRings
            );
            core.addComponent(meta);
        }

        if (award === 'multiMelee') {
            const newValue = Math.min(meta.getExtraMeleeTargets() + 1, defaultMetaUpgradeConfig.maxExtraMeleeTargets);
            meta.setExtraMeleeTargets(newValue);
        } else if (award === 'ring2MeleeRange') {
            meta.setMeleeRangeRings(Math.min(2, defaultMetaUpgradeConfig.maxMeleeRangeRings));
        }
    }

    public destroy(): void {
        this.eventDispatcher.deregisterListener('MetaProgressionSystem');
    }
}


