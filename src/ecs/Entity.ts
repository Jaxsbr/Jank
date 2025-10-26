import { IComponent } from './IComponent';

export class Entity {
    private components: IComponent[] = [];
    private id: string;

    constructor() {
        this.id = crypto.randomUUID();
    }

    /**
     * Get the unique ID of this entity
     * @returns The unique ID string
     */
    public getId(): string {
        return this.id;
    }
    
    /**
     * Checks if this entity has a component of the specified type.
     * @param componentType - The component class constructor (e.g., HealthComponent)
     * 
     * Note on `never[]`: This is a TypeScript pattern that allows the constructor to accept
     * any number of arguments of any type, while maintaining type safety. `never[]` means
     * "an array that can never contain elements" - it's TypeScript's way of saying "we don't
     * care about the constructor's parameter types, just that it's a constructor for T".
     * This avoids using `any` while still allowing constructors with parameters.
     */
    hasComponent<T extends IComponent>(componentType: new (...args: never[]) => T): boolean {
        return this.components.some(component => component instanceof componentType);
    }

    /**
     * Gets a component of the specified type from this entity.
     * @param componentType - The component class constructor (e.g., HealthComponent)
     * @returns The component instance or null if not found
     */
    getComponent<T extends IComponent>(componentType: new (...args: never[]) => T): T | null {
        return this.components.find(component => component instanceof componentType) as T || null;
    }

    addComponent<T extends IComponent>(component: T): void {
        this.components.push(component);
    }
}
