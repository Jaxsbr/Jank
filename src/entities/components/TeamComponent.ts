import { IComponent } from '../../ecs/IComponent';

export enum TeamType {
    CORE = 'CORE',
    ENEMY = 'ENEMY'
}

export class TeamComponent implements IComponent {
    private teamType: TeamType;

    constructor(teamType: TeamType) {
        this.teamType = teamType;
    }

    /**
     * Get the team type of this entity
     * @returns The team type
     */
    public getTeamType(): TeamType {
        return this.teamType;
    }

    /**
     * Set the team type of this entity
     * @param teamType - The new team type
     */
    public setTeamType(teamType: TeamType): void {
        this.teamType = teamType;
    }

    /**
     * Check if this entity is on the core team
     * @returns True if this entity is on the core team
     */
    public isCore(): boolean {
        return this.teamType === TeamType.CORE;
    }

    /**
     * Check if this entity is on the enemy team
     * @returns True if this entity is on the enemy team
     */
    public isEnemy(): boolean {
        return this.teamType === TeamType.ENEMY;
    }

    /**
     * Check if this entity is hostile to another entity
     * @param other - The other team component to check against
     * @returns True if this entity is hostile to the other entity
     */
    public isHostileTo(other: TeamComponent): boolean {
        return this.teamType !== other.getTeamType();
    }
}
