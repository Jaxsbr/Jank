import { Event } from './Event';
import { IEventListener } from './IEventListener';

export class EventDispatcherSingleton {
    private static instance: EventDispatcherSingleton;
    private listeners: Map<string, IEventListener> = new Map();

    private constructor() {}

    static getInstance(): EventDispatcherSingleton {
        if (!EventDispatcherSingleton.instance) {
            EventDispatcherSingleton.instance = new EventDispatcherSingleton();
        }
        return EventDispatcherSingleton.instance;
    }

    registerListener(key: string, listener: IEventListener): void {
        this.listeners.set(key, listener);
    }

    deregisterListener(key: string): void {
        this.listeners.delete(key);
    }

    dispatch(event: Event): void {
        for (const [key, listener] of this.listeners) {
            try {
                listener.onEvent(event);
            } catch (err) {
                console.error(`Event handler error in ${key}:`, err);
            }
        }
    }
}

export const GlobalEventDispatcher: EventDispatcherSingleton = EventDispatcherSingleton.getInstance();
