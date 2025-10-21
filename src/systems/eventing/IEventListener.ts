import { Event } from './Event';

export interface IEventListener {
    onEvent(event: Event): void;
}
