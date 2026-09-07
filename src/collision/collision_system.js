import { EPSILON_COLLISION, SHIFT_DELTA, TILE_SIZE } from '../common/constants.js';
import { SectorScene } from '../scenes/sectorscene.js';
import { Tile, TileType } from '../object/level/tile.js';
import { GlobalGameConfig } from '../game.js';
import { AATriangle } from '../math/aatriangle.js';
import { Rect } from '../math/rect.js';
import { Sector } from '../object/level/sector.js';
import { Collision } from './collision.js';
import { CollisionGroup } from './collision_group.js';
import { CollisionHit, HitResponse } from './collision_hit.js';
import { Constraints } from './constraints.js';

export class RaycastResult {
    constructor() {
        this.isValid = false;
        this.hit = {}; // Tile or CollisionObject
        this.box = new Rect();
    }
}

export var RaycastIgnore = {
    IGNORE_NONE: 0,
    IGNORE_TILES: 1,
    IGNORE_OBJECTS: 2
};

export class CollisionSystem {
    constructor(config) {
        this.sectorScene = config.sectorScene;
    }

    update(time, delta) {
        this.delta = delta;

        for (var object of this.sectorScene.collisionObjects) {
            object.dest = new Rect(object.bbox);
            object.pressure = new Phaser.Math.Vector2(0, 0);
            object.dest.move(object.getMovement(delta));
        }

        // Part 1: COLGROUP_MOVING vs COLGROUP_STATIC and tilemap.
        for (var object of this.sectorScene.collisionObjects) {
            if (object.getGroup() === undefined)
                continue;

            if ((object.getGroup() != CollisionGroup.COLGROUP_MOVING
                && object.getGroup() != CollisionGroup.COLGROUP_MOVING_STATIC
                && object.getGroup() != CollisionGroup.COLGROUP_MOVING_ONLY_STATIC)
                || !object.isValid())
                continue;

            this.collisionStaticConstrains(object);
        }

        // Part 2: COLGROUP_MOVING vs tile attributes.
        for (var object of this.sectorScene.collisionObjects) {
            if (object.getGroup() === undefined)
                continue;

            if ((object.getGroup() != CollisionGroup.COLGROUP_MOVING
                && object.getGroup() != CollisionGroup.COLGROUP_MOVING_STATIC
                && object.getGroup() != CollisionGroup.COLGROUP_MOVING_ONLY_STATIC)
                || !object.isValid())
                continue;

            var tileAttributes = this.collisionTileAttributes(object.dest, object.getMovement(delta));
            if (tileAttributes >= Tile.FIRST_INTERESTING_FLAG) {
                object.collisionTile(tileAttributes);
            }
        }

        // Part 2.5: COLGROUP_MOVING vs COLGROUP_TOUCHABLE.
        for (var object of this.sectorScene.collisionObjects) {
            if (object.getGroup() === undefined)
                continue;

            if ((object.getGroup() != CollisionGroup.COLGROUP_MOVING
                && object.getGroup() != CollisionGroup.COLGROUP_MOVING_STATIC)
                || !object.isValid())
                continue;

            for (var object2 of this.sectorScene.collisionObjects) {
                if (object.getGroup() === undefined || object.getGroup() != CollisionGroup.COLGROUP_TOUCHABLE
                    || !object.isValid())
                    continue;

                if (object.dest.overlaps(object2.dest)) {
                    var normal = Phaser.Math.Vector2(0, 0);
                    var hit = new CollisionHit();

                    this.getHitNormal(object, object2, hit, normal);
                    if (!object.collides(object2, hit))
                        continue;
                    if (!object2.collides(object, hit))
                        continue;

                    object.collision(object2, hit);
                    object2.collision(object, hit);
                }
            }
        }

        var index = 0;
        // Part 3: COLGROUP_MOVING vs COLGROUP_MOVING.
        for (var object of this.sectorScene.collisionObjects) {
            var object = this.sectorScene.collisionObjects[index];
            index++;
            if (object.getGroup() === undefined)
                continue;
                
            if (!object.isValid() ||
                (object.getGroup() != CollisionGroup.COLGROUP_MOVING &&
                object.getGroup() != CollisionGroup.COLGROUP_MOVING_STATIC))
                continue;

            for (var i2 = index + 1; i2 < this.sectorScene.collisionObjects.length; ++i2) {
                var object2 = this.sectorScene.collisionObjects[i2];

                if ((object2.getGroup() != CollisionGroup.COLGROUP_MOVING
                    && object2.getGroup() != CollisionGroup.COLGROUP_MOVING_STATIC)
                    || !object2.isValid())
                    continue;
                // if (!object.parent.isEnemy) { // is player? 
                //     console.log("a", object.bbox, " ", object.dest)
                // }
                this.collisionObject(object, object2);
                // if (!object.parent.isEnemy) { // is player? 
                //     console.log("b", object.bbox, " ", object.dest)
                // }
            }
        }

        // Apply object movement.
        for (var object of this.sectorScene.collisionObjects) {
            // if (!object.parent.isEnemy) { // is player? 
            //     console.log("c", object.bbox, " ", object.dest)
            // }
            object.bbox = new Rect(object.dest);
            // if (!object.parent.isEnemy) { // is player? 
            //     console.log("d", object.bbox, " ", object.dest)
            // }
        }
    }

