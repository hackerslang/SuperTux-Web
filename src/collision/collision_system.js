import { Collision } from './collision.js';
import { AATriangle } from '../math/aatriangle.js';
import { Tile } from '../object/level/tile.js';
import { TILE_SIZE } from '../common/constants.js';

export class CollisionSystem {


    update(time, delta) {
        s
    }

    collisionStatic(sprite) {
        var result = this.collisionTileMap(sprite);

        //no collision with other static objects required!

        return result;
    }

    collisionTileMap(sprite) {
        var overlappingTiles = sprite.scene.physics.world.overlapTiles(sprite.body, sprite.scene.map.layers[0].tilemapLayer);

        for (var tile in overlappingTiles) {
            var realTile = Tile.getTileAt(tile.x, tile.y);

            for (let x = tileRect.left; x < tileRect.right; ++x) {
                for (let y = tileRect.top; y < tileRect.bottom; ++y) {
                    const tile = Tile.getTileAt(x, y);
                    if (!tile) continue;

                    if (tile.isSlope()) {
                        // Construct the triangle for this tile
                        const bbox = {
                            left: x * TILE_SIZE,
                            top: y * TILE_SIZE,
                            right: (x + 1) * TILE_SIZE,
                            bottom: (y + 1) * TILE_SIZE,
                            // Add any other properties your AATriangle expects
                        };
                        const triangle = new AATriangle(bbox, tile.data);

                        // Assume 'rect' is your player or object rectangle
                        const result = Collision.rectangleCollidesWithAATriangle(rect, triangle);

                        if (result && result.hits) {
                            // Apply collision response, e.g.:
                            // rect.velocity.x = ...;
                            // rect.velocity.y = ...;
                            // or set constraints, etc.
                            // You may also want to set a flag if the player is on the ground (slope)
                        }
                    }
                    // ... handle other tile types as needed ...
                }
            }
        }
    }
}