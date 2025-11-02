import { IComponent } from '../../ecs/IComponent';
import { EnemyType } from '../config/EnemyTypeConfig';

/**
 * Component that stores the enemy type for an enemy entity.
 * Used by visual systems to apply type-specific effects.
 */
export class EnemyTypeComponent implements IComponent {
    private enemyType: EnemyType;

    constructor(enemyType: EnemyType) {
        this.enemyType = enemyType;
    }

    public getEnemyType(): EnemyType {
        return this.enemyType;
    }

    public setEnemyType(enemyType: EnemyType): void {
        this.enemyType = enemyType;
    }
}

