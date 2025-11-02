import { IComponent } from '../../ecs/IComponent';

export type TargetingMode = 'nearest' | 'lowest';

export class MetaUpgradeComponent implements IComponent {
    private extraMeleeTargets: number;
    private meleeRangeRings: number;
    private stunPulseLevel: number;
    private meleeKnockbackLevel: number;
    private targetingMode: TargetingMode;
    private rangedAttackUnlocked: boolean;
    private rangedAttackLevel: number;

    constructor(extraMeleeTargets: number, meleeRangeRings: number, stunPulseLevel: number = 0, meleeKnockbackLevel: number = 0, targetingMode: TargetingMode = 'nearest', rangedAttackUnlocked: boolean = false, rangedAttackLevel: number = 0) {
        this.extraMeleeTargets = extraMeleeTargets;
        this.meleeRangeRings = meleeRangeRings;
        this.stunPulseLevel = stunPulseLevel;
        this.meleeKnockbackLevel = meleeKnockbackLevel;
        this.targetingMode = targetingMode;
        this.rangedAttackUnlocked = rangedAttackUnlocked;
        this.rangedAttackLevel = rangedAttackLevel;
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

    public isRangedAttackUnlocked(): boolean {
        return this.rangedAttackUnlocked;
    }

    public setRangedAttackUnlocked(unlocked: boolean): void {
        this.rangedAttackUnlocked = unlocked;
    }

    public getRangedAttackLevel(): number {
        return this.rangedAttackLevel;
    }

    public setRangedAttackLevel(level: number): void {
        this.rangedAttackLevel = level;
    }
}


