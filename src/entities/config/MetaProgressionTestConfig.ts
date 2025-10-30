export type TestAward = 'multiMelee' | 'ring2MeleeRange';

export interface MetaProgressionTestConfig {
    killMilestones: number[];
    awards: TestAward[];
}

export const defaultMetaProgressionTestConfig: MetaProgressionTestConfig = {
    killMilestones: [10, 20],
    awards: ['multiMelee', 'ring2MeleeRange'],
};


