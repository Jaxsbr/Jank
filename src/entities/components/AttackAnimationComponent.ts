import { IComponent } from '../../ecs/IComponent';

export class AttackAnimationComponent implements IComponent {
    private isAttacking: boolean;
    private attackAnimationEndTime: number;
    private originalScale: number;
    private attackScaleMultiplier: number;
    private attackAnimationDuration: number;

    constructor(
        attackScaleMultiplier: number = 1.2,
        attackAnimationDuration: number = 200
    ) {
        this.isAttacking = false;
        this.attackAnimationEndTime = 0;
        this.originalScale = 1.0;
        this.attackScaleMultiplier = attackScaleMultiplier;
        this.attackAnimationDuration = attackAnimationDuration;
    }

    /**
     * Start the attack animation
     */
    public startAttackAnimation(): void {
        this.isAttacking = true;
        this.attackAnimationEndTime = Date.now() + this.attackAnimationDuration;
    }

    /**
     * Check if currently animating
     * @returns True if currently animating
     */
    public isAnimating(): boolean {
        return this.isAttacking && Date.now() < this.attackAnimationEndTime;
    }

    /**
     * Get the current scale multiplier based on animation progress
     * @returns The current scale multiplier
     */
    public getScaleMultiplier(): number {
        if (!this.isAttacking) {
            return this.originalScale;
        }

        const currentTime = Date.now();
        const elapsed = currentTime - (this.attackAnimationEndTime - this.attackAnimationDuration);
        const progress = elapsed / this.attackAnimationDuration;

        if (progress >= 1.0) {
            // Animation finished
            this.isAttacking = false;
            return this.originalScale;
        }

        // Scale animation curve: up for first 25%, down for remaining 75%
        if (progress < 0.25) {
            // Scale up phase (first 25% of animation)
            const scaleProgress = progress / 0.25;
            return this.originalScale + ((this.attackScaleMultiplier - this.originalScale) * scaleProgress);
        } else {
            // Scale down phase (remaining 75%)
            const scaleProgress = (progress - 0.25) / 0.75;
            return this.attackScaleMultiplier - ((this.attackScaleMultiplier - this.originalScale) * scaleProgress);
        }
    }

    /**
     * Get the attack scale multiplier
     * @returns The attack scale multiplier
     */
    public getAttackScaleMultiplier(): number {
        return this.attackScaleMultiplier;
    }

    /**
     * Set the attack scale multiplier
     * @param multiplier - The new attack scale multiplier
     */
    public setAttackScaleMultiplier(multiplier: number): void {
        this.attackScaleMultiplier = multiplier;
    }

    /**
     * Get the attack animation duration
     * @returns The attack animation duration in milliseconds
     */
    public getAttackAnimationDuration(): number {
        return this.attackAnimationDuration;
    }

    /**
     * Set the attack animation duration
     * @param duration - The new attack animation duration in milliseconds
     */
    public setAttackAnimationDuration(duration: number): void {
        this.attackAnimationDuration = duration;
    }

    /**
     * Get the original scale
     * @returns The original scale value
     */
    public getOriginalScale(): number {
        return this.originalScale;
    }

    /**
     * Set the original scale
     * @param scale - The original scale value
     */
    public setOriginalScale(scale: number): void {
        this.originalScale = scale;
    }
}
