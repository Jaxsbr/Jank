export interface IGameOverUICallbacks {
    onReplay: () => void;
    onUpgrade: () => void;
}

export class GameOverUI {
    private container!: HTMLDivElement;
    private isVisible = false;
    private onReplay: () => void;
    private onUpgrade: () => void;

    constructor(callbacks: IGameOverUICallbacks) {
        this.onReplay = callbacks.onReplay;
        this.onUpgrade = callbacks.onUpgrade;
        this.createUI();
    }

    private createUI(): void {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'game-over-ui';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            pointer-events: all;
        `;

        // Create content panel
        const panel = document.createElement('div');
        panel.style.cssText = `
            background: rgba(10, 10, 20, 0.95);
            border: 3px solid #40E0D0;
            border-radius: 12px;
            padding: 60px;
            text-align: center;
            min-width: 500px;
        `;

        // Title
        const title = document.createElement('div');
        title.textContent = 'Game Over';
        title.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 48px;
            font-weight: bold;
            color: #40E0D0;
            margin-bottom: 30px;
            text-shadow: 0 0 20px rgba(64, 224, 208, 0.5);
        `;
        panel.appendChild(title);

        // Stats will be inserted here by show() method
        const statsContainer = document.createElement('div');
        statsContainer.id = 'game-over-stats';
        statsContainer.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 28px;
            color: white;
            margin-bottom: 40px;
            line-height: 1.8;
        `;
        panel.appendChild(statsContainer);

        // Buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            gap: 20px;
            justify-content: center;
        `;

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

        // Upgrade button
        const upgradeButton = document.createElement('button');
        upgradeButton.textContent = 'Upgrade';
        upgradeButton.style.cssText = `
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
        `;

        upgradeButton.addEventListener('mouseenter', () => {
            upgradeButton.style.background = 'rgba(64, 224, 208, 0.5)';
            upgradeButton.style.transform = 'scale(1.1)';
        });

        upgradeButton.addEventListener('mouseleave', () => {
            upgradeButton.style.background = 'rgba(64, 224, 208, 0.3)';
            upgradeButton.style.transform = 'scale(1)';
        });

        upgradeButton.addEventListener('click', () => {
            this.onUpgrade();
            this.hide();
        });

        buttonsContainer.appendChild(replayButton);
        buttonsContainer.appendChild(upgradeButton);
        panel.appendChild(buttonsContainer);
        this.container.appendChild(panel);
        document.body.appendChild(this.container);
    }

    public show(wave: number, kills: number): void {
        const statsContainer = this.container.querySelector('#game-over-stats')!;
        if (statsContainer) {
            statsContainer.innerHTML = `
                Wave Reached: ${wave}<br>
                Total Kills: ${kills}
            `;
        }

        this.isVisible = true;
        this.container.style.display = 'flex';
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

