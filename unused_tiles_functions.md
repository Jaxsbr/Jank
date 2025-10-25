# Unused Functions in /src/tiles Directory

This document lists all functions that are defined in the `/src/tiles` directory but are not being used anywhere in the codebase.

## TileComponent.ts

**File:** `src/tiles/components/TileComponent.ts`

### Unused Functions:
- `getQ()` - Returns the Q coordinate of the hex tile
- `getR()` - Returns the R coordinate of the hex tile  
- `getTileType()` - Returns the tile type string
- `isCenterTile()` - Returns whether this is a center tile
- `getIsActive()` - Returns whether the tile is active
- `getLevel()` - Returns the tile level
- `setActive(active: boolean)` - Sets the tile active state
- `setLevel(level: number)` - Sets the tile level
- `upgrade()` - Upgrades the tile level by 1
- `getHexKey()` - Returns a string key for the hex coordinates
- `getDistanceFromCenter()` - Calculates distance from center tile

**Note:** Only `getLevel()` and `getTileType()` are used in `TileHeightSystem.ts`

## TileEffectComponent.ts

**File:** `src/tiles/components/TileEffectComponent.ts`

### Unused Functions:
- `setPower(power: number)` - Sets the effect power
- `setDuration(duration: number)` - Sets the effect duration  
- `setCooldown(cooldown: number)` - Sets the cooldown time
- `deactivate()` - Force deactivates the effect
- `getRemainingCooldown(currentTime: number)` - Gets remaining cooldown time

**Note:** Most getter methods are used in `TileEffectSystem.ts`, but the setter methods are unused.

## TileVisualComponent.ts

**File:** `src/tiles/components/TileVisualComponent.ts`

### Unused Functions:
- `setColor(color: number)` - Updates tile color
- `setMaterial(roughness?: number, metalness?: number)` - Updates material properties
- `getCurrentHeight()` - Gets current height
- `getTargetHeight()` - Gets target height
- `isHeightAnimationComplete()` - Checks if height animation is complete

**Note:** Only `setTargetHeight()`, `updateHeight()`, `setEmissive()`, and `getTileMesh()` are used.

## TileAnimationSystem.ts

**File:** `src/tiles/systems/TileAnimationSystem.ts`

### Unused Functions:
- `setAnimationSpeed(speed: number)` - Sets animation speed
- `getAnimationSpeed()` - Gets animation speed

**Note:** The entire `TileAnimationSystem` class is commented out in `main.ts` and not being used.

## TileEffectSystem.ts

**File:** `src/tiles/systems/TileEffectSystem.ts`

### Unused Functions:
- `setEffectRadius(radius: number)` - Sets effect radius
- `setEffectCooldown(cooldown: number)` - Sets effect cooldown
- `getEffectRadius()` - Gets effect radius
- `getEffectCooldown()` - Gets effect cooldown
- `getActiveEffectsInRadius(centerEntity: Entity, radius: number)` - Gets active effects in radius

**Note:** Only `activateTileEffect()` is used, and the system is instantiated but many of its methods are unused.

## TileHeightSystem.ts

**File:** `src/tiles/systems/TileHeightSystem.ts`

### Unused Functions:
- `setBaseHeight(height: number)` - Sets base height for all tiles
- `setHeightPerLevel(height: number)` - Sets height increment per level
- `getBaseHeight()` - Gets base height
- `getHeightPerLevel()` - Gets height per level

**Note:** The entire `TileHeightSystem` class is commented out in `main.ts` and not being used.

## TileManager.ts

**File:** `src/tiles/TileManager.ts`

### Unused Functions:
- `removeTile(coordinate: HexCoordinate)` - Removes a tile at coordinates
- `getCenterTile()` - Gets the center tile
- `getTilesInRadius(radius: number)` - Gets tiles in radius around center
- `getTileGrid()` - Gets the tile grid for direct access
- `updateCenterTileHeight()` - Updates center tile height (private method)

**Note:** Only `addTile()`, `getAllTiles()`, and `initialize()` are used.

## TileGrid.ts

**File:** `src/tiles/TileGrid.ts`

### Unused Functions:
- `getCenterTile()` - Gets the center tile
- `getTilesInRadius(center: HexCoordinate, radius: number)` - Gets tiles in radius
- `getAllTiles()` - Gets all tiles
- `hexToWorldPosition(coordinate: HexCoordinate, tileSize: number)` - Converts hex to world position
- `worldToHexPosition(worldPos: THREE.Vector3, tileSize: number)` - Converts world to hex position
- `hexRound(hex: HexCoordinate)` - Rounds fractional hex coordinates (private method)

**Note:** Only `addTile()`, `getTile()`, and `coordinateToKey()` are used.

## Summary

The analysis reveals that many functions in the tiles system are unused, particularly:

1. **TileComponent**: Most getter/setter methods are unused
2. **TileEffectComponent**: Setter methods are unused  
3. **TileVisualComponent**: Several utility methods are unused
4. **TileAnimationSystem**: Entire class is unused (commented out)
5. **TileHeightSystem**: Entire class is unused (commented out)
6. **TileEffectSystem**: Many configuration methods are unused
7. **TileManager**: Several utility methods are unused
8. **TileGrid**: Most spatial query methods are unused

This suggests the tiles system may be over-engineered for current usage, with many features implemented but not actively used in the application.
