# JANK

TypeScript skeleton project with Vite, Three.js, Jest, and GitHub Pages deployment.

## Setup

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Navigate to `http://localhost:5173/`

## Development

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run all tests
- `npm run test:changed` - Run tests on changed files
- `npm run lint` - Run ESLint with auto-fix
- `npm run type-check` - TypeScript type checking

## Project Structure

```
/src
  main.ts           # Game entry point
  /ui               # User interface components
  /systems          # Game infrastructure (eventing, logging, renderer)
  /ecs              # SHARED ECS infrastructure
    Entity.ts
    IComponent.ts
    IEntitySystem.ts
  /entities         # General game entities (player, enemies, pickups)
    /components
      GeometryComponent.ts
      HealthComponent.ts
      PositionComponent.ts
      ...
    /systems
      BobAnimationSystem.ts
      RotationSystem.ts
      ...
    EntityFactory.ts
  /tiles            # Hexagonal tile system
    /components
      TileComponent.ts
      TileVisualComponent.ts
      TileEffectComponent.ts
    /systems
      TileAnimationSystem.ts
      TileHeightSystem.ts
      ...
    TileFactory.ts
    TileGrid.ts
    TileManager.ts
  /environment      # World elements (sky, floor, walls)
```

## GitHub Pages Deployment

The project is configured for automatic deployment to GitHub Pages:

1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Site available at: `https://[username].github.io/Jank/`

## Pre-commit Hook

Run `./scripts/pre-commit.sh` to execute linting and tests before committing.

## Tech Stack

- **TypeScript** (strict mode)
- **Vite** (dev server + bundling)
- **Three.js** (3D graphics)
- **Jest** (unit testing)
- **ESLint** (code linting)
- **GitHub Actions** (CI/CD)

