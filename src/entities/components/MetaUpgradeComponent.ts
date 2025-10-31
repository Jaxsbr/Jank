import { IComponent } from '../../ecs/IComponent';

export class MetaUpgradeComponent implements IComponent {
    private extraMeleeTargets: number;
    private meleeRangeRings: number;
    private stunPulseLevel: number;

    constructor(extraMeleeTargets: number, meleeRangeRings: number, stunPulseLevel: number = 0) {
        this.extraMeleeTargets = extraMeleeTargets;
        this.meleeRangeRings = meleeRangeRings;
        this.stunPulseLevel = stunPulseLevel;
    }

    public getExtraMeleeTargets(): number {
        return this.extraMeleeTargets;
    }

    public setExtraMeleeTargets(value: number): void {
        this.extraMeleeTargets = value;
    }

    public getMeleeRangeRings(): number {
        return this.meleeRangeRings;
    }

    public setMeleeRangeRings(value: number): void {
        this.meleeRangeRings = value;
    }

    public getStunPulseLevel(): number {
        return this.stunPulseLevel;
    }

    public setStunPulseLevel(value: number): void {
        this.stunPulseLevel = value;
    }
}


