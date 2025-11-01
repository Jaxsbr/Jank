import * as THREE from 'three';
import { EntityManager } from './ecs/EntityManager';
import { EntityFactory } from './entities/EntityFactory';
import { HealthComponent } from './entities/components/HealthComponent';
import { AbilitySystem } from './entities/systems/AbilitySystem';
import { AttackAnimationSystem } from './entities/systems/AttackAnimationSystem';
import { BobAnimationSystem } from './entities/systems/BobAnimationSystem';
import { CombatSystem } from './entities/systems/CombatSystem';
import { DamageVisualSystem } from './entities/systems/DamageVisualSystem';
import { EffectTickSystem } from './entities/systems/EffectTickSystem';
import { EnemySpawnerSystem } from './entities/systems/EnemySpawnerSystem';
import { EntityCleanupSystem } from './entities/systems/EntityCleanupSystem';
import { HitParticleSystem } from './entities/systems/HitParticleSystem';
import { KnockbackOnHitSystem } from './entities/systems/KnockbackOnHitSystem';
import { MeleeAttackSystem } from './entities/systems/MeleeAttackSystem';
import { MovementSystem } from './entities/systems/MovementSystem';
import { RenderSystem } from './entities/systems/RenderSystem';
import { RotationSystem } from './entities/systems/RotationSystem';
import { StunPulseVFXSystem } from './entities/systems/StunPulseVFXSystem';
import { StunSystem } from './entities/systems/StunSystem';
import { TargetingSystem } from './entities/systems/TargetingSystem';
import { EnvironmentManager } from './environment/EnvironmentManager';
import { defaultEnvironment } from './environment/configs/defaultEnvironment';
import './styles.css';
import { Renderer } from './systems/Renderer';
import { Event } from './systems/eventing/Event';
import { GlobalEventDispatcher } from './systems/eventing/EventDispatcher';
import { EventType } from './systems/eventing/EventType';
import { CoreEnemyVFXBridge } from './tiles/CoreEnemyVFXBridge';
import { TileManager } from './tiles/TileManager';
import { TileVFXController } from './tiles/TileVFXController';
import { defaultTileAnimationConfig } from './tiles/configs/TileAnimationConfig';
import { TileAnimationSystem } from './tiles/systems/TileAnimationSystem';
import { TileRangeRingSystem } from './tiles/systems/TileRangeRingSystem';
import { AbilityButton } from './ui/AbilityButton';
import { CoreHPBarSystem } from './ui/CoreHPBarSystem';
import { CoreHPHUD } from './ui/CoreHPHUD';
import { GameOverUI } from './ui/GameOverUI';
import { GameStatsHUD } from './ui/GameStatsHUD';
import { TargetingModeToggleUI } from './ui/TargetingModeToggleUI';
import { UpgradeShopUI } from './ui/UpgradeShopUI';
// import { TileHeightSystem } from './tiles/systems/TileHeightSystem';
import { TeamComponent } from './entities/components/TeamComponent';
import { defaultDeathEffectConfig } from './entities/config/DeathEffectConfig';
import { defaultEffectTickConfig } from './entities/config/EffectTickConfig';
import { defaultKnockbackConfig } from './entities/config/KnockbackConfig';
import { defaultMetaPointsConfig } from './entities/config/MetaPointsConfig';
import { DeathEffectSystem } from './entities/systems/DeathEffectSystem';
import { DebugUI } from './ui/DebugUI';
import { metaPointsService } from './utils/MetaPointsService';
import { Time } from './utils/Time';

const scene = new THREE.Scene();
const renderer = new Renderer(window.innerWidth, window.innerHeight)
const renderSystem = new RenderSystem(renderer, scene)
const bobAnimationSystem = new BobAnimationSystem()
const movementSystem = new MovementSystem()
const rotationSystem = new RotationSystem()
const targetingSystem = new TargetingSystem(GlobalEventDispatcher)
const meleeAttackSystem = new MeleeAttackSystem()
const entityManager = new EntityManager(GlobalEventDispatcher)
const combatSystem = new CombatSystem(GlobalEventDispatcher)
const damageVisualSystem = new DamageVisualSystem(GlobalEventDispatcher)
const effectTickSystem = new EffectTickSystem(GlobalEventDispatcher, defaultEffectTickConfig.intervalSeconds)
const attackAnimationSystem = new AttackAnimationSystem()
const knockbackOnHitSystem = new KnockbackOnHitSystem(GlobalEventDispatcher, defaultKnockbackConfig)
const hitParticleSystem = new HitParticleSystem(GlobalEventDispatcher, scene)
const stunPulseVFXSystem = new StunPulseVFXSystem(GlobalEventDispatcher, scene)
const deathEffectSystem = new DeathEffectSystem(scene, entityManager, GlobalEventDispatcher, defaultDeathEffectConfig)
new EntityCleanupSystem(scene, GlobalEventDispatcher)
const entityFactory = new EntityFactory(scene, entityManager)
const enemySpawner = new EnemySpawnerSystem(entityFactory, entityManager, {
    innerRadius: 6,
    outerRadius: 12,
    intervalSeconds: 4,
    spawnImmediately: true,
})

