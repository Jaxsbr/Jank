export class GameStatsHUD {
    private container!: HTMLDivElement;
    private killsText!: HTMLDivElement;
    private enemiesAliveText!: HTMLDivElement;

    private totalKills = 0;
    private enemiesAlive = 0;

    constructor() {
        this.createUI();
    }

    private createUI(): void {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'game-stats-hud';
        this.container.style.cssText = `
            position: fixed;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 500;
            display: flex;
            gap: 40px;
            align-items: center;
            pointer-events: none;
        `;

        // Kills display
        this.killsText = this.createStatDisplay();
        this.updateKillsDisplay();

        // Enemies alive display
        this.enemiesAliveText = this.createStatDisplay();
        this.updateEnemiesAliveDisplay();

        this.container.appendChild(this.killsText);
        this.container.appendChild(this.enemiesAliveText);
        document.body.appendChild(this.container);
    }

    private createStatDisplay(): HTMLDivElement {
        const display = document.createElement('div');
        display.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 32px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            text-align: center;
            padding: 10px 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            min-width: 150px;
        `;
        return display;
    }

    public addKill(): void {
        this.totalKills++;
        this.updateKillsDisplay();
    }

    public setEnemiesAlive(count: number): void {
        this.enemiesAlive = count;
        this.updateEnemiesAliveDisplay();
    }

    public getKills(): number {
        return this.totalKills;
    }

    private updateKillsDisplay(): void {
        this.killsText.textContent = `Kills: ${this.totalKills}`;
    }

    private updateEnemiesAliveDisplay(): void {
        this.enemiesAliveText.textContent = `Alive: ${this.enemiesAlive}`;
    }

    public reset(): void {
        this.totalKills = 0;
        this.enemiesAlive = 0;
        this.updateKillsDisplay();
        this.updateEnemiesAliveDisplay();
    }

    public destroy(): void {
        if (this.container?.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

