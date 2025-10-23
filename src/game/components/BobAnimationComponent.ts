import { IComponent } from '../ecs/IComponent';

export class BobAnimationComponent implements IComponent {
    private animationTime: number = 0;
    private animationSpeed: number;
    private bobAmplitude: number;
    private baseY: number;
    
    constructor(animationSpeed: number, bobAmplitude: number, baseY: number) {
        this.animationSpeed = animationSpeed;
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
}