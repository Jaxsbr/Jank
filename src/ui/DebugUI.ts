import { Entity } from '../ecs/Entity';
import { EntityManager } from '../ecs/EntityManager';
import { MetaUpgradeComponent } from '../entities/components/MetaUpgradeComponent';
import { TeamComponent } from '../entities/components/TeamComponent';
import { defaultMetaUpgradeConfig } from '../entities/config/MetaUpgradeConfig';
import { Event } from '../systems/eventing/Event';
import { GlobalEventDispatcher } from '../systems/eventing/EventDispatcher';
import { EventType } from '../systems/eventing/EventType';
import { metaPointsService } from '../utils/MetaPointsService';

export interface IDebugUICallbacks {
    onRestartGame?: () => void;
}

export class DebugUI {
    private container!: HTMLDivElement;
    private isVisible: boolean = false;
    private entityManager: EntityManager;
    private onRestartGame?: () => void;
    private ring1Checkbox!: HTMLInputElement;
    private ring2Checkbox!: HTMLInputElement;
    private ring3Checkbox!: HTMLInputElement;
    private multiMeleeCheckbox!: HTMLInputElement;
    private stunPulse1Checkbox!: HTMLInputElement;
    private stunPulse2Checkbox!: HTMLInputElement;

    constructor(entityManager: EntityManager, callbacks?: IDebugUICallbacks) {
        this.entityManager = entityManager;
        this.onRestartGame = callbacks?.onRestartGame;
        this.createUI();
        this.setupEventListeners();
    }

