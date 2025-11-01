export class GameStatsHUD {
    private container: HTMLDivElement;
    private waveText: HTMLDivElement;
    private killsText: HTMLDivElement;
    private enemiesAliveText: HTMLDivElement;

    private currentWave: number = 0;
    private currentRound: number = 0;
    private totalKills: number = 0;
    private enemiesAlive: number = 0;

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

        // Wave display
        this.waveText = this.createStatDisplay();
        this.updateWaveDisplay();

        // Kills display
        this.killsText = this.createStatDisplay();
        this.updateKillsDisplay();

        // Enemies alive display
        this.enemiesAliveText = this.createStatDisplay();
        this.updateEnemiesAliveDisplay();

        this.container.appendChild(this.waveText);
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

    public setWave(wave: number): void {
        this.currentWave = wave;
        this.updateWaveDisplay();
    }

    public setRound(round: number): void {
        this.currentRound = round;
        this.updateWaveDisplay();
    }

    public addKill(): void {
        this.totalKills++;
        this.updateKillsDisplay();
    }

    public setEnemiesAlive(count: number): void {
        this.enemiesAlive = count;
        this.updateEnemiesAliveDisplay();
    }

    public getWave(): number {
        return this.currentWave;
    }

    public getKills(): number {
        return this.totalKills;
    }

    private updateWaveDisplay(): void {
        if (this.currentRound > 0) {
            this.waveText.textContent = `Wave: ${this.currentWave} | Round: ${this.currentRound}`;
        } else {
            this.waveText.textContent = `Wave: ${this.currentWave}`;
        }
    }

    private updateKillsDisplay(): void {
        this.killsText.textContent = `Kills: ${this.totalKills}`;
    }

    private updateEnemiesAliveDisplay(): void {
        this.enemiesAliveText.textContent = `Alive: ${this.enemiesAlive}`;
    }

    public reset(): void {
        this.currentWave = 0;
        this.currentRound = 0;
        this.totalKills = 0;
        this.enemiesAlive = 0;
        this.updateWaveDisplay();
        this.updateKillsDisplay();
        this.updateEnemiesAliveDisplay();
    }

    public destroy(): void {
        if (this.container?.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

