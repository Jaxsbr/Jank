import { defaultMetaPointsConfig, LevelBasedCost, UpgradeCost } from '../entities/config/MetaPointsConfig';

/**
 * Singleton service for managing meta progression points and upgrades.
 * Persists data to localStorage for cross-session persistence.
 */
export interface PurchasedUpgrades {
    [upgradeId: string]: number; // upgradeId -> level (e.g., 'ring-1': 1, 'ring-2': 1)
}

class MetaPointsService {
    private static instance: MetaPointsService;
    private readonly STORAGE_KEY_KILL_POINTS = 'metaKillPoints';
    private readonly STORAGE_KEY_WAVE_POINTS = 'metaWavePoints';
    private readonly STORAGE_KEY_UPGRADES = 'metaUpgrades';
    private readonly STORAGE_KEY_KILL_MILESTONE = 'metaKillMilestoneReached';
    private readonly STORAGE_KEY_WAVE_MILESTONE = 'metaWaveMilestoneReached';

    private killPoints: number = 0;
    private wavePoints: number = 0;
    private purchasedUpgrades: PurchasedUpgrades = {};
    private highestKillMilestone: number = 0;
    private highestWaveMilestone: number = 0;

    private constructor() {
        this.loadFromStorage();
    }

    public static getInstance(): MetaPointsService {
        if (!MetaPointsService.instance) {
            MetaPointsService.instance = new MetaPointsService();
        }
        return MetaPointsService.instance;
    }

    private loadFromStorage(): void {
        try {
            const killPointsStr = localStorage.getItem(this.STORAGE_KEY_KILL_POINTS);
            const wavePointsStr = localStorage.getItem(this.STORAGE_KEY_WAVE_POINTS);
            const upgradesStr = localStorage.getItem(this.STORAGE_KEY_UPGRADES);
            const killMilestoneStr = localStorage.getItem(this.STORAGE_KEY_KILL_MILESTONE);
            const waveMilestoneStr = localStorage.getItem(this.STORAGE_KEY_WAVE_MILESTONE);

            this.killPoints = killPointsStr ? parseInt(killPointsStr, 10) : 0;
            this.wavePoints = wavePointsStr ? parseInt(wavePointsStr, 10) : 0;
            this.purchasedUpgrades = upgradesStr ? (JSON.parse(upgradesStr) as PurchasedUpgrades) : {};
            this.highestKillMilestone = killMilestoneStr ? parseInt(killMilestoneStr, 10) : 0;
            this.highestWaveMilestone = waveMilestoneStr ? parseInt(waveMilestoneStr, 10) : 0;
        } catch (error) {
            console.warn('Failed to load meta progression data from localStorage:', error);
            this.reset();
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY_KILL_POINTS, this.killPoints.toString());
            localStorage.setItem(this.STORAGE_KEY_WAVE_POINTS, this.wavePoints.toString());
            localStorage.setItem(this.STORAGE_KEY_UPGRADES, JSON.stringify(this.purchasedUpgrades));
            localStorage.setItem(this.STORAGE_KEY_KILL_MILESTONE, this.highestKillMilestone.toString());
            localStorage.setItem(this.STORAGE_KEY_WAVE_MILESTONE, this.highestWaveMilestone.toString());
        } catch (error) {
            console.warn('Failed to save meta progression data to localStorage:', error);
        }
    }

    public getKillPoints(): number {
        return this.killPoints;
    }

    public getWavePoints(): number {
        return this.wavePoints;
    }

    public addKillPoints(amount: number): void {
        this.killPoints += amount;
        this.saveToStorage();
    }

    public addWavePoints(amount: number): void {
        this.wavePoints += amount;
        this.saveToStorage();
    }

    public spendKillPoints(cost: number): boolean {
        if (this.killPoints >= cost) {
            this.killPoints -= cost;
            this.saveToStorage();
            return true;
        }
        return false;
    }

    public spendWavePoints(cost: number): boolean {
        if (this.wavePoints >= cost) {
            this.wavePoints -= cost;
            this.saveToStorage();
            return true;
        }
        return false;
    }

    public getPurchasedUpgradeLevel(upgradeId: string): number {
        return this.purchasedUpgrades[upgradeId] ?? 0;
    }

    public getPurchasedUpgrades(): PurchasedUpgrades {
        return { ...this.purchasedUpgrades };
    }

    public purchaseUpgrade(upgradeId: string, level: number): void {
        this.purchasedUpgrades[upgradeId] = level;
        this.saveToStorage();
    }

    public getHighestKillMilestone(): number {
        return this.highestKillMilestone;
    }

    public getHighestWaveMilestone(): number {
        return this.highestWaveMilestone;
    }

    public setHighestKillMilestone(milestone: number): void {
        this.highestKillMilestone = milestone;
        this.saveToStorage();
    }

    public setHighestWaveMilestone(milestone: number): void {
        this.highestWaveMilestone = milestone;
        this.saveToStorage();
    }

    /**
     * Helper method to check if a cost is level-based
     */
    private isLevelBasedCost(cost: LevelBasedCost | UpgradeCost): cost is LevelBasedCost {
        return typeof cost === 'object' && cost !== null && Object.keys(cost).every(key => !isNaN(Number(key)));
    }

    /**
     * Helper method to get the cost for a specific upgrade level
     */
    private getUpgradeCostForLevel(upgradeId: string, level: number): UpgradeCost | undefined {
        const costConfig = defaultMetaPointsConfig.upgradeCosts[upgradeId];
        if (!costConfig) return undefined;

        if (this.isLevelBasedCost(costConfig)) {
            return costConfig[level];
        } else {
            return costConfig;
        }
    }

    /**
     * Resets all purchased upgrades and refunds all spent points.
     * Calculates the total cost of all purchased upgrade levels and refunds them.
     */
    public resetAllUpgrades(): void {
        let totalKillPointsRefund = 0;
        let totalWavePointsRefund = 0;

        // Calculate refunds for each purchased upgrade
        for (const [upgradeId, level] of Object.entries(this.purchasedUpgrades)) {
            // Sum costs for all levels purchased (from 1 to current level)
            for (let currentLevel = 1; currentLevel <= level; currentLevel++) {
                const cost = this.getUpgradeCostForLevel(upgradeId, currentLevel);
                if (cost) {
                    if (cost.killPoints) {
                        totalKillPointsRefund += cost.killPoints;
                    }
                    if (cost.wavePoints) {
                        totalWavePointsRefund += cost.wavePoints;
                    }
                }
            }
        }

        // Refund the points
        this.killPoints += totalKillPointsRefund;
        this.wavePoints += totalWavePointsRefund;

        // Clear all purchased upgrades
        this.purchasedUpgrades = {};

        // Save to storage
        this.saveToStorage();
    }

    public clearAllData(): void {
        this.reset();
        try {
            localStorage.removeItem(this.STORAGE_KEY_KILL_POINTS);
            localStorage.removeItem(this.STORAGE_KEY_WAVE_POINTS);
            localStorage.removeItem(this.STORAGE_KEY_UPGRADES);
            localStorage.removeItem(this.STORAGE_KEY_KILL_MILESTONE);
            localStorage.removeItem(this.STORAGE_KEY_WAVE_MILESTONE);
        } catch (error) {
            console.warn('Failed to clear meta progression data from localStorage:', error);
        }
    }

    private reset(): void {
        this.killPoints = 0;
        this.wavePoints = 0;
        this.purchasedUpgrades = {};
        this.highestKillMilestone = 0;
        this.highestWaveMilestone = 0;
    }
}

export const metaPointsService = MetaPointsService.getInstance();

