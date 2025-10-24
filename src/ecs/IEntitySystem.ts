import { Entity } from './Entity';

export interface IEntitySystem {
    update(entities: readonly Entity[]): void;
}
