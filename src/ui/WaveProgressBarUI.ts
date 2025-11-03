export class WaveProgressBarUI {
    private container!: HTMLDivElement;
    private waveLabel!: HTMLDivElement;
    private progressBarContainer!: HTMLDivElement;
    private progressBarFill!: HTMLDivElement;
    private flagsContainer!: HTMLDivElement;
    private flags: HTMLDivElement[] = [];

    private currentWave = 1;
    private totalEnemiesPerWave = 0;
    private enemiesSpawned = 0;
    private currentRound = 0;
    private roundEnemyCounts: number[] = [0, 0, 0]; // Enemy counts per round
    private roundFlagPositions: number[] = [0, 0, 0]; // Percent positions for 3 rounds

    constructor() {
        this.createUI();
    }

    private createUI(): void {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'wave-progress-bar-ui';
        this.container.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 500;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            pointer-events: none;
        `;

        // Wave label
        this.waveLabel = document.createElement('div');
        this.waveLabel.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 28px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 12px rgba(64, 224, 208, 0.5);
            margin-bottom: 6px;
        `;
        this.updateWaveLabel();

        // Progress bar container
        this.progressBarContainer = document.createElement('div');
        this.progressBarContainer.style.cssText = `
            position: relative;
            width: 450px;
            height: 32px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid rgba(64, 224, 208, 0.5);
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 0 12px rgba(64, 224, 208, 0.3);
        `;

        // Flags container (overlaid on progress bar for round markers)
        this.flagsContainer = document.createElement('div');
        this.flagsContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10;
        `;

        // Progress bar fill
        this.progressBarFill = document.createElement('div');
        this.progressBarFill.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #40E0D0 0%, #64FFDA 100%);
            transition: width 0.3s ease-out;
            box-shadow: 0 0 16px rgba(64, 224, 208, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3);
            animation: progressPulse 2s ease-in-out infinite;
        `;

        // Create slightly diagonal line markers (on the progress bar)
        // Only create lines for round 2 and round 3 (skip round 1 at 0%)
        for (let i = 1; i < 3; i++) {
            const flag = document.createElement('div');
            flag.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 3px;
                height: 120%;
                transform: translateX(-50%) rotate(15deg);
                transform-origin: center bottom;
                transition: background 0.4s ease, box-shadow 0.3s ease, opacity 0.3s ease, border 0.3s ease;
                background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
                border-left: 1px solid rgba(0, 0, 0, 0.8);
                border-right: 1px solid rgba(0, 0, 0, 0.8);
                box-shadow: 0 0 6px rgba(255, 255, 255, 0.8), inset 0 0 2px rgba(0, 0, 0, 0.5);
                opacity: 0.9;
                z-index: 15;
            `;
            flag.id = `wave-flag-${i + 1}`;
            this.flags.push(flag);
            this.flagsContainer.appendChild(flag);
        }

        this.progressBarContainer.appendChild(this.progressBarFill);
        this.progressBarContainer.appendChild(this.flagsContainer);
        this.container.appendChild(this.waveLabel);
        this.container.appendChild(this.progressBarContainer);
        document.body.appendChild(this.container);

        // Add CSS animations
        this.addAnimationStyles();
    }

    private addAnimationStyles(): void {
        // Check if styles already added
        if (document.getElementById('wave-progress-bar-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'wave-progress-bar-styles';
        style.textContent = `
            @keyframes progressPulse {
                0%, 100% {
                    box-shadow: 0 0 16px rgba(64, 224, 208, 0.8), inset 0 0 8px rgba(255, 255, 255, 0.3);
                }
                50% {
                    box-shadow: 0 0 24px rgba(64, 224, 208, 1.0), inset 0 0 12px rgba(255, 255, 255, 0.5);
                }
            }
            @keyframes flagPulse {
                0%, 100% {
                    opacity: 1;
                    box-shadow: 0 0 10px rgba(64, 224, 208, 1.2), inset 0 0 3px rgba(0, 0, 0, 0.6);
                }
                50% {
                    opacity: 1;
                    box-shadow: 0 0 16px rgba(64, 224, 208, 1.5), inset 0 0 4px rgba(0, 0, 0, 0.7), 0 0 24px rgba(64, 224, 208, 0.8);
                }
            }
        `;
        document.head.appendChild(style);
    }

    public setWave(wave: number): void {
        this.currentWave = wave;
        this.updateWaveLabel();
    }

    public setTotalEnemiesPerWave(total: number): void {
        this.totalEnemiesPerWave = total;
        this.calculateFlagPositions();
        this.updateProgress();
        this.updateFlags();
    }

    public setRoundEnemyCounts(counts: number[]): void {
        this.roundEnemyCounts = counts;
        this.calculateFlagPositions();
        this.updateFlags();
    }

    public setEnemiesSpawned(count: number): void {
        this.enemiesSpawned = count;
        this.updateProgress();
    }

    public setCurrentRound(round: number): void {
        this.currentRound = round;
        this.updateFlags();
    }

    private calculateFlagPositions(): void {
        if (this.totalEnemiesPerWave === 0 || this.roundEnemyCounts.length === 0) {
            this.roundFlagPositions = [0, 0, 0];
            return;
        }

        // Calculate cumulative positions based on dynamic round enemy counts
        let cumulativeEnemies = 0;
        this.roundFlagPositions = this.roundEnemyCounts.map((count) => {
            const position = (cumulativeEnemies / this.totalEnemiesPerWave) * 100;
            cumulativeEnemies += count;
            return position;
        });
    }

    private updateWaveLabel(): void {
        this.waveLabel.textContent = `Wave ${this.currentWave}`;
    }

    private updateProgress(): void {
        const progress = this.totalEnemiesPerWave > 0 
            ? Math.min(100, (this.enemiesSpawned / this.totalEnemiesPerWave) * 100)
            : 0;
        this.progressBarFill.style.width = `${progress}%`;
    }

    private updateFlags(): void {
        // Flags array only contains round 2 and 3 (index 0 = round 2, index 1 = round 3)
        this.flags.forEach((flag, index) => {
            const roundNum = index + 2; // index 0 = round 2, index 1 = round 3
            const position = this.roundFlagPositions[roundNum - 1] ?? 0; // roundNum - 1 to get correct position index
            flag.style.left = `${position}%`;

            // Remove previous animations
            flag.style.animation = '';

            // Line states: completed (bright cyan), current (bright white with animation), upcoming (dim)
            if (roundNum < this.currentRound) {
                // Completed round - bright cyan gradient with dark borders for contrast
                flag.style.background = 'linear-gradient(to bottom, rgba(64, 224, 208, 1.0) 0%, rgba(64, 224, 208, 0.8) 100%)';
                flag.style.borderLeft = '1px solid rgba(0, 0, 0, 1.0)';
                flag.style.borderRight = '1px solid rgba(0, 0, 0, 1.0)';
                flag.style.boxShadow = '0 0 8px rgba(64, 224, 208, 1.0), inset 0 0 3px rgba(0, 0, 0, 0.6)';
                flag.style.opacity = '1';
            } else if (roundNum === this.currentRound) {
                // Current round - bright white/cyan with pulse animation and dark borders
                flag.style.background = 'linear-gradient(to bottom, rgba(255, 255, 255, 1.0) 0%, rgba(64, 224, 208, 0.95) 100%)';
                flag.style.borderLeft = '1px solid rgba(0, 0, 0, 1.0)';
                flag.style.borderRight = '1px solid rgba(0, 0, 0, 1.0)';
                flag.style.boxShadow = '0 0 10px rgba(64, 224, 208, 1.2), inset 0 0 3px rgba(0, 0, 0, 0.6)';
                flag.style.opacity = '1';
                flag.style.animation = 'flagPulse 2s ease-in-out infinite';
            } else {
                // Upcoming round - dim with dark borders
                flag.style.background = 'linear-gradient(to bottom, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)';
                flag.style.borderLeft = '1px solid rgba(0, 0, 0, 0.9)';
                flag.style.borderRight = '1px solid rgba(0, 0, 0, 0.9)';
                flag.style.boxShadow = '0 0 4px rgba(255, 255, 255, 0.5), inset 0 0 2px rgba(0, 0, 0, 0.4)';
                flag.style.opacity = '0.7';
            }
        });
    }

    public reset(): void {
        this.currentWave = 1;
        this.totalEnemiesPerWave = 0;
        this.enemiesSpawned = 0;
        this.currentRound = 0;
        this.roundEnemyCounts = [0, 0, 0];
        this.updateWaveLabel();
        this.updateProgress();
        this.updateFlags();
    }

    public getCurrentWave(): number {
        return this.currentWave;
    }

    public destroy(): void {
        if (this.container?.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

