# Vanilla JS Setup Guide

> **Architecture**: Pure vanilla JavaScript, no frameworks
> 
> **Why**: Simplicity, speed, perfect for GitHub Pages
> 
> **When to reconsider**: If Phase 2 UI becomes too complex

---

## Technology Stack

**Core:**
- Vanilla JavaScript (ES6+)
- HTML5 Canvas 2D API
- Native DOM manipulation
- CSS3 for styling

**No dependencies:**
- ❌ No React
- ❌ No build tools (initially)
- ❌ No npm packages (for Phase 1)
- ✅ Just HTML + JS + CSS

---

## Project Structure (Phase 1)

```
factory-defense/
├── index.html              # Main HTML file
├── styles.css              # Global styles
├── config.js               # Game configuration
├── src/
│   ├── main.js             # Entry point, initializes game
│   ├── core/
│   │   ├── EventBus.js     # Event system
│   │   ├── GameLoop.js     # Main game loop
│   │   └── InputHandler.js # Mouse/keyboard input
│   ├── state/
│   │   └── RunState.js     # Within-run state
│   ├── entities/
│   │   ├── Robot.js        # Player robot
│   │   ├── Enemy.js        # Enemy entities
│   │   └── Projectile.js   # Projectile entities
│   ├── systems/
│   │   ├── CombatSystem.js
│   │   ├── WaveSystem.js
│   │   ├── MachineSystem.js
│   │   └── ScrapManager.js
│   ├── rendering/
│   │   ├── Renderer.js     # Main renderer
│   │   ├── GridRenderer.js
│   │   └── EntityRenderer.js
│   └── utils/
│       ├── math.js
│       └── pathfinding.js
└── assets/
    └── (sprites, audio later)
```

---

## Basic File Templates

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factory Defense</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="game-container">
    <canvas id="game-canvas"></canvas>
    <div id="hud">
      <div id="wave-counter">Wave: 1</div>
      <div id="factory-health">Factory Health: 20</div>
      <div id="scrap-counter">Scrap: 0</div>
    </div>
  </div>
  
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

### src/main.js
```javascript
import { GameLoop } from './core/GameLoop.js';
import { CONFIG } from '../config.js';

// Initialize canvas
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

// Initialize game
const game = new GameLoop(ctx);
game.start();
```

### config.js
```javascript
export const CONFIG = {
  // Canvas
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  
  // Grid
  GRID_SIZE: 12,
  TILE_SIZE: 48,
  
  // Robot
  ROBOT: {
    BASE_DAMAGE: 10,
    BASE_FIRE_RATE: 1.0,
    BASE_RANGE: 200,
    BASE_HEALTH: 100
  },
  
  // Enemies
  ENEMIES: {
    SCOUT: {
      health: 20,
      speed: 2.5,
      damage: 1,
      scrapValue: 5
    }
  },
  
  // Machines
  MACHINES: {
    ENERGY: {
      costs: [50, 100, 200],
      fireRateBonus: [0.2, 0.5, 1.0]
    }
  },
  
  // Game
  FACTORY_MAX_HEALTH: 20,
  WAVE_INTERVAL: 15000 // 15 seconds
};
```

---

## DOM Manipulation Patterns

### Updating HUD
```javascript
class HUD {
  static updateWave(waveNumber) {
    document.getElementById('wave-counter').textContent = `Wave: ${waveNumber}`;
  }
  
  static updateScrap(amount) {
    document.getElementById('scrap-counter').textContent = `Scrap: ${amount}`;
  }
  
  static updateFactoryHealth(health) {
    const element = document.getElementById('factory-health');
    element.textContent = `Factory Health: ${health}`;
    
    // Visual feedback
    if (health < 5) {
      element.classList.add('critical');
    }
  }
}
```

### Creating UI Elements
```javascript
class UpgradeButton {
  constructor(machineType, level, cost) {
    this.element = document.createElement('button');
    this.element.className = 'upgrade-btn';
    this.element.textContent = `Upgrade ${machineType} - ${cost} scrap`;
    this.element.onclick = () => this.onUpgrade();
  }
  
  onUpgrade() {
    // Emit event
    eventBus.emit('machine:upgrade:requested', {
      type: this.machineType,
      level: this.level
    });
  }
  
  attach(parentElement) {
    parentElement.appendChild(this.element);
  }
}
```

---

## Event System (No Framework Needed)

### Simple Event Bus
```javascript
export class EventBus {
  constructor() {
    this.listeners = {};
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
  
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
}

export const eventBus = new EventBus();
```

---

## Canvas Rendering Pattern

```javascript
export class Renderer {
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.config.CANVAS_WIDTH, this.config.CANVAS_HEIGHT);
  }
  
  render(gameState) {
    this.clear();
    
    this.renderGrid(gameState.grid);
    this.renderEntities(gameState.entities);
    this.renderProjectiles(gameState.projectiles);
  }
  
  renderGrid(grid) {
    const tileSize = this.config.TILE_SIZE;
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const tile = grid[y][x];
        this.ctx.fillStyle = this.getTileColor(tile);
        this.ctx.fillRect(
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize
        );
      }
    }
  }
}
```

---

## Running the Game

### Development (Local)
```bash
# Option 1: Python simple server
python3 -m http.server 3456

# Option 2: Node.js http-server (if you have Node)
npx http-server -p 3456

# Option 3: VS Code Live Server extension
# Just right-click index.html and "Open with Live Server"
```

Then open: `http://localhost:3456`

### Production (GitHub Pages)
1. Push to GitHub
2. Enable GitHub Pages in repo settings
3. Deploy from main branch
4. Done! No build step needed.

---

## Benefits of Vanilla JS

✅ **Simplicity**
- No build configuration
- No dependency management
- Direct browser execution

✅ **Performance**
- Zero framework overhead
- Faster initial load
- Direct DOM manipulation

✅ **Learning**
- Understand fundamentals
- No magic, clear control flow
- Portable knowledge

✅ **Deployment**
- GitHub Pages instant deploy
- No build artifacts
- Just commit and push

---

## When to Add Build Tools

**Consider adding Vite/Rollup if:**
- File size becomes issue (need minification)
- Want TypeScript support
- Need code splitting
- Tree shaking desired

**For now**: Keep it simple, vanilla JS is perfect for Phase 1.

---

## Phase 2 Considerations

**If UI complexity grows:**
- Skill tree with 15+ nodes
- Complex part inventory UI
- Multiple menu screens with animations
- State synchronization becomes painful

**Then consider:**
- Add React (for UI only, Canvas stays vanilla)
- Use Vite for build tooling
- Keep game logic in vanilla JS
- React just renders menus/UI

**Hybrid approach:**
```
Canvas Game (Vanilla JS) + UI Overlays (React if needed)
```

---

## Resources

**Canvas API:**
- [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [HTML5 Canvas Cheat Sheet](https://simon.html5.org/dump/html5-canvas-cheat-sheet.html)

**ES6 Modules:**
- [MDN JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

**Game Loop:**
- [Game Programming Patterns - Game Loop](https://gameprogrammingpatterns.com/game-loop.html)

---

## Next Steps

With vanilla JS architecture confirmed:
1. Create initial file structure
2. Set up config.js
3. Build GameLoop and basic rendering
4. Implement Phase 1.1: Grid Rendering

Ready to build! 🚀

