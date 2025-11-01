/**
 * Configuration for meta progression point awards and upgrade costs.
 * All values should be tuned for balanced progression.
 */
export interface KillMilestone {
    kills: number;
    points: number;
}

export interface WaveMilestone {
    wave: number;
    points: number;
}

export interface UpgradeCost {
    killPoints?: number;
    wavePoints?: number;
}

export interface LevelBasedCost {
    [level: number]: UpgradeCost; // level number (1, 2, 3) -> cost for that level
}

export interface MetaPointsConfig {
    killMilestones: KillMilestone[];
    waveMilestones: WaveMilestone[];
    upgradeCosts: { [upgradeId: string]: UpgradeCost | LevelBasedCost };
}

export const defaultMetaPointsConfig: MetaPointsConfig = {
    killMilestones: [
        { kills: 10, points: 2 },
        { kills: 25, points: 3 },
        { kills: 50, points: 5 },
        { kills: 100, points: 10 },
        { kills: 200, points: 20 },
        { kills: 500, points: 50 },
    ],
    waveMilestones: [
        { wave: 1, points: 1 },
        { wave: 5, points: 2 },
        { wave: 10, points: 5 },
        { wave: 15, points: 10 },
        { wave: 20, points: 20 },
        { wave: 25, points: 30 },
    ],
    upgradeCosts: {
        // Level-based upgrades (costs per level)
        'melee-range': {
            1: { killPoints: 1 },  // Level 1 (Ring 1)
            2: { killPoints: 2 },  // Level 2 (Ring 2)
            3: { killPoints: 5 },  // Level 3 (Ring 3)
        },
        'stun-pulse': {
            1: { killPoints: 2 },  // Level 1 (Stun within rings 0-2)
            2: { wavePoints: 5 },  // Level 2 (Stun ALL enemies)
        },
        'melee-damage': {
            1: { killPoints: 1 },  // Level 1 (+25 damage)
            2: { killPoints: 2 },  // Level 2 (+50 damage)
            3: { killPoints: 3 },  // Level 3 (+75 damage)
            4: { killPoints: 4 },  // Level 4 (+100 damage)
            5: { killPoints: 5 },  // Level 5 (+125 damage)
        },
        'melee-knockback': {
            1: { killPoints: 1 },  // Level 1 (+1 knockback distance)
            2: { killPoints: 3 },  // Level 2 (+2 knockback distance)
            3: { killPoints: 5 },  // Level 3 (+3 knockback distance)
        },
        'multi-melee': {
            1: { killPoints: 1 },  // Level 1 (1 extra target)
            2: { killPoints: 2 },  // Level 2 (2 extra targets)
            3: { killPoints: 3 },  // Level 3 (3 extra targets)
            4: { killPoints: 4 },  // Level 4 (4 extra targets)
            5: { killPoints: 5 },  // Level 5 (5 extra targets)
        },
        // Single-level upgrades (no levels)
        'advanced-melee-targeting': { wavePoints: 1 },
    },
};

