import { defaultMetaPointsConfig, LevelBasedCost } from '../entities/config/MetaPointsConfig';
import { metaPointsService } from '../utils/MetaPointsService';

export interface IUpgradeShopUICallbacks {
    onReplay: () => void;
}

interface UpgradeDefinition {
    id: string;
    name: string;
    description: string;
    maxLevel: number;
}

const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
    { id: 'melee-range', name: 'Melee Range', description: 'Extends melee range to additional rings', maxLevel: 3 },
    { id: 'stun-pulse', name: 'Stun Pulse', description: 'Stun enemies in range (level 2: all enemies)', maxLevel: 2 },
    { id: 'melee-damage', name: 'Melee Damage', description: 'Increases melee damage (+25 per level)', maxLevel: 5 },
    { id: 'melee-knockback', name: 'Melee Knockback', description: 'Knocks back enemies on hit (+1 distance per level)', maxLevel: 3 },
    { id: 'multi-melee', name: 'Multi-Melee', description: 'Hit additional nearest enemies (1 extra per level)', maxLevel: 5 },
    { id: 'advanced-melee-targeting', name: 'Advanced Melee Targeting', description: 'Unlock toggleable targeting modes: nearest enemy or lowest HP enemy', maxLevel: 1 },
];

export class UpgradeShopUI {
    private container!: HTMLDivElement;
    private isVisible: boolean = false;
    private onReplay: () => void;
    private upgradeElements: Map<string, { button: HTMLButtonElement; levelDisplay: HTMLDivElement }> = new Map();

    constructor(callbacks: IUpgradeShopUICallbacks) {
        this.onReplay = callbacks.onReplay;
        this.createUI();
    }