    draw() {
        if (GlobalGameConfig.physics.arcade.debug) {
            const camera = this.sectorScene.cameras.main;
            let cameraX = camera.scrollX;
            let cameraY = camera.scrollY;

            let graphics = this.sectorScene.add.graphics();
        }
    }

    getTilesInCameraView(scrollX, scrollY, width, height) {
        const tileXStart = Math.floor(scrollX / TILE_SIZE);
        const tileYStart = Math.floor(scrollY / TILE_SIZE);
        const tileXEnd = Math.ceil((scrollX + width) / TILE_SIZE);
        const tileYEnd = Math.ceil((scrollY + height) / TILE_SIZE);

        let tileData = sectorData.data;
        let tiles = [];

        for (var x = tileXStart; x < tileXEnd; x += 32) {
            for (var y = tileYStart; y < tileYEnd; y += 32) {
                var tile = Tile.getTileAtInside(x, y);

                this.drawDebugTile(tile);
            }
        }
    }

    collisionStaticConstrains(object) {
        var infinity = Number.MAX_VALUE;
        var constraints = new Constraints();
        var movement = object.getMovement(this.delta);
        var pressure = new Phaser.Math.Vector2(0, 0);
        var dest = new Rect(object.dest);

        for (var i = 0; i < 2; ++i) {
            constraints = this.collisionStatic(object, dest, movement, pressure, constraints);

            if (!constraints.hasConstraints())
                break;
        }

        if (constraints.positionBottom < infinity) {
            var height = constraints.height;

            if (height < object.bbox.height) {
                pressure.y += object.bbox.height - height;
                object.pressure.y = pressure.y;
            } else {
                dest.bottom = constraints.positionBottom - EPSILON_COLLISION;
                dest.top = dest.bottom - object.bbox.height;
            }
        }

        if (constraints.hasConstraints()) {
            if (constraints.hit.top || constraints.hit.bottom) {
                constraints.hit.left = false;
                constraints.hit.right = false;
                object.collisionSolid(constraints.hit);
            }
        }

        constraints = new Constraints();

        for (var i = 0; i < 2; ++i) {
            constraints = this.collisionStatic(object, dest, movement, pressure, constraints);

            if (!constraints.hasConstraints())
                break;
        }

        const width = constraints.width;

        if (width < infinity) {
            if (width + SHIFT_DELTA < object.bbox.width) {
                pressure.x += object.bbox.width - width;
                object.pressure.x = pressure.x;
            } else {
                var xmid = constraints.getXMidPoint();
                dest.left = xmid - object.bbox.width / 2;
                dest.right = xmid + object.bbox.width / 2;
            }
        } else if (constraints.positionRight < infinity) {
            dest.right = constraints.positionRight - EPSILON_COLLISION;
            dest.left = dest.right - object.bbox.width;
        } else if (constraints.positionLeft > -infinity) {
            dest.left = constraints.positionLeft + EPSILON_COLLISION;
            dest.right = dest.left + object.bbox.width;
        }

        if (pressure.y > 0) {
            constraints = new Constraints();

            constraints = this.collisionStatic(constraints, movement, dest, object);

            if (constraints.positionBottom < infinity) {
                height = constraints.height;

                if (height + SHIFT_DELTA < object.bbox.height) {
                    var hit = new CollisionHit();

                    hit.top = true;
                    hit.bottom = true;
                    hit.crush = pressure.x > 16;
                    object.collisionSolid(hit);

                }
            }
        }
    }

    collisionStatic(object, dest, movement, pressure, constraints) {
        constraints = this.collisionTileMap(movement, dest, object);

        // Collision with other (static) objects.
        for (var i = 0; i != this.sectorScene.collisionObjects.length; ++i) {
            var staticObject = this.sectorScene.collisionObjects[i];

            if ((staticObject.getGroup() == CollisionGroup.COLGROUP_STATIC || staticObject.getGroup() == CollisionGroup.COLGROUP_MOVING_STATIC) &&
                staticObject.isValid() && !staticObject.equals(object)) {

                var newConstraints = checkCollisions(movement, dest, sprite, staticObject.dest, object, staticObject);

                if (newConstraints.hit.bottom) {
                    staticObject.collisionMovingObjectBottom(object);
                } else if (newConstraints.hit.top) {
                    object.collisionMovingObjectBottom(staticObject);
                }

                constraints.mergeConstraints(newConstraints);
            }
        }

        return constraints;
    }

    checkCollisions(objectMovement, movingObjectRect, otherObjectRect, movingObject, otherObject) {
        var constraints = new Constraints();

        var grownOtherObjectRect = otherObjectRect.grown(EPSILON_COLLISION);

        if (!movingObjectRect.overlaps(grownOtherObjectRect))
            return constraints;

        const dummmy = new CollisionHit();

        if (otherObject != null && movingObject != null && !otherObject.collides(movingObject, dummy))
            return constraints;
        if (movingObject != null && otherObject != null && !movingObject.collides(otherObject, dummy))
            return constraints;

        const itop = movingObjectRect.getBottom() - grownOtherObjectRect.top;
        const ibottom = grownOtherObjectRect.getBottom() - movingObjectRect.top;
        const ileft = movingObjectRect.getRight() - grownOtherObjectRect.left;
        const iright = grownOtherObjectRect.getRight() - movingObjectRect.left;

        var shiftout = false;

        if ((otherObject == null || this.isNotUniSolid(otherObject))
            && (movingObject == null || this.isNotUniSolid(movingObject))) {
            if (Math.abs(objectMovement.y) > Math.abs(objectMovement.x)) {
                if (ileft < SHIFT_DELTA) {
                    constraints.constrainRight(grownOtherObjectRect.left);
                    shiftout = true;
                } else if (iright < SHIFT_DELTA) {
                    constraints.constrainLeft(grownOtherObjectRect.getRight());
                    shiftout = true;
                }
            } else {
                if (itop < SHIFT_DELTA) {
                    constraints.constrainBottom(grownOtherObjectRect.top);
                    shiftout = true;
                } else if (ibottom < SHIFT_DELTA) {
                    constraints.constrainTop(grownOtherObjectRect.getBottom());
                    shiftout = true;
                }
            }
        }

        if (!shiftout) {
            if (otherObject != null && !this.isNotUniSolid(otherObject)) {
                if (movingObjectRect.getBottom() - objectMovement.y <= grownOtherObjectRect.top - (otherObject.getMovement(this.delta).y - 5)) {
                    constraints.constrainBottom(grownOtherRect.top);
                    constraints.hit.bottom = true;
                }
            } else if (otherObject != null && otherObject.getGroup() !== undefined && otherObject.getGroup() == CollisionGroup.COLGROUP_MOVING_STATIC
                && movingObject != null && !this.isNotUniSolid(movingObject)) {
                if (grownOtherObjectRect.top - otherObject.getMovement().y <= movingObjectRect.top -
                    (movingObject.getMovement(this.delta).y - 5)) {
                    constraints.constrainTop(sprite.top);
                    constraints.hit.top = true;
                }
            } else {
                const verticalPenetration = Math.min(itop, ibottom);
                const horizontalPenetration = Math.min(ileft, iright);
                //ok till here
                if (verticalPenetration < horizontalPenetration) {
                    if (itop < ibottom) {
                        constraints.constrainBottom(grownOtherObjectRect.top);
                        constraints.hit.bottom = true;
                    } else {
                        constraints.constrainTop(grownOtherObjectRect.getBottom());
                        constraints.hit.top = true;
                    }
                } else {
                    if (ileft < iright) {
                        constraints.constrainRight(grownOtherObjectRect.left);
                        constraints.hit.right = true;
                    } else {
                        constraints.constrainLeft(grownOtherObjectRect.getRight());
                        constraints.hit.left = true;
                    }
                }
            }
        }

        if (otherObject != null && movingObject != null) {
            var hit = constraints.hit;
            movingObject.collision(otherObject, hit);

            var temp = hit.left;
            hit.left = hit.right;
            hit.right = temp;

            temp = hit.top;
            hit.top = hit.bottom;
            hit.bottom = temp;

            var response = otherObject.collision(movingObject, hit);

            if (response === HitResponse.ABORT_MOVE)
                return new constraints();
        }

        return constraints;
    }

    isNotUniSolid(object) {
        return object.isTile === undefined || !object.isTile || (object.isTile && !object.isUniSolid());
    }

    collisionTileMap(movement, dest, object) {
        var constraints = new Constraints();
        // Later on, we will add multiple tile layers, so we will need to check collisions with all of them. 
        // For now, we only have one tile layer, so we will just check collisions with that one.
        var overlappingTilesRect = Tile.getTilesOverlapping(dest);
        var hitsBottom = false;

        for (let x = overlappingTilesRect.left; x < overlappingTilesRect.getRight(); ++x) {
            for (let y = overlappingTilesRect.top; y < overlappingTilesRect.getBottom(); ++y) {
                const tile = Tile.getTileAt(x, y);
                if (!tile) continue;

                if (tile.isSolid()) {
                    const tileBbox = new Rect({
                        left: x * TILE_SIZE,
                        top: y * TILE_SIZE,
                        right: (x + 1) * TILE_SIZE,
                        bottom: (y + 1) * TILE_SIZE,
                    });

                    var isRelativelySolid = true;

                    if (tile.isUniSolid()) {
                        if (!tile.isSolid(tileBbox, object.bbox, object.getVelocity())) {
                            isRelativelySolid = false;
                        }
                    }

                    if (isRelativelySolid) {
                        if (tile.isSlope()) {
                            const triangle = new AATriangle({ bbox: tileBbox, direction: tile.data });
                            const result = Collision.rectangleCollidesWithAATriangle(constraints, dest, triangle, object);
                            if (result && result.hits) {
                                hitsBottom |= result.hitsRectangleBottom;
                            }
                        } else {
                            if (object !== undefined && object.parent.objectName == "Spiky") {
                                var a = 0;
                            }

                            var newConstraints = this.checkCollisions(movement, dest, tileBbox);
                            hitsBottom |= newConstraints.hit.bottom;
                            constraints.mergeConstraints(newConstraints);
                        }
                    }
                }
            }
        }

        if (hitsBottom) {
            //todo!
        }

        return constraints;
    }

