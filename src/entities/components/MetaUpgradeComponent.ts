import { IComponent } from '../../ecs/IComponent';

export type TargetingMode = 'nearest' | 'lowest';

export class MetaUpgradeComponent implements IComponent {
    private extraMeleeTargets: number;
    private meleeRangeRings: number;
    private stunPulseLevel: number;
    private meleeKnockbackLevel: number;
    private targetingMode: TargetingMode;

    constructor(extraMeleeTargets: number, meleeRangeRings: number, stunPulseLevel: number = 0, meleeKnockbackLevel: number = 0, targetingMode: TargetingMode = 'nearest') {
        this.extraMeleeTargets = extraMeleeTargets;
        this.meleeRangeRings = meleeRangeRings;
        this.stunPulseLevel = stunPulseLevel;
        this.meleeKnockbackLevel = meleeKnockbackLevel;
        this.targetingMode = targetingMode;
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

    public getMeleeKnockbackLevel(): number {
        return this.meleeKnockbackLevel;
    }

    public setMeleeKnockbackLevel(value: number): void {
        this.meleeKnockbackLevel = value;
    }

    public getTargetingMode(): TargetingMode {
        return this.targetingMode;
    }

    public setTargetingMode(mode: TargetingMode): void {
        this.targetingMode = mode;
    }
}


