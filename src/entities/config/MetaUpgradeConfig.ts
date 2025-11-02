export interface MetaUpgradeConfig {
    maxExtraMeleeTargets: number;
    maxMeleeRangeRings: number;
    maxStunPulseLevel: number;
    maxRangedAttackLevel: number;
    defaultExtraMeleeTargets: number;
    defaultMeleeRangeRings: number;
    defaultStunPulseLevel: number;
    defaultRangedAttackLevel: number;
}

export const defaultMetaUpgradeConfig: MetaUpgradeConfig = {
    maxExtraMeleeTargets: 5,
    maxMeleeRangeRings: 3,
    maxStunPulseLevel: 2,
    maxRangedAttackLevel: 2,
    defaultExtraMeleeTargets: 0,
    defaultMeleeRangeRings: 0,
    defaultStunPulseLevel: 0,
    defaultRangedAttackLevel: 0,
};


