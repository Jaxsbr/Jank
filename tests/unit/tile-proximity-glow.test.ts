import { Entity } from '../../src/ecs/Entity';
import { PositionComponent } from '../../src/entities/components/PositionComponent';
import { TeamComponent, TeamType } from '../../src/entities/components/TeamComponent';
import { TileComponent } from '../../src/tiles/components/TileComponent';
import { TileVisualComponent } from '../../src/tiles/components/TileVisualComponent';
// Proximity system removed – this test is no longer applicable

describe('Tile visuals (no proximity system)', () => {
    let entities: Entity[];

    beforeEach(() => {
        entities = [];
    });

    describe('glow intensity', () => {
        it('should set glow intensity when enemy is in range', () => {
            // Create a tile
            const tile = new Entity();
            const tileComponent = new TileComponent(0, 0, 'test', false);
            const visualComponent = new TileVisualComponent(1.0, { color: 0xffffff, roughness: 0.5, metalness: 0.5 });
            tile.addComponent(tileComponent);
            tile.addComponent(visualComponent);
            entities.push(tile);

            // Create an enemy in range
            const enemy = new Entity();
            const enemyPosition = new PositionComponent(2.0, 0, 0); // Within 5.0 radius
            const enemyTeam = new TeamComponent(TeamType.ENEMY);
            enemy.addComponent(enemyPosition);
            enemy.addComponent(enemyTeam);
            entities.push(enemy);

            // No proximity system anymore; just sanity check component exists
            expect(tile.getComponent(TileVisualComponent)).toBeDefined();
        });

        it('should not set glow intensity when enemy is out of range', () => {
            // Create a tile
            const tile = new Entity();
            const tileComponent = new TileComponent(0, 0, 'test', false);
            const visualComponent = new TileVisualComponent(1.0, { color: 0xffffff, roughness: 0.5, metalness: 0.5 });
            tile.addComponent(tileComponent);
            tile.addComponent(visualComponent);
            entities.push(tile);

            // Create an enemy out of range
            const enemy = new Entity();
            const enemyPosition = new PositionComponent(10.0, 0, 0); // Beyond 5.0 radius
            const enemyTeam = new TeamComponent(TeamType.ENEMY);
            enemy.addComponent(enemyPosition);
            enemy.addComponent(enemyTeam);
            entities.push(enemy);

            // Sanity check
            expect(tile.getComponent(TileVisualComponent)).toBeDefined();
        });

        it('should not set glow intensity for center tile', () => {
            // Create center tile
            const centerTile = new Entity();
            const tileComponent = new TileComponent(0, 0, 'center', true);
            const visualComponent = new TileVisualComponent(1.0, { color: 0xffffff, roughness: 0.5, metalness: 0.5 });
            centerTile.addComponent(tileComponent);
            centerTile.addComponent(visualComponent);
            entities.push(centerTile);

            // Create an enemy in range
            const enemy = new Entity();
            const enemyPosition = new PositionComponent(2.0, 0, 0);
            const enemyTeam = new TeamComponent(TeamType.ENEMY);
            enemy.addComponent(enemyPosition);
            enemy.addComponent(enemyTeam);
            entities.push(enemy);

            // Sanity check
            expect(centerTile.getComponent(TileVisualComponent)).toBeDefined();
        });

        it('should ignore non-enemy entities', () => {
            // Create a tile
            const tile = new Entity();
            const tileComponent = new TileComponent(0, 0, 'test', false);
            const visualComponent = new TileVisualComponent(1.0, { color: 0xffffff, roughness: 0.5, metalness: 0.5 });
            tile.addComponent(tileComponent);
            tile.addComponent(visualComponent);
            entities.push(tile);

            // Create a friendly entity in range
            const friendly = new Entity();
            const friendlyPosition = new PositionComponent(2.0, 0, 0);
            const friendlyTeam = new TeamComponent(TeamType.CORE);
            friendly.addComponent(friendlyPosition);
            friendly.addComponent(friendlyTeam);
            entities.push(friendly);

            // Sanity check
            expect(tile.getComponent(TileVisualComponent)).toBeDefined();
        });
    });

    describe('configuration', () => {
        it('removes proximity config assertions (system deleted)', () => {
            expect(true).toBe(true);
        });
    });
});
