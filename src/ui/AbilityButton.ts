import { Entity } from '../ecs/Entity';
import { EntityManager } from '../ecs/EntityManager';
import { AbilityComponent } from '../entities/components/AbilityComponent';
import { MetaUpgradeComponent } from '../entities/components/MetaUpgradeComponent';
import { TeamComponent } from '../entities/components/TeamComponent';
import { Time } from '../utils/Time';

export interface IAbilityButtonCallbacks {
    onActivate: () => void;
}

export class AbilityButton {
    private container!: HTMLDivElement;
    private button!: HTMLButtonElement;
    private entityManager: EntityManager;
    private onActivate: () => void;
    private isVisible: boolean = false;

    constructor(entityManager: EntityManager, callbacks: IAbilityButtonCallbacks) {
        this.entityManager = entityManager;
        this.onActivate = callbacks.onActivate;
        this.createUI();
    }

    private createUI(): void {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'ability-button';
        this.container.style.cssText = `
            position: fixed;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            display: none;
            z-index: 1000;
        `;

        // Create button
        this.button = document.createElement('button');
        this.button.style.cssText = `
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 4px solid #40E0D0;
            background: rgba(64, 224, 208, 0.2);
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 32px;
            font-weight: bold;
            cursor: pointer;
            outline: none;
            transition: all 0.2s;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Add icon/styling
        this.button.innerHTML = '⚡';
        
        // Hover effects
        this.button.addEventListener('mouseenter', () => {
            if (!this.button.disabled) {
                this.button.style.background = 'rgba(64, 224, 208, 0.4)';
                this.button.style.transform = 'scale(1.1)';
            }
        });
        
        this.button.addEventListener('mouseleave', () => {
            this.button.style.background = 'rgba(64, 224, 208, 0.2)';
            this.button.style.transform = 'scale(1)';
        });

        // Click handler
        this.button.addEventListener('click', () => {
            if (!this.button.disabled) {
                this.onActivate();
            }
        });

        this.container.appendChild(this.button);
        document.body.appendChild(this.container);
    }

    public update(): void {
        const core = this.findCoreEntity();
        
        if (!core) {
            this.setVisible(false);
            return;
        }

        const meta = core.getComponent(MetaUpgradeComponent);
        const stunLevel = meta?.getStunPulseLevel() ?? 0;

        // Show button only when ability is unlocked
        const shouldShow = stunLevel > 0;
        this.setVisible(shouldShow);

        if (!shouldShow) {
            return;
        }

        // Update button state
        const abilityComp = core.getComponent(AbilityComponent);
        if (!abilityComp) {
            this.button.disabled = true;
            this.button.textContent = '⚡';
            return;
        }

        const currentTime = Time.now();
        const remainingCooldown = abilityComp.getRemainingCooldown(currentTime);

        if (remainingCooldown <= 0) {
            this.button.disabled = false;
            this.button.textContent = '⚡';
            this.button.style.borderColor = '#40E0D0';
            this.button.style.opacity = '1';
        } else {
            this.button.disabled = true;
            const roundedCooldown = Math.round(remainingCooldown * 2) / 2;
            this.button.textContent = roundedCooldown.toFixed(roundedCooldown % 1 === 0 ? 0 : 1);
            this.button.style.borderColor = '#FFD700';
            this.button.style.opacity = '0.6';
        }
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