const tileAnimationSystem = new TileAnimationSystem(defaultTileAnimationConfig.speed);
const tileRangeRingSystem = new TileRangeRingSystem();
const tileVFXController = new TileVFXController(GlobalEventDispatcher);
// Bridge listens on global dispatcher; instance retained for lifecycle
// Instantiate bridge (no direct usage needed)
new CoreEnemyVFXBridge(GlobalEventDispatcher, tileVFXController);
// const tileHeightSystem = new TileHeightSystem(2, 3);
const tileManager = new TileManager(scene);
tileManager.initialize()

// Create HP HUD (screen-space) and systems
const coreHPHUD = new CoreHPHUD(window.innerWidth, window.innerHeight);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const coreHPBarSystem = new CoreHPBarSystem(coreHPHUD as unknown as any, entityManager);

// Create a larger uniform grid for demo
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
tileManager.unlockNextRing(); // Ring 1
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
tileManager.unlockNextRing(); // Ring 2
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
tileManager.unlockNextRing(); // Ring 3

// Create environment (side effects: adds floor, skybox, etc. to scene)
new EnvironmentManager(scene, defaultEnvironment);

// Create ability systems
const abilitySystem = new AbilitySystem();
const stunSystem = new StunSystem();

// Create new UI systems
const gameStatsHUD = new GameStatsHUD();

// Set up wave getter for enemy spawner (for HP scaling)
enemySpawner.setWaveGetter(() => {
    return gameStatsHUD.getWave();
});

const upgradeShopUI = new UpgradeShopUI({
    onReplay: () => {
        restartGame();
    }
});
const gameOverUI = new GameOverUI({
    onReplay: () => {
        restartGame();
    },
    onUpgrade: () => {
        upgradeShopUI.show();
    }
});
const abilityButton = new AbilityButton(entityManager, {
    onActivate: () => {
        abilitySystem.activateAbility();
    }
});
const targetingModeToggleUI = new TargetingModeToggleUI(entityManager, {
    onModeChanged: () => {
        // Mode changed - TargetingSystem will pick up the change on next target search
    }
});

// Game state
let gameState: 'playing' | 'paused' | 'gameOver' = 'playing';
const KILLS_PER_WAVE = 10; // Advance wave every N kills

// Create the game core
entityFactory.createCoreEntity()



// Create the UI
const debugUI = new DebugUI(entityManager, {
    onRestartGame: () => {
        restartGame();
    }
});

// Game initialization
function initializeGame(): void {
    // Set entities reference for systems
    combatSystem.setEntities(entityManager.getEntities());
    damageVisualSystem.setEntities(entityManager.getEntities());
    knockbackOnHitSystem.setEntities(entityManager.getEntities());
    hitParticleSystem.setEntities(entityManager.getEntities());
    stunPulseVFXSystem.setEntities(entityManager.getEntities());
    
    gameStatsHUD.reset();
    gameStatsHUD.setWave(1); // Start at wave 1
}

// Game restart
function restartGame(): void {
    // Set game state to paused temporarily to prevent spawns during cleanup
    gameState = 'paused';
    
    // Reset enemy spawner difficulty to starting state
    // This resets: spawn timer, spawn counter, and spawn interval (difficulty scaling)
    enemySpawner.reset();
    
    // Clear all entities (including enemies, effects, particles, etc.)
    // This ensures no enemies remain from the previous run
    entityManager.clearAllEntities();
    
    // Reset HP bar system to clear cached core entity reference
    coreHPBarSystem.resetCoreEntity();
    
    // Recreate the core entity (automatically has full health from HealthComponent constructor)
    entityFactory.createCoreEntity();
    
    // Reset game state to playing and reinitialize systems
    gameState = 'playing';
    initializeGame();
}

