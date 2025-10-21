import { EventArgValue } from './EventArgValue';
import { EventType } from './EventType';

export class Event<T extends Record<string, EventArgValue> = Record<string, EventArgValue>> {
    eventName: EventType;
    args: T;
    id: string;

    constructor(eventName: EventType, args: T = {} as T) {
        this.eventName = eventName;
        this.args = args;
        this.id = crypto.randomUUID();
    }
}