    private createUI(): void {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'upgrade-shop-ui';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2500;
            pointer-events: all;
            overflow-y: auto;
            padding: 40px;
        `;

        // Create content panel
        const panel = document.createElement('div');
        panel.style.cssText = `
            background: rgba(10, 10, 20, 0.95);
            border: 3px solid #40E0D0;
            border-radius: 12px;
            padding: 40px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        `;

        // Title
        const title = document.createElement('div');
        title.textContent = 'Upgrade Shop';
        title.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 48px;
            font-weight: bold;
            color: #40E0D0;
            margin-bottom: 30px;
            text-align: center;
            text-shadow: 0 0 20px rgba(64, 224, 208, 0.5);
        `;
        panel.appendChild(title);

        // Points display
        const pointsContainer = document.createElement('div');
        pointsContainer.id = 'upgrade-shop-points';
        pointsContainer.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 28px;
            color: white;
            margin-bottom: 30px;
            text-align: center;
            display: flex;
            justify-content: center;
            gap: 40px;
        `;
        panel.appendChild(pointsContainer);

        // Upgrades container
        const upgradesContainer = document.createElement('div');
        upgradesContainer.id = 'upgrade-shop-upgrades';
        upgradesContainer.style.cssText = `
            margin-bottom: 30px;
        `;
        panel.appendChild(upgradesContainer);

        // Create upgrade entries
        for (const upgrade of UPGRADE_DEFINITIONS) {
            const upgradeEntry = this.createUpgradeEntry(upgrade);
            upgradesContainer.appendChild(upgradeEntry);
        }

        // Reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Talents';
        resetButton.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 28px;
            font-weight: bold;
            color: white;
            background: rgba(255, 100, 100, 0.3);
            border: 3px solid #ff6464;
            border-radius: 8px;
            padding: 15px 50px;
            cursor: pointer;
            transition: all 0.2s;
            outline: none;
            display: block;
            margin: 0 auto 20px auto;
            width: 200px;
        `;

        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.background = 'rgba(255, 100, 100, 0.5)';
            resetButton.style.transform = 'scale(1.1)';
        });

        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.background = 'rgba(255, 100, 100, 0.3)';
            resetButton.style.transform = 'scale(1)';
        });

        resetButton.addEventListener('click', () => {
            metaPointsService.resetAllUpgrades();
            this.updateUI();
        });

        panel.appendChild(resetButton);

        // Replay button
        const replayButton = document.createElement('button');
        replayButton.textContent = 'Replay';
        replayButton.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 32px;
            font-weight: bold;
            color: white;
            background: rgba(64, 224, 208, 0.3);
            border: 3px solid #40E0D0;
            border-radius: 8px;
            padding: 15px 50px;
            cursor: pointer;
            transition: all 0.2s;
            outline: none;
            display: block;
            margin: 0 auto;
            width: 200px;
        `;

        replayButton.addEventListener('mouseenter', () => {
            replayButton.style.background = 'rgba(64, 224, 208, 0.5)';
            replayButton.style.transform = 'scale(1.1)';
        });

        replayButton.addEventListener('mouseleave', () => {
            replayButton.style.background = 'rgba(64, 224, 208, 0.3)';
            replayButton.style.transform = 'scale(1)';
        });

        replayButton.addEventListener('click', () => {
            this.onReplay();
            this.hide();
        });

        panel.appendChild(replayButton);
        this.container.appendChild(panel);
        document.body.appendChild(this.container);
    }

    private createUpgradeEntry(upgrade: UpgradeDefinition): HTMLDivElement {
        const entry = document.createElement('div');
        entry.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            border: 2px solid #40E0D0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
        `;

        // Left side: name and description
        const leftSide = document.createElement('div');
        leftSide.style.cssText = `flex: 1;`;
        
        const name = document.createElement('div');
        name.textContent = upgrade.name;
        name.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            color: #40E0D0;
            margin-bottom: 5px;
        `;
        
        const description = document.createElement('div');
        description.textContent = upgrade.description;
        description.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 18px;
            color: #aaa;
        `;
        
        leftSide.appendChild(name);
        leftSide.appendChild(description);
        entry.appendChild(leftSide);

        // Right side: level and purchase button
        const rightSide = document.createElement('div');
        rightSide.style.cssText = `display: flex; flex-direction: column; align-items: flex-end; gap: 10px;`;
        
        const levelDisplay = document.createElement('div');
        levelDisplay.id = `upgrade-level-${upgrade.id}`;
        levelDisplay.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 20px;
            color: white;
        `;
        // Hide level display for single-level upgrades
        if (upgrade.maxLevel === 1) {
            levelDisplay.style.display = 'none';
        }
        
        const purchaseButton = document.createElement('button');
        purchaseButton.id = `upgrade-button-${upgrade.id}`;
        purchaseButton.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: white;
            background: rgba(64, 224, 208, 0.3);
            border: 2px solid #40E0D0;
            border-radius: 6px;
            padding: 10px 20px;
            cursor: pointer;
            transition: all 0.2s;
            outline: none;
            min-width: 120px;
        `;

        purchaseButton.addEventListener('mouseenter', () => {
            if (!purchaseButton.disabled) {
                purchaseButton.style.background = 'rgba(64, 224, 208, 0.5)';
            }
        });

        purchaseButton.addEventListener('mouseleave', () => {
            if (!purchaseButton.disabled) {
                purchaseButton.style.background = 'rgba(64, 224, 208, 0.3)';
            }
        });

        purchaseButton.addEventListener('click', () => {
            this.purchaseUpgrade(upgrade.id);
        });

        rightSide.appendChild(levelDisplay);
        rightSide.appendChild(purchaseButton);
        entry.appendChild(rightSide);

        this.upgradeElements.set(upgrade.id, { button: purchaseButton, levelDisplay });

        return entry;
    }

    private purchaseUpgrade(upgradeId: string): void {
        const currentLevel = metaPointsService.getPurchasedUpgradeLevel(upgradeId);
        const upgradeDef = UPGRADE_DEFINITIONS.find(u => u.id === upgradeId);
        if (!upgradeDef) return;

        // Check if already at max level
        if (currentLevel >= upgradeDef.maxLevel) return;

        // Get cost for next level
        const nextLevel = currentLevel + 1;
        const costConfig = defaultMetaPointsConfig.upgradeCosts[upgradeId];
        if (!costConfig) return;

        // Handle level-based costs vs single costs
        let cost: { killPoints?: number; wavePoints?: number } | undefined;
        if (this.isLevelBasedCost(costConfig)) {
            // Level-based: get cost for the next level
            cost = costConfig[nextLevel];
        } else {
            // Single cost
            cost = costConfig;
        }

        if (!cost) return;

        // Check if affordable
        const hasKillPoints = cost.killPoints ? metaPointsService.getKillPoints() >= cost.killPoints : true;
        const hasWavePoints = cost.wavePoints ? metaPointsService.getWavePoints() >= cost.wavePoints : true;

        if (!hasKillPoints || !hasWavePoints) return;

        // Purchase upgrade
        if (cost.killPoints) {
            metaPointsService.spendKillPoints(cost.killPoints);
        }
        if (cost.wavePoints) {
            metaPointsService.spendWavePoints(cost.wavePoints);
        }

        metaPointsService.purchaseUpgrade(upgradeId, nextLevel);

        // Refresh UI
        this.updateUI();
    }

    private isLevelBasedCost(cost: LevelBasedCost | { killPoints?: number; wavePoints?: number }): cost is LevelBasedCost {
        // Check if it's a level-based cost (has numeric keys)
        return typeof cost === 'object' && cost !== null && Object.keys(cost).every(key => !isNaN(Number(key)));
    }

    private getUpgradeCost(upgradeId: string, targetLevel: number): { killPoints?: number; wavePoints?: number } | undefined {
        const costConfig = defaultMetaPointsConfig.upgradeCosts[upgradeId];
        if (!costConfig) return undefined;

        if (this.isLevelBasedCost(costConfig)) {
            return costConfig[targetLevel];
        } else {
            return costConfig;
        }
    }

    private updateUI(): void {
        // Update points display
        const pointsContainer = this.container.querySelector('#upgrade-shop-points') as HTMLDivElement;
        if (pointsContainer) {
            const killPoints = metaPointsService.getKillPoints();
            const wavePoints = metaPointsService.getWavePoints();
            pointsContainer.innerHTML = `
                <div>Kill Points: <span style="color: #40E0D0;">${killPoints}</span></div>
                <div>Wave Points: <span style="color: #40E0D0;">${wavePoints}</span></div>
            `;
        }

        // Update each upgrade entry
        for (const upgrade of UPGRADE_DEFINITIONS) {
            const elements = this.upgradeElements.get(upgrade.id);
            if (!elements) continue;

            const currentLevel = metaPointsService.getPurchasedUpgradeLevel(upgrade.id);
            const nextLevel = currentLevel + 1;
            const cost = this.getUpgradeCost(upgrade.id, nextLevel);

            // Update level display (only for multi-level upgrades)
            if (upgrade.maxLevel > 1) {
                if (currentLevel >= upgrade.maxLevel) {
                    elements.levelDisplay.textContent = 'MAX';
                    elements.levelDisplay.style.color = '#40E0D0';
                    elements.levelDisplay.style.display = 'block';
                } else {
                    elements.levelDisplay.textContent = `Level: ${currentLevel}/${upgrade.maxLevel}`;
                    elements.levelDisplay.style.color = 'white';
                    elements.levelDisplay.style.display = 'block';
                }
            } else {
                // Hide level display for single-level upgrades
                elements.levelDisplay.style.display = 'none';
            }

            // Update button
            const button = elements.button;
            const canAfford = cost
                ? (!cost.killPoints || metaPointsService.getKillPoints() >= cost.killPoints) &&
                  (!cost.wavePoints || metaPointsService.getWavePoints() >= cost.wavePoints)
                : false;
            const canPurchase = currentLevel < upgrade.maxLevel && canAfford;

            button.disabled = !canPurchase;
            if (currentLevel >= upgrade.maxLevel) {
                button.textContent = 'MAXED';
                button.style.background = 'rgba(100, 100, 100, 0.3)';
                button.style.borderColor = '#666';
                button.style.cursor = 'not-allowed';
            } else if (canPurchase) {
                const costText = cost
                    ? `${cost.killPoints ? `${cost.killPoints} KP` : ''}${cost.killPoints && cost.wavePoints ? ' + ' : ''}${cost.wavePoints ? `${cost.wavePoints} WP` : ''}`
                    : 'FREE';
                button.textContent = `Buy (${costText})`;
                button.style.background = 'rgba(64, 224, 208, 0.3)';
                button.style.borderColor = '#40E0D0';
                button.style.cursor = 'pointer';
            } else {
                const costText = cost
                    ? `${cost.killPoints ? `${cost.killPoints} KP` : ''}${cost.killPoints && cost.wavePoints ? ' + ' : ''}${cost.wavePoints ? `${cost.wavePoints} WP` : ''}`
                    : 'FREE';
                button.textContent = `Buy (${costText})`;
                button.style.background = 'rgba(100, 0, 0, 0.3)';
                button.style.borderColor = '#666';
                button.style.cursor = 'not-allowed';
            }
        }
    }

    public show(): void {
        this.isVisible = true;
        this.container.style.display = 'flex';
        this.updateUI();
    }

    public hide(): void {
        this.isVisible = false;
        this.container.style.display = 'none';
    }

    public destroy(): void {
        if (this.container?.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