    collisionTileAttributes(dest, velocity) {
        const x1 = dest.left;
        const y1 = dest.top;
        const x2 = dest.right;
        const y2 = dest.bottom;

        var result = 0;

        const overlappingTilesRect = Tile.getTilesOverlapping(new Rect({ left: x1, top: y1, right: x2, bottom: y2 }));
        const overlappingTilesIce = Tile.getTilesOverlapping(new Rect({ left: x1, top: y1, right: x2, bottom: y2 + SHIFT_DELTA }));

        for (var x = overlappingTilesRect.left; x < overlappingTilesRect.right; ++x) {
            var y;

            for (y = overlappingTilesRect.top; y < overlappingTilesRect.bottom; ++y) {
                const tile = Tile.getTileAt(x, y);

                if (tile.isCollisionFul(tile.getTileBbox(), dest, velocity)) {
                    result |= tile.getAttributes();
                }
            }

            for (y = overlappingTilesIce.top; y < overlappingTilesIce.bottom; ++y) {
                const tile = Tile.getTileAt(x, y);

                if (tile.isCollisionFul(tile.getTileBbox(), dest, velocity)) {
                    result |= (tile.attributes & TileType.ICE);
                }
            }
        }

        return result;
    }

    collisionObject(object1, object2) {
        if (object1.collisionGroup == CollisionGroup.COLGROUP_MOVING_STATIC &&
            object2.collisionGroup == CollisionGroup.COLGROUP_MOVING_STATIC)
            return;
        
        var rect1 = new Rect(object1.dest);
        var rect2 = new Rect(object2.dest);

        var hit = new CollisionHit();

        if (rect1.overlaps(rect2)) {
            var normal = new Phaser.Math.Vector2(0, 0);

            ({ hit, normal } = this.hitNormal(object1, object2, hit, normal));

            if (!object1.collides(object2, hit))
                return;

            [hit.left, hit.right] = [hit.right, hit.left];
            [hit.top, hit.bottom] = [hit.bottom, hit.top];

            if (!object2.collides(object1, hit))
                return;

            [hit.left, hit.right] = [hit.right, hit.left];
            [hit.top, hit.bottom] = [hit.bottom, hit.top];

            var response1 = object1.collision(object2, hit);

            [hit.left, hit.right] = [hit.right, hit.left];
            [hit.top, hit.bottom] = [hit.bottom, hit.top];

            var response2 = object2.collision(object1, hit);
  
            if (response1 == HitResponse.CONTINUE && response2 == HitResponse.CONTINUE) {
                normal.scale(0.5 + EPSILON_COLLISION);
                
                object1.dest.move(-normal);
                object2.dest.move(normal);
            } else if (response1 == HitResponse.CONTINUE && response2 == HitResponse.FORCE_MOVE) {
                normal.scale(1 + EPSILON_COLLISION);

                object1.dest.move(-normal);
            } else if (response1 == HitResponse.FORCE_MOVE && response2 == HitResponse.CONTINUE) {
                normal.scale(1 + EPSILON_COLLISION);
                
                object2.dest.move(normal);
            }
        }
    }

    hitNormal(object1, object2, hit, normal) {
        const rect1 = new Rect(object1.dest);
        const rect2 = new Rect(object2.dest);

        const itop = rect1.getBottom() - rect2.top;
        const ibottom = rect2.getBottom() - rect1.top;
        const ileft = rect1.getRight() - rect2.left;
        const iright = rect2.getRight() - rect1.left;

        const verticalPenetration = Math.min(itop, ibottom);
        const horizontalPenetration = Math.min(ileft, iright);

        if (object1.isUniSolid() && rect2.getBottom() - object2.getVelocityY() > rect1.top)
            return;
        if (object2.isUniSolid() && rect1.getBottom() - object1.getVelocityY() > rect2.top)
            return;

        if (verticalPenetration < horizontalPenetration) {
            if (itop < ibottom) {
                hit.bottom = true;
                normal.y = verticalPenetration;
            } else {
                hit.top = true;
                normal.y = -verticalPenetration;
            }
        } else {
            if (ileft < iright) {
                hit.right = true;
                normal.x = horizontalPenetration;
            } else {
                hit.left = true;
                normal.x = -horizontalPenetration;
            }
        }

        return { hit, normal };
    }

