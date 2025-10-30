import { Entity } from '../../ecs/Entity';
import { MetaUpgradeComponent } from '../../entities/components/MetaUpgradeComponent';
import { TeamComponent } from '../../entities/components/TeamComponent';
import { TileComponent } from '../components/TileComponent';
import { TileVisualComponent } from '../components/TileVisualComponent';
import { TileRangeRingConfig, defaultTileRangeRingConfig } from '../configs/TileRangeRingConfig';

export class TileRangeRingSystem {
    private config: TileRangeRingConfig;

    constructor(config: TileRangeRingConfig = defaultTileRangeRingConfig) {
        this.config = config;
    }

    public update(tileEntities: readonly Entity[], allEntities: readonly Entity[]): void {
        const core = allEntities.find((e) => e.getComponent(TeamComponent)?.isCore());
        let meleeRings = 1;

        if (core) {
            const meta = core.getComponent(MetaUpgradeComponent);
            if (meta) {
                meleeRings = Math.max(1, Math.min(this.config.maxRings, meta.getMeleeRangeRings()));
            }
        }

        for (const tile of tileEntities) {
            const tileComp = tile.getComponent(TileComponent);
            const visual = tile.getComponent(TileVisualComponent);
            if (!tileComp || !visual) continue;

            const ringIndex = tileComp.getDistanceFromCenter();
            let overlay = 0;

            if (ringIndex >= 1 && ringIndex <= meleeRings) {
                if (ringIndex === 1) overlay = this.config.ring1;
                else if (ringIndex === 2) overlay = this.config.ring2;
                else if (ringIndex === 3) overlay = this.config.ring3;
            }

            visual.setRangeOverlayIntensity(overlay);
        }
    }
}


