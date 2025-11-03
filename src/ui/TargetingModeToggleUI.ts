import { Entity } from '../ecs/Entity';
import { EntityManager } from '../ecs/EntityManager';
import { MetaUpgradeComponent, TargetingMode } from '../entities/components/MetaUpgradeComponent';
import { TargetComponent } from '../entities/components/TargetComponent';
import { TeamComponent } from '../entities/components/TeamComponent';
import { metaPointsService } from '../utils/MetaPointsService';

export interface ITargetingModeToggleCallbacks {
    onModeChanged?: (mode: TargetingMode) => void;
}

export class TargetingModeToggleUI {
    private container!: HTMLDivElement;
    private button!: HTMLButtonElement;
    private entityManager: EntityManager;
    private isVisible = false;
    private onModeChanged?: (mode: TargetingMode) => void;

    constructor(entityManager: EntityManager, callbacks: ITargetingModeToggleCallbacks) {
        this.entityManager = entityManager;
        this.onModeChanged = callbacks.onModeChanged;
        this.createUI();
    }

    private createUI(): void {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'targeting-mode-toggle';
        this.container.style.cssText = `
            position: fixed;
            right: 40px;
            top: 50%;
            transform: translateY(-50%);
            display: none;
            z-index: 1000;
        `;

        // Create button
        this.button = document.createElement('button');
        this.button.style.cssText = `
            padding: 15px 25px;
            border-radius: 8px;
            border: 3px solid #40E0D0;
            background: rgba(64, 224, 208, 0.2);
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            outline: none;
            transition: all 0.2s;
            min-width: 150px;
        `;

        // Hover effects
        this.button.addEventListener('mouseenter', () => {
            if (!this.button.disabled) {
                this.button.style.background = 'rgba(64, 224, 208, 0.4)';
                this.button.style.transform = 'scale(1.05)';
            }
        });

        this.button.addEventListener('mouseleave', () => {
            this.button.style.background = 'rgba(64, 224, 208, 0.2)';
            this.button.style.transform = 'scale(1)';
        });

        // Click handler - toggle between modes
        this.button.addEventListener('click', () => {
            if (!this.button.disabled) {
                const core = this.findCoreEntity();
                if (!core) return;

                const meta = core.getComponent(MetaUpgradeComponent);
                if (!meta) return;

                const currentMode = meta.getTargetingMode();
                const newMode: TargetingMode = currentMode === 'nearest' ? 'lowest' : 'nearest';
                
                meta.setTargetingMode(newMode);
                
                // Clear target to force re-evaluation with new mode
                const target = core.getComponent(TargetComponent);
                if (target) {
                    target.clearTarget();
                }
                
                if (this.onModeChanged) {
                    this.onModeChanged(newMode);
                }
                
                this.updateButtonLabel(newMode);
            }
        });

        this.container.appendChild(this.button);
        document.body.appendChild(this.container);
    }

    private updateButtonLabel(mode: TargetingMode): void {
        this.button.textContent = mode === 'nearest' ? 'Target: Nearest' : 'Target: Lowest HP';
    }

    public update(): void {
        // Check if advanced melee targeting is unlocked
        const advancedTargetingLevel = metaPointsService.getPurchasedUpgradeLevel('advanced-melee-targeting');
        
        if (advancedTargetingLevel === 0) {
            this.setVisible(false);
            return;
        }

        const core = this.findCoreEntity();
        
        if (!core) {
            this.setVisible(false);
            return;
        }

        const meta = core.getComponent(MetaUpgradeComponent);
        
        // Show button only when upgrade is unlocked and core has meta component
        const shouldShow = meta !== null;
        this.setVisible(shouldShow);

        if (!shouldShow) {
            return;
        }

        // Update button label to reflect current mode
        const currentMode = meta.getTargetingMode();
        this.updateButtonLabel(currentMode);
        this.button.disabled = false;
    }

    private setVisible(visible: boolean): void {
        this.isVisible = visible;
        this.container.style.display = visible ? 'block' : 'none';
    }

    private findCoreEntity(): Entity | null {
        const entities = this.entityManager.getEntities();
        return entities.find(e => {
            const team = e.getComponent(TeamComponent);
            return team?.isCore();
        }) ?? null;
    }

    public destroy(): void {
        if (this.container?.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

