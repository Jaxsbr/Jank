export interface MetaUpgradeConfig {
    maxExtraMeleeTargets: number;
    maxMeleeRangeRings: number;
    defaultExtraMeleeTargets: number;
    defaultMeleeRangeRings: number;
}

export const defaultMetaUpgradeConfig: MetaUpgradeConfig = {
    maxExtraMeleeTargets: 3,
    maxMeleeRangeRings: 3,
    defaultExtraMeleeTargets: 0,
    defaultMeleeRangeRings: 1,
};


