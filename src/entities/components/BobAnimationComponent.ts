import { IComponent } from '../../ecs/IComponent';

export class BobAnimationComponent implements IComponent {
    private animationTime = 0;
    private animationSpeed: number;
    private originalAnimationSpeed: number;
    private bobAmplitude: number;
    private baseY: number;
    
    constructor(animationSpeed: number, bobAmplitude: number, baseY: number) {
        this.animationSpeed = animationSpeed;
        this.originalAnimationSpeed = animationSpeed;
        this.bobAmplitude = bobAmplitude;
        this.baseY = baseY;
    }

    get getAnimationSpeed(): number {
        return this.animationSpeed;
    }

    get getAnimationTime(): number {
        return this.animationTime;
    }
    
    get getBobAmplitude(): number {
        return this.bobAmplitude;
    }
    
    get getBaseY(): number {
        return this.baseY;
    }

    set setAnimationTime(animationTime: number) {
        this.animationTime = animationTime
    }

    /**
     * Set the animation speed
     * @param speed - The new animation speed
     */
    public setAnimationSpeed(speed: number): void {
        this.animationSpeed = speed;
    }

    /**
     * Get the original animation speed
     * @returns The original animation speed
     */
    public getOriginalAnimationSpeed(): number {
        return this.originalAnimationSpeed;
    }

    /**
     * Reset animation speed to original value
     */
    public resetAnimationSpeed(): void {
        this.animationSpeed = this.originalAnimationSpeed;
    }
}