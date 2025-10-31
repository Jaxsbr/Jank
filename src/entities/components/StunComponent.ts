import { IComponent } from '../../ecs/IComponent';

export class StunComponent implements IComponent {
    private stunExpiryTime: number;

    constructor(stunExpiryTime: number) {
        this.stunExpiryTime = stunExpiryTime;
    }

    public getStunExpiryTime(): number {
        return this.stunExpiryTime;
    }

    public isStunned(currentTime: number): boolean {
        return currentTime < this.stunExpiryTime;
    }

    public setStunExpiryTime(expiryTime: number): void {
        this.stunExpiryTime = expiryTime;
    }

    public addDuration(duration: number): void {
        this.stunExpiryTime += duration;
    }
}

