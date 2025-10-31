import { IComponent } from '../../ecs/IComponent';

export class AbilityComponent implements IComponent {
    private lastUseTime: number;
    private cooldownDuration: number;

    constructor(cooldownDuration: number) {
        this.lastUseTime = 0;
        this.cooldownDuration = cooldownDuration;
    }

    public canUse(currentTime: number): boolean {
        return currentTime - this.lastUseTime >= this.cooldownDuration;
    }

    public use(currentTime: number): void {
        this.lastUseTime = currentTime;
    }

    public getRemainingCooldown(currentTime: number): number {
        const elapsed = currentTime - this.lastUseTime;
        return Math.max(0, this.cooldownDuration - elapsed);
    }

    public getCooldownDuration(): number {
        return this.cooldownDuration;
    }

    public setCooldownDuration(duration: number): void {
        this.cooldownDuration = duration;
    }
}