    getFirstLineIntersection(lineStart, lineEnd, ignore, ignoreObject) {
        var tileResult = new RaycastResult();

        if (ignore != RaycastIgnore.IGNORE_TILES) {
            var lsx = lineStart.x;
            var lex = lineEnd.x;
            var lsy = lineStart.y;
            var ley = lineEnd.y;

            var left = lsx > lex;
            var up = lsy > ley;

            var solidTilemaps = Sector.getCurrentSector().getSolidTilemaps();
            outerLoop:
            for (var testX = lsx; left ? testX >= lex : testX <= lex; testX += left ? -16: 16) { // NOLINT.
                for (var testY = lsy; up ? testY >= ley : testY <= ley; testY += up ? -16: 16) { // NOLINT.
                    for (var i = 0; i < solidTilemaps.length; i++) {
                        const solids = solidTilemaps[i];
                        const testVector = new Phaser.Math.Vector2(testX, testY);

                        if (solids.isOutsideBounds(testVector)) {
                            continue;
                        }

                        const tile = solids.getTileAtInside(testX, testY);

                        if (tile == null) { continue; }

                        // FIXME: check collision with slope tiles
                        if (tile.attributes & TileType.SOLID)
                        {
                            tileResult.isValid = true;
                            tileResult.hit = tile;
                            tileResult.box = Tile.getTileBbox(parseInt(testVector.x / 32), parseInt(testVector.y / 32));

                            break outerLoop;
                        }
                    }
                }
            }

            finishTiles:
            if (ignore == RaycastIgnore.IGNORE_OBJECTS) {
                return tileResult;
            }

            var objectResult = new RaycastResult();

            // Check if no object is in the way.
            for (const object of this.sectorScene.collisionObjects) {
                if (object.equals(ignoreObject)) continue;
                if (!object.isValid()) continue;
                if ((object.getGroup() == CollisionGroup.COLGROUP_MOVING)
                    || (object.getGroup() == CollisionGroup.COLGROUP_MOVING_STATIC)
                    || (object.getGroup() == CollisionGroup.COLGROUP_STATIC)) {
                    if (Collision.intersectsLine(object.bbox, lineStart, lineEnd)) {
                        objectResult.isValid = true;
                        objectResult.hit = object;
                        objectResult.box = object.bbox;

                        break;
                    }
                }
            }

            if (ignore == RaycastIgnore.IGNORE_TILES)
                return objectResult;

            if (tileResult.isValid && objectResult.isValid) {
                var tiledist = Phaser.Math.Distance.BetweenPoints(new Rect(tileResult.box).getMiddle(), lineStart);
                var objdist = Phaser.Math.Distance.BetweenPoints(new Rect(objectResult.box).getMiddle(), lineStart);

                return tiledist < objdist ? tileResult : objectResult;
            }
            else if (tileResult.isValid)
                return tileResult;
            else if (objectResult.isValid)
                return objectResult;
            else {
                return new RaycastResult();
            }
        }
    }

    isFreeOfTiles(rect, ignoreUnisolid, tiletype) {
        var solidTilemaps = Sector.getCurrentSector().getSolidTilemaps();

        for (var solids of solidTilemaps) {
            // Test with all tiles in this rectangle.
            var testTiles = Tile.getTilesOverlapping(rect);

            for (var x = testTiles.left; x < testTiles.getRight(); ++x) {
                for (var y = testTiles.top; y < testTiles.getBottom(); ++y) {
                    var tile = solids.getTileAt(x, y);

                    if (tile == null) { continue; }

                    if (!(tile.attributes & tiletype))
                        continue;
                    if (tile.isUnisolid() && ignoreUnisolid)
                        continue;
                    if (tile.isSlope()) {
                        var triangle = {};
                        var tbbox = solids.getTileBbox(x, y);
                        triangle = new AATriangle({ bbox: tbbox, direction: tile.data });
                        var result = Collision.rectangleCollidesWithAATriangle(constraints, rect, triangle);
                        continue;
                    }
                    // We have a solid tile that overlaps the given rectangle.
                    return false;
                }
            }
        }
    }
}