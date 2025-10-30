import { IComponent } from '../../ecs/IComponent';

export class MetaUpgradeComponent implements IComponent {
    private extraMeleeTargets: number;
    private meleeRangeRings: number;

    constructor(extraMeleeTargets: number, meleeRangeRings: number) {
        this.extraMeleeTargets = extraMeleeTargets;
        this.meleeRangeRings = meleeRangeRings;
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
}


