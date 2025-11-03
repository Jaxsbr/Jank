export interface Announcement {
    text: string;
    duration: number;  // How long to show before starting fade out (seconds)
    countdownStart?: number; // If set, show countdown from this number
    onTick?: (remaining: number) => void; // Callback for countdown ticks
}

export class WaveAnnouncementUI {
    private container: HTMLDivElement;
    private announcementElement: HTMLDivElement | null = null;
    private isShowing = false;
    private currentCountdown = 0;
    private countdownInterval: number | null = null;

    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'wave-announcement-ui';
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            pointer-events: none;
            display: none;
        `;
        document.body.appendChild(this.container);
    }

    public show(announcement: Announcement): void {
        // Clear any existing announcement
        this.hide();

        this.isShowing = true;
        this.announcementElement = document.createElement('div');
        this.announcementElement.style.cssText = `
            font-family: 'Courier New', monospace;
            font-size: 72px;
            font-weight: bold;
            color: white;
            text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.9);
            text-align: center;
            padding: 40px 60px;
            background: rgba(0, 0, 0, 0.6);
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            animation: fadeInOut ${announcement.duration}s ease-in-out forwards;
        `;

        if (announcement.countdownStart !== undefined) {
            this.currentCountdown = announcement.countdownStart;
            this.announcementElement.textContent = `${announcement.text} ${this.formatCountdown(this.currentCountdown)}`;
            this.announcementElement.style.animation = 'none'; // Remove fade for countdown
            this.container.appendChild(this.announcementElement);
            this.container.style.display = 'block';

            // Start countdown
            this.countdownInterval = window.setInterval(() => {
                this.currentCountdown--;
                if (this.announcementElement) {
                    this.announcementElement.textContent = `${announcement.text} ${this.formatCountdown(this.currentCountdown)}`;
                }
                if (announcement.onTick) {
                    announcement.onTick(this.currentCountdown);
                }
                if (this.currentCountdown <= 0) {
                    this.clearCountdown();
                    this.hide();
                }
            }, 1000);
        } else {
            this.announcementElement.textContent = announcement.text;
            this.container.appendChild(this.announcementElement);
            this.container.style.display = 'block';
            
            // Auto-hide after duration
            setTimeout(() => {
                this.hide();
            }, announcement.duration * 1000);
        }

        // Add CSS animation if not already present
        this.addAnimationStyles();
    }

    public showWithCountdown(text: string, startCount: number, onTick?: (remaining: number) => void): void {
        this.show({
            text,
            duration: startCount + 0.5, // Extra time for display
            countdownStart: startCount,
            onTick
        });
    }

    public showBrief(text: string, duration = 2.0): void {
        this.show({ text, duration });
    }

    public hide(): void {
        this.clearCountdown();
        if (this.announcementElement) {
            this.announcementElement.remove();
            this.announcementElement = null;
        }
        this.container.style.display = 'none';
        this.isShowing = false;
    }

    private clearCountdown(): void {
        if (this.countdownInterval !== null) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    private formatCountdown(seconds: number): string {
        return seconds.toString().padStart(2, '0');
    }

    private addAnimationStyles(): void {
        // Check if styles already added
        if (document.getElementById('wave-announcement-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'wave-announcement-styles';
        style.textContent = `
            @keyframes fadeInOut {
                0% {
                    opacity: 0;
                    transform: scale(0.8);
                }
                15% {
                    opacity: 1;
                    transform: scale(1.0);
                }
                85% {
                    opacity: 1;
                    transform: scale(1.0);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.8);
                }
            }
        `;
        document.head.appendChild(style);
    }

    public destroy(): void {
        this.hide();
        if (this.container?.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