    private createUI(): void {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'debug-ui';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #40E0D0;
            border-radius: 8px;
            padding: 30px;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 28px;
            min-width: 400px;
            display: none;
            z-index: 1000;
        `;

        // Create title
        const title = document.createElement('div');
        title.textContent = 'Debug Control Panel';
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 10px;
            color: #40E0D0;
            text-align: center;
        `;
        this.container.appendChild(title);

        // Add zoom control
        const zoomLabel = document.createElement('div');
        zoomLabel.textContent = 'Camera Zoom:';
        zoomLabel.style.cssText = `
            margin-top: 20px;
            margin-bottom: 5px;
        `;
        this.container.appendChild(zoomLabel);

        const zoomSlider = document.createElement('input');
        zoomSlider.type = 'range';
        zoomSlider.id = 'zoom-slider';
        zoomSlider.min = '2';
        zoomSlider.max = '30';
        zoomSlider.step = '1';
        zoomSlider.value = '5'; // Default to current position
        zoomSlider.style.cssText = `
            width: 100%;
            height: 30px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #40E0D0;
            border-radius: 4px;
            outline: none;
        `;

        // Add zoom value display
        const zoomValue = document.createElement('div');
        zoomValue.id = 'zoom-value';
        zoomValue.textContent = `Distance: ${zoomSlider.value}`;
        zoomValue.style.cssText = `
            margin-top: 5px;
            font-size: 20px;
            color: #40E0D0;
            text-align: center;
        `;

        // Add change listener for zoom
        zoomSlider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const distance = parseInt(target.value);
            GlobalEventDispatcher.dispatch(new Event<{ x: number, y: number, z: number }>(
                EventType.CameraZoomChanged, {
                    x: 0,
                    y: distance,
                    z: distance
                }));
            zoomValue.textContent = `Distance: ${distance}`;
        });

        this.container.appendChild(zoomSlider);
        this.container.appendChild(zoomValue);

        // DEBUG: Meta upgrades section - remove when proper upgrade system is implemented
        this.createMetaUpgradesSection();

        // Clear meta progression data button
        this.createClearDataButton();

        // Add instructions
        const instructions = document.createElement('div');
        instructions.textContent = 'Press D to toggle this panel';
        instructions.style.cssText = `
            margin-top: 20px;
            font-size: 24px;
            color: #888;
            text-align: center;
        `;
        this.container.appendChild(instructions);

        // Add to document
        document.body.appendChild(this.container);
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'd') {
                this.toggle();
            }
        });
    }

    public toggle(): void {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'block' : 'none';
        if (this.isVisible) {
            this.updateUpgradeState();
        }
    }

    public show(): void {
        this.isVisible = true;
        this.container.style.display = 'block';
        this.updateUpgradeState();
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

    // DEBUG: Meta upgrades section - remove when proper upgrade system is implemented
    private createMetaUpgradesSection(): void {
        const metaLabel = document.createElement('div');
        metaLabel.textContent = 'Meta Upgrades:';
        metaLabel.style.cssText = `
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
            color: #40E0D0;
        `;
        this.container.appendChild(metaLabel);

        // Ring 1 Melee Range
        const ring1Container = document.createElement('div');
        ring1Container.style.cssText = `
            margin-top: 10px;
            margin-bottom: 5px;
        `;

        this.ring1Checkbox = document.createElement('input');
        this.ring1Checkbox.type = 'checkbox';
        this.ring1Checkbox.id = 'ring1-checkbox';
        this.ring1Checkbox.style.cssText = `
            width: 20px;
            height: 20px;
            margin-right: 10px;
            cursor: pointer;
        `;
        this.ring1Checkbox.addEventListener('change', () => this.handleMetaUpgradeChange());

        const ring1Label = document.createElement('label');
        ring1Label.htmlFor = 'ring1-checkbox';
        ring1Label.textContent = 'Ring 1 Melee Range';
        ring1Label.style.cssText = `
            font-size: 24px;
            cursor: pointer;
        `;

        ring1Container.appendChild(this.ring1Checkbox);
        ring1Container.appendChild(ring1Label);
        this.container.appendChild(ring1Container);

        // Ring 2 Melee Range
        const ring2Container = document.createElement('div');
        ring2Container.style.cssText = `
            margin-top: 10px;
            margin-bottom: 5px;
        `;

        this.ring2Checkbox = document.createElement('input');
        this.ring2Checkbox.type = 'checkbox';
        this.ring2Checkbox.id = 'ring2-checkbox';
        this.ring2Checkbox.style.cssText = `
            width: 20px;
            height: 20px;
            margin-right: 10px;
            cursor: pointer;
        `;
        this.ring2Checkbox.addEventListener('change', () => this.handleMetaUpgradeChange());

        const ring2Label = document.createElement('label');
        ring2Label.htmlFor = 'ring2-checkbox';
        ring2Label.textContent = 'Ring 2 Melee Range';
        ring2Label.style.cssText = `
            font-size: 24px;
            cursor: pointer;
        `;

        ring2Container.appendChild(this.ring2Checkbox);
        ring2Container.appendChild(ring2Label);
        this.container.appendChild(ring2Container);

        // Ring 3 Melee Range
        const ring3Container = document.createElement('div');
        ring3Container.style.cssText = `
            margin-top: 10px;
            margin-bottom: 5px;
        `;

        this.ring3Checkbox = document.createElement('input');
        this.ring3Checkbox.type = 'checkbox';
        this.ring3Checkbox.id = 'ring3-checkbox';
        this.ring3Checkbox.style.cssText = `
            width: 20px;
            height: 20px;
            margin-right: 10px;
            cursor: pointer;
        `;
        this.ring3Checkbox.addEventListener('change', () => this.handleMetaUpgradeChange());

        const ring3Label = document.createElement('label');
        ring3Label.htmlFor = 'ring3-checkbox';
        ring3Label.textContent = 'Ring 3 Melee Range';
        ring3Label.style.cssText = `
            font-size: 24px;
            cursor: pointer;
        `;

        ring3Container.appendChild(this.ring3Checkbox);
        ring3Container.appendChild(ring3Label);
        this.container.appendChild(ring3Container);

        // Multi-melee
        const multiMeleeContainer = document.createElement('div');
        multiMeleeContainer.style.cssText = `
            margin-top: 10px;
            margin-bottom: 5px;
        `;

        this.multiMeleeCheckbox = document.createElement('input');
        this.multiMeleeCheckbox.type = 'checkbox';
        this.multiMeleeCheckbox.id = 'multi-melee-checkbox';
        this.multiMeleeCheckbox.style.cssText = `
            width: 20px;
            height: 20px;
            margin-right: 10px;
            cursor: pointer;
        `;
        this.multiMeleeCheckbox.addEventListener('change', () => this.handleMetaUpgradeChange());

        const multiMeleeLabel = document.createElement('label');
        multiMeleeLabel.htmlFor = 'multi-melee-checkbox';
        multiMeleeLabel.textContent = 'Multi-melee';
        multiMeleeLabel.style.cssText = `
            font-size: 24px;
            cursor: pointer;
        `;

        multiMeleeContainer.appendChild(this.multiMeleeCheckbox);
        multiMeleeContainer.appendChild(multiMeleeLabel);
        this.container.appendChild(multiMeleeContainer);

        // Stun Pulse Level 1
        const stunPulse1Container = document.createElement('div');
        stunPulse1Container.style.cssText = `
            margin-top: 10px;
            margin-bottom: 5px;
        `;

        this.stunPulse1Checkbox = document.createElement('input');
        this.stunPulse1Checkbox.type = 'checkbox';
        this.stunPulse1Checkbox.id = 'stun-pulse-1-checkbox';
        this.stunPulse1Checkbox.style.cssText = `
            width: 20px;
            height: 20px;
            margin-right: 10px;
            cursor: pointer;
        `;
        this.stunPulse1Checkbox.addEventListener('change', () => this.handleMetaUpgradeChange());

        const stunPulse1Label = document.createElement('label');
        stunPulse1Label.htmlFor = 'stun-pulse-1-checkbox';
        stunPulse1Label.textContent = 'Stun Pulse Level 1';
        stunPulse1Label.style.cssText = `
            font-size: 24px;
            cursor: pointer;
        `;

        stunPulse1Container.appendChild(this.stunPulse1Checkbox);
        stunPulse1Container.appendChild(stunPulse1Label);
        this.container.appendChild(stunPulse1Container);

        // Stun Pulse Level 2
        const stunPulse2Container = document.createElement('div');
        stunPulse2Container.style.cssText = `
            margin-top: 10px;
            margin-bottom: 5px;
        `;

        this.stunPulse2Checkbox = document.createElement('input');
        this.stunPulse2Checkbox.type = 'checkbox';
        this.stunPulse2Checkbox.id = 'stun-pulse-2-checkbox';
        this.stunPulse2Checkbox.style.cssText = `
            width: 20px;
            height: 20px;
            margin-right: 10px;
            cursor: pointer;
        `;
        this.stunPulse2Checkbox.addEventListener('change', () => this.handleMetaUpgradeChange());

        const stunPulse2Label = document.createElement('label');
        stunPulse2Label.htmlFor = 'stun-pulse-2-checkbox';
        stunPulse2Label.textContent = 'Stun Pulse Level 2';
        stunPulse2Label.style.cssText = `
            font-size: 24px;
            cursor: pointer;
        `;

        stunPulse2Container.appendChild(this.stunPulse2Checkbox);
        stunPulse2Container.appendChild(stunPulse2Label);
        this.container.appendChild(stunPulse2Container);
    }

    private findCoreEntity(): Entity | null {
        const entities = this.entityManager.getEntities();
        return entities.find(e => {
            const team = e.getComponent(TeamComponent);
            return team?.isCore();
        }) ?? null;
    }

    private ensureMetaUpgradeComponent(entity: Entity): MetaUpgradeComponent {
        let meta = entity.getComponent(MetaUpgradeComponent);
        if (!meta) {
            meta = new MetaUpgradeComponent(
                defaultMetaUpgradeConfig.defaultExtraMeleeTargets,
                defaultMetaUpgradeConfig.defaultMeleeRangeRings,
                defaultMetaUpgradeConfig.defaultStunPulseLevel
            );
            entity.addComponent(meta);
        }
        return meta;
    }

    private updateUpgradeState(): void {
        const core = this.findCoreEntity();
        if (!core) return;

        const meta = core.getComponent(MetaUpgradeComponent);
        const rings = meta ? meta.getMeleeRangeRings() : 0;
        const extraTargets = meta ? meta.getExtraMeleeTargets() : 0;
        const stunPulseLevel = meta ? meta.getStunPulseLevel() : 0;

        // Update checkboxes
        this.ring1Checkbox.checked = rings >= 1;
        this.ring2Checkbox.checked = rings >= 2;
        this.ring3Checkbox.checked = rings >= 3;
        this.multiMeleeCheckbox.checked = extraTargets >= 1;
        this.stunPulse1Checkbox.checked = stunPulseLevel >= 1;
        this.stunPulse2Checkbox.checked = stunPulseLevel >= 2;

        // Update disabled states for level-based upgrades
        this.ring2Checkbox.disabled = rings < 1;
        this.ring3Checkbox.disabled = rings < 2;
        this.stunPulse2Checkbox.disabled = stunPulseLevel < 1;
    }

    private handleMetaUpgradeChange(): void {
        const core = this.findCoreEntity();
        if (!core) return;

        const meta = this.ensureMetaUpgradeComponent(core);

        // Handle ring upgrades (level-based with validation)
        let targetRings = 0;
        if (this.ring3Checkbox.checked) {
            targetRings = 3;
            // Ensure previous levels are checked
            this.ring1Checkbox.checked = true;
            this.ring2Checkbox.checked = true;
        } else if (this.ring2Checkbox.checked) {
            targetRings = 2;
            // Ensure previous level is checked
            this.ring1Checkbox.checked = true;
            // Cascade down: disable higher levels
            this.ring3Checkbox.checked = false;
        } else if (this.ring1Checkbox.checked) {
            targetRings = 1;
            // Cascade down: disable higher levels
            this.ring2Checkbox.checked = false;
            this.ring3Checkbox.checked = false;
        } else {
            targetRings = 0;
        }

        // Clamp to config max
        const clampedRings = Math.min(targetRings, defaultMetaUpgradeConfig.maxMeleeRangeRings);
        meta.setMeleeRangeRings(clampedRings);

        // Handle multi-melee (non-level-based, independent)
        const targetExtraTargets = this.multiMeleeCheckbox.checked ? 1 : 0;
        const clampedExtraTargets = Math.min(targetExtraTargets, defaultMetaUpgradeConfig.maxExtraMeleeTargets);
        meta.setExtraMeleeTargets(clampedExtraTargets);

        // Handle stun pulse upgrades (level-based with validation)
        let targetStunPulseLevel = 0;
        if (this.stunPulse2Checkbox.checked) {
            targetStunPulseLevel = 2;
            // Ensure previous level is checked
            this.stunPulse1Checkbox.checked = true;
        } else if (this.stunPulse1Checkbox.checked) {
            targetStunPulseLevel = 1;
            // Cascade down: disable higher levels
            this.stunPulse2Checkbox.checked = false;
        } else {
            targetStunPulseLevel = 0;
        }

        // Clamp to config max
        const clampedStunPulseLevel = Math.min(targetStunPulseLevel, defaultMetaUpgradeConfig.maxStunPulseLevel);
        meta.setStunPulseLevel(clampedStunPulseLevel);

        // Update disabled states after changes
        this.updateUpgradeState();
    }

    private createClearDataButton(): void {
        const clearDataLabel = document.createElement('div');
        clearDataLabel.textContent = 'Meta Progression:';
        clearDataLabel.style.cssText = `
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
            color: #40E0D0;
        `;
        this.container.appendChild(clearDataLabel);

        const clearDataButton = document.createElement('button');
        clearDataButton.textContent = 'Clear Meta Progression Data';
        clearDataButton.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 20px;
            font-weight: bold;
            color: white;
            background: rgba(200, 0, 0, 0.5);
            border: 2px solid #FF0000;
            border-radius: 6px;
            padding: 10px 20px;
            cursor: pointer;
            transition: all 0.2s;
            outline: none;
            width: 100%;
            margin-top: 10px;
        `;

        clearDataButton.addEventListener('mouseenter', () => {
            clearDataButton.style.background = 'rgba(200, 0, 0, 0.7)';
        });

        clearDataButton.addEventListener('mouseleave', () => {
            clearDataButton.style.background = 'rgba(200, 0, 0, 0.5)';
        });

        clearDataButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all meta progression data? This will reset all points and purchased upgrades and restart the game.')) {
                metaPointsService.clearAllData();
                alert('Meta progression data cleared successfully. Restarting game...');
                
                // Close the debug UI
                this.hide();
                
                // Restart the game if callback is provided
                if (this.onRestartGame) {
                    this.onRestartGame();
                }
            }
        });

        this.container.appendChild(clearDataButton);
    }
}
