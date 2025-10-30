import { IComponent } from '../../ecs/IComponent';

export class DeathEffectComponent implements IComponent {
    public readonly startTime: number;
    public readonly duration: number;

    constructor(startTime: number, duration: number) {
        this.startTime = startTime;
        this.duration = duration;
    }
}


