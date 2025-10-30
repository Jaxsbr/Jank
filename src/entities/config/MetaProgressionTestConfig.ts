export type TestAward = 'multiMelee' | 'ring2MeleeRange' | 'ring3MeleeRange';

export interface MetaProgressionTestConfig {
    killMilestones: number[];
    awards: TestAward[];
}

export const defaultMetaProgressionTestConfig: MetaProgressionTestConfig = {
    killMilestones: [5, 10, 15],
    awards: ['ring2MeleeRange', 'ring3MeleeRange', 'multiMelee'],
};


