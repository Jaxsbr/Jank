export interface MetaUpgradeConfig {
    maxExtraMeleeTargets: number;
    maxMeleeRangeRings: number;
    maxStunPulseLevel: number;
    defaultExtraMeleeTargets: number;
    defaultMeleeRangeRings: number;
    defaultStunPulseLevel: number;
}

export const defaultMetaUpgradeConfig: MetaUpgradeConfig = {
    maxExtraMeleeTargets: 5,
    maxMeleeRangeRings: 3,
    maxStunPulseLevel: 2,
    defaultExtraMeleeTargets: 0,
    defaultMeleeRangeRings: 0,
    defaultStunPulseLevel: 0,
};