// Listen for entity death events to track kills and game over
GlobalEventDispatcher.registerListener('MainGame', {
    onEvent: (event: Event) => {
        if (event.eventName === EventType.EnemyKilled) {
            gameStatsHUD.addKill();
            const kills = gameStatsHUD.getKills();
            
            // Check kill milestones and award points
            let highestMilestone = metaPointsService.getHighestKillMilestone();
            for (const milestone of defaultMetaPointsConfig.killMilestones) {
                if (kills >= milestone.kills && milestone.kills > highestMilestone) {
                    metaPointsService.addKillPoints(milestone.points);
                    metaPointsService.setHighestKillMilestone(milestone.kills);
                    highestMilestone = milestone.kills; // Update local tracking
                    // Optional: could show notification here
                }
            }
            
            // Advance wave every N kills
            if (kills % KILLS_PER_WAVE === 0) {
                const newWave = gameStatsHUD.getWave() + 1;
                gameStatsHUD.setWave(newWave);
                
                // Check wave milestones and award points
                let highestWaveMilestone = metaPointsService.getHighestWaveMilestone();
                for (const milestone of defaultMetaPointsConfig.waveMilestones) {
                    if (newWave >= milestone.wave && milestone.wave > highestWaveMilestone) {
                        metaPointsService.addWavePoints(milestone.points);
                        metaPointsService.setHighestWaveMilestone(milestone.wave);
                        highestWaveMilestone = milestone.wave; // Update local tracking
                        // Optional: could show notification here
                    }
                }
            }
        } else if (event.eventName === EventType.EntityDeath) {
            const isCore = event.args['isCore'] as boolean;
            
            if (isCore) {
                // Core died - game over
                if (gameState === 'playing') {
                    gameState = 'gameOver';
                    const wave = gameStatsHUD.getWave();
                    const kills = gameStatsHUD.getKills();
                    gameOverUI.show(wave, kills);
                }
            }
        }
    }
});

// Initialize
initializeGame();

// Fixed timestep game loop with rAF rendering
let lastNow = performance.now();
let accumulator = 0;
const FIXED_DT = 1 / 60; // seconds per tick
const MAX_STEPS = 5;

function animate(): void {
    requestAnimationFrame(animate);

    const now = performance.now();
    let frameDelta = (now - lastNow) / 1000;
    lastNow = now;
    // Avoid spiral of death
    if (frameDelta > 0.25) frameDelta = 0.25;
    accumulator += frameDelta;

    // Fixed-step simulation updates (only when playing)
    if (gameState === 'playing') {
        let steps = 0;
        while (accumulator >= FIXED_DT && steps < MAX_STEPS) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            Time.advanceFixed(FIXED_DT);
            const entities = entityManager.getEntities();

            // Gameplay-affecting systems (order matters)
            knockbackOnHitSystem.update(entities);
            stunSystem.update(entities);
            abilitySystem.update(entities);
            movementSystem.update(entities);
            rotationSystem.update(entities);
            targetingSystem.update(entities);
            meleeAttackSystem.update(entities);
            effectTickSystem.update(entities);
            enemySpawner.update(FIXED_DT);

            steps++;
            accumulator -= FIXED_DT;
        }
    } else {
        // Consume accumulator when paused
        accumulator = 0;
    }

    // Frame-based visuals (use actual frame delta for smoothness)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    Time.setDeltaForFrame(frameDelta);
    const entities = entityManager.getEntities();
    bobAnimationSystem.update(entities);
    damageVisualSystem.update();
    hitParticleSystem.update();
    stunPulseVFXSystem.update();
    deathEffectSystem.update();
    attackAnimationSystem.update(entities);

    const tileEntities = tileManager.getAllTiles();
    tileVFXController.setTiles(tileEntities);
    tileVFXController.setCenterFromGrid(tileManager.getTileGrid());
    // Apply range ring overlays before idle heartbeat/glow calculations
    tileRangeRingSystem.update(tileEntities, entities);
    tileAnimationSystem.update(tileEntities);
    tileVFXController.update(frameDelta);

    // UI
    coreHPBarSystem.update();
    abilityButton.update();
    targetingModeToggleUI.update();
    
    // Update enemy count and check for wave progression
    if (gameState === 'playing') {
        let enemyCount = 0;
        entities.forEach(entity => {
            const team = entity.getComponent(TeamComponent);
            if (team?.isEnemy()) {
                const health = entity.getComponent(HealthComponent);
                if (health?.isAlive()) {
                    enemyCount++;
                }
            }
        });
        gameStatsHUD.setEnemiesAlive(enemyCount);
    }

    // Render
    renderSystem.update();
    renderer.renderOverlay(coreHPHUD.getUIScene(), coreHPHUD.getUICamera());
}

animate();

// Browser Events
window.addEventListener('resize', () => {
    GlobalEventDispatcher.dispatch(new Event<{ width: number; height: number }>(
        EventType.WindowResize, {
            width: window.innerWidth,
            height: window.innerHeight
        }));
    coreHPHUD.onResize(window.innerWidth, window.innerHeight);
});
