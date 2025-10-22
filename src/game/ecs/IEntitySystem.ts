import { Entity } from './Entity';

export interface IEntitySystem {
    update(entities: Entity[]): void;
}
