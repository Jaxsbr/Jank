import { Vector3 } from 'three';
import { Entity } from '../../ecs/Entity';

export type EventArgValue =
    | string
    | number
    | boolean
    | Vector3
    | Entity
    | string[];
