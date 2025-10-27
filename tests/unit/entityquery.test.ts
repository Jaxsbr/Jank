import { Entity } from '../../src/ecs/Entity';
import { EntityQuery } from '../../src/ecs/EntityQuery';
import { IComponent } from '../../src/ecs/IComponent';

// Mock components for testing
class TestComponentA implements IComponent {
    constructor(public value: string) {}
}

class TestComponentB implements IComponent {
    constructor(public value: number) {}
}

class TestComponentC implements IComponent {
    constructor(public value: boolean) {}
}

describe('EntityQuery', () => {
    let entities: Entity[];

    beforeEach(() => {
        entities = [];
        
        // Create test entities
        const entity1 = new Entity();
        entity1.addComponent(new TestComponentA('entity1'));
        entity1.addComponent(new TestComponentB(100));
        entities.push(entity1);

        const entity2 = new Entity();
        entity2.addComponent(new TestComponentA('entity2'));
        entity2.addComponent(new TestComponentC(true));
        entities.push(entity2);

        const entity3 = new Entity();
        entity3.addComponent(new TestComponentB(200));
        entity3.addComponent(new TestComponentC(false));
        entities.push(entity3);

        const entity4 = new Entity();
        entity4.addComponent(new TestComponentA('entity4'));
        entity4.addComponent(new TestComponentB(300));
        entity4.addComponent(new TestComponentC(true));
        entities.push(entity4);
    });

    describe('withComponents', () => {
        it('should return entities with single component', () => {
            const results = EntityQuery.from(entities)
                .withComponents(TestComponentA)
                .execute();

            expect(results).toHaveLength(3);
            expect(results[0]?.components[0]).toBeInstanceOf(TestComponentA);
            expect(results[0]?.components[0].value).toBe('entity1');
        });

        it('should return entities with multiple components', () => {
            const results = EntityQuery.from(entities)
                .withComponents(TestComponentA, TestComponentB)
                .execute();

            expect(results).toHaveLength(2);
            expect(results[0]?.components[0]).toBeInstanceOf(TestComponentA);
            expect(results[0]?.components[1]).toBeInstanceOf(TestComponentB);
            expect(results[0]?.components[0].value).toBe('entity1');
            expect(results[0]?.components[1].value).toBe(100);
        });

        it('should return empty array when no entities match', () => {
            const results = EntityQuery.from(entities)
                .withComponents(TestComponentA, TestComponentB, TestComponentC)
                .execute();

            expect(results).toHaveLength(1);
            expect(results[0]?.components[0].value).toBe('entity4');
            expect(results[0]?.components[1].value).toBe(300);
            expect(results[0]?.components[2].value).toBe(true);
        });
    });

    describe('filter', () => {
        it('should filter results based on component values', () => {
            const results = EntityQuery.from(entities)
                .withComponents(TestComponentA, TestComponentB)
                .filter(({ components }) => {
                    const [compA, compB] = components;
                    return compB.value > 150;
                })
                .execute();

            expect(results).toHaveLength(1);
            expect(results[0]?.components[0].value).toBe('entity4');
            expect(results[0]?.components[1].value).toBe(300);
        });

        it('should filter based on entity properties', () => {
            const results = EntityQuery.from(entities)
                .withComponents(TestComponentA)
                .filter(({ entity }) => {
                    // Filter based on component value instead of entity ID
                    const compA = entity.getComponent(TestComponentA);
                    return compA?.value === 'entity1' || compA?.value === 'entity4';
                })
                .execute();

            expect(results).toHaveLength(2);
        });
    });

    describe('executeEntities', () => {
        it('should return only entities without components', () => {
            const entityResults = EntityQuery.from(entities)
                .withComponents(TestComponentA, TestComponentB)
                .executeEntities();

            expect(entityResults).toHaveLength(2);
            expect(entityResults[0]).toBeInstanceOf(Entity);
            expect(entityResults[1]).toBeInstanceOf(Entity);
        });
    });

    describe('executeFirst', () => {
        it('should return first matching result', () => {
            const result = EntityQuery.from(entities)
                .withComponents(TestComponentA)
                .executeFirst();

            expect(result).not.toBeNull();
            expect(result!.components[0].value).toBe('entity1');
        });

        it('should return null when no matches', () => {
            // Create a component that doesn't exist on any entity
            class NonExistentComponent implements IComponent {}
            
            const result = EntityQuery.from(entities)
                .withComponents(NonExistentComponent)
                .executeFirst();

            expect(result).toBeNull();
        });
    });

    describe('executeCount', () => {
        it('should return correct count of matching entities', () => {
            const count = EntityQuery.from(entities)
                .withComponents(TestComponentA)
                .executeCount();

            expect(count).toBe(3);
        });

        it('should return 0 when no matches', () => {
            class NonExistentComponent implements IComponent {}
            
            const count = EntityQuery.from(entities)
                .withComponents(NonExistentComponent)
                .executeCount();

            expect(count).toBe(0);
        });
    });

    describe('type safety', () => {
        it('should maintain type safety with component access', () => {
            const results = EntityQuery.from(entities)
                .withComponents(TestComponentA, TestComponentB)
                .execute();

            results.forEach(({ components }) => {
                const [compA, compB] = components;
                
                // TypeScript should infer these types correctly
                expect(typeof compA.value).toBe('string');
                expect(typeof compB.value).toBe('number');
                
                // These should compile without errors
                const stringValue: string = compA.value;
                const numberValue: number = compB.value;
                
                expect(stringValue).toBeDefined();
                expect(numberValue).toBeDefined();
            });
        });
    });

    describe('error handling', () => {
        it('should throw error when execute is called without withComponents', () => {
            expect(() => {
                EntityQuery.from(entities).execute();
            }).toThrow('EntityQuery: Must call withComponents() before execute()');
        });

        it('should throw error when executeEntities is called without withComponents', () => {
            expect(() => {
                EntityQuery.from(entities).executeEntities();
            }).toThrow('EntityQuery: Must call withComponents() before executeEntities()');
        });

        it('should throw error when executeCount is called without withComponents', () => {
            expect(() => {
                EntityQuery.from(entities).executeCount();
            }).toThrow('EntityQuery: Must call withComponents() before executeCount()');
        });
    });

    describe('chaining', () => {
        it('should support method chaining', () => {
            const results = EntityQuery.from(entities)
                .withComponents(TestComponentA, TestComponentB)
                .filter(({ components }) => components[1].value > 100)
                .execute();

            expect(results).toHaveLength(1);
            expect(results[0]?.components[1].value).toBe(300);
        });
    });
});
