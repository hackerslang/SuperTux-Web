import { GlobalGameConfig } from '../game.js';
import { Collision } from './collision.js';
import { Constraints } from './constraints.js';
import { AATriangle } from '../math/aatriangle.js';
import { Rect } from '../math/rect.js';
import { Tile } from '../object/level/tile.js';
import { TILE_SIZE, EPSILON_COLLISION } from '../common/constants.js';
import { CollisionHit, HitResponse } from './collision_hit.js'; 
import { CollisionGroup } from './collision_group.js';
import { SHIFT_DELTA } from '../common/constants.js';

export class CollisionSystem {
    constructor(config) {
        this.sectorScene = config.sectorScene;
    }

    update(time, delta) {
        for (var object of this.sectorScene.collisionObjects) {
            object.dest = object.bbox;
            object.pressure = new Phaser.Math.Vector2(0, 0);
            object.dest.move(object.getMovement(delta));
            // console.log(object.getMovement(delta));
            // console.log("coll:");
            // console.log(object.parent);
            // console.log("bbox");
            // console.log(object.bbox);
            // console.log("dest");
            // console.log(object.dest);
            // console.log("collend");
        }

        // Part 1: COLGROUP_MOVING vs COLGROUP_STATIC and tilemap.
        for (var object of this.sectorScene.collisionObjects) {
            if (object.group === undefined)
                continue;

            if ((object.group != CollisionGroup.COLGROUP_MOVING
                && object.group != CollisionGroup.COLGROUP_MOVING_STATIC
                && object.group != CollisionGroup.COLGROUP_MOVING_ONLY_STATIC)
                || !object.isValid())
                continue;
   
            this.collisionStaticConstrains(object);
        }

        // Part 2: COLGROUP_MOVING vs tile attributes.
        for (var object of this.sectorScene.collisionObjects) {
            if (object.group === undefined)
                continue;

            if ((object.group != CollisionGroup.COLGROUP_MOVING
                && object.group != CollisionGroup.COLGROUP_MOVING_STATIC
                && object.group != CollisionGroup.COLGROUP_MOVING_ONLY_STATIC)
                || !object.isValid())
                continue;

            var tileAttributes = this.collisionTileAttributes(object.dest, object.getMovement());
            if (tileAttributes >= Tile.FIRST_INTERESTING_FLAG) {
                object.collisionTile(tileAttributes);
            }
        }

        // Part 2.5: COLGROUP_MOVING vs COLGROUP_TOUCHABLE.
        for (var object of this.sectorScene.collisionObjects)
        {
            if (object.group === undefined)
                continue;

            if ((object.group != CollisionGroup.COLGROUP_MOVING
                && object.group != CollisionGroup.COLGROUP_MOVING_STATIC)
                || !object.isValid())
                continue;

            for (var object2 in this.sectorScene.collisionObjects) {
                if (object.group === undefined || object.group != CollisionGroup.COLGROUP_TOUCHABLE
                    || !object.isValid())
                    continue;

                if (object.dest.overlaps(object2.dest)) {
                    var normal = Vector(0, 0);
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

        // Part 3: COLGROUP_MOVING vs COLGROUP_MOVING.
        for (var i = 0; i != this.sectorScene.collisionObjects.length; ++i) {
            var object = this.sectorScene.collisionObjects[i];

            if (object.group === undefined)
                continue;

            if (!object.isValid() ||
                (object.group != CollisionGroup.COLGROUP_MOVING &&
                object.group != CollisionGroup.COLGROUP_MOVING_STATIC))
                continue;

            for (var i2 = i + 1; i2 < this.sectorScene.collisionObjects.length; ++i2) {
                var object2 = this.sectorScene.collisionObjects[i2];

                if ((object2.group != CollisionGroup.COLGROUP_MOVING
                    && object2.group != CollisionGroup.COLGROUP_MOVING_STATIC)
                    || !object2.isValid())
                    continue;

                this.collisionObject(object, object2);
            }
        }

        // Apply object movement.
        for (var object of this.sectorScene.collisionObjects) {
            object.bbox = new Rect(object.dest);
            //object.setVelocity(0, 0);
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

        for (var x = tileXStart; x < tileXEnd; x+= 32) {
            for (var y = tileYStart; y < tileYEnd; y+= 32) {
                var tile = Tile.getTileAtInside(x, y);

                this.drawDebugTile(tile);
            }
        }
        

    }

    collisionStaticConstrains(object) {
        var infinity = 10000000000;
        var constraints = new Constraints();
        var movement = object.getMovement();
        var pressure = new Phaser.Math.Vector2(0, 0);
        var dest = object.dest;

        for (var i = 0; i < 2; ++i) {
            this.collisionStatic(object, dest, movement, pressure, constraints);
            
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
            this.collisionStatic(object, dest, movement, pressure, constraints);

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

            this.collisionStatic(constraints, movement, dest, object);

            if (constraints.positionRight < infinity) {
                width = constraints.width;

                if (width + SHIFT_DELTA < object.bbox.width) {
                    var hit = new CollisionHit();

                    hit.top = true;
                    hit.bottom = true;
                    hit.left = true;
                    hit.right = true;
                    hit.crush = pressure.x > 16;
                    object.collisionSolid(hit);

                }
            }
        }
    }

    collisionStatic(object, dest, movement, pressure, constraints) {
        var constraints = this.collisionTileMap(movement, dest, object);

        // Collision with other (static) objects.
        for (var i = 0; i != this.sectorScene.collisionObjects.length; ++i)
        {
            var staticObject = this.sectorScene.collisionObjects[i];

            if ((staticObject.group == CollisionGroup.COLGROUP_STATIC || staticObject.group == CollisionGroup.COLGROUP_MOVING_STATIC) &&
                staticObject.isValid() && staticObject != object) {

                var newConstraints = checkCollisions(sprite, staticObject);

                if (newConstraints.hit.bottom)
                    staticObject.collisionMovingObjectBottom(object);
                else if (newConstraints.hit.top)
                    object.collisionMovingObjectBottom(staticObject);

                constraints.mergeConstraints(newConstraints);
            }
        }
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

        const itop = movingObjectRect.bottom - grownOtherObjectRect.top;
        const ibottom = grownOtherObjectRect.bottom - movingObjectRect.top;
        const ileft = movingObjectRect.right - grownOtherObjectRect.left;
        const iright = grownOtherObjectRect.right - movingObjectRect.left;

        var shiftout = false;

        if ((otherObject != null || isNotUniSolid(otherObject))
            && (movingObject != null || isNotUniSolid(movingObject))) {
            if (Math.abs(movingObject.getVelocityY()) > Math.abs(movingObject.getVelocityX())) {
                if (ileft < SHIFT_DELTA) {
                    constraints.constrainRight(grownOtherObjectRect.left);
                    shiftout = true;
                } else if (iright < SHIFT_DELTA) {
                    constraints.constrainLeft(grownOtherObjectRect.right);
                    shiftout = true;
                }
            } else {
                if (itop < SHIFT_DELTA) {
                    constraints.constrainBottom(grownOtherObjectRect.top);
                    shiftout = true;
                } else if (ibottom < SHIFT_DELTA) {
                    constraints.constrainTop(grownOtherObjectRect.bottom);
                    shiftout = true;
                }
            }
        }
        
        if (!shiftout) {
            if (otherObject != null && !this.isNotUniSolid(otherObject)) {
                if (otherObject.bottom - movingObject.getVelocityY() <= grownOtherObjectRect.top -
                    (otherObject.getVelocityY() - 5)) {
                    constraints.constrainBottom(grownOtherRect.top);
                    constraints.hit.bottom = true;
                }
            } else if (otherObject != null && otherObject.group !== undefined && otherObject.group == CollisionGroup.COLGROUP_MOVING_STATIC
                && movingObject != null && !this.isNotUniSolid(movingObject)) {
                if (grownOtherObjectRect.top - otherObject.getVelocityY() <= movingObject.top -
                    (movingObject.getVelocityY() - 5)) {
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
                        constraints.constrainTop(grownOtherObjectRect.bottom);
                        constraints.hit.top = true;
                    }
                } else {
                    if (ileft < iright) {
                        constraints.constrainRight(grownOtherObjectRect.left);
                        constraints.hit.right = true;
                    } else {
                        constraints.constrainLeft(grownOtherObjectRect.right);
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

        for (let x = overlappingTilesRect.left; x < overlappingTilesRect.right; ++x) {
            for (let y = overlappingTilesRect.top; y < overlappingTilesRect.bottom; ++y) {
                const tile = Tile.getTileAt(x, y); 
                if (!tile) continue;

                if (tile.isSolid()) {
                    const tileBbox = {
                        left: x * TILE_SIZE,
                        top: y * TILE_SIZE,
                        right: (x + 1) * TILE_SIZE,
                        bottom: (y + 1) * TILE_SIZE,
                    };

                    var isRelativelySolid = true;

                    if (tile.isUniSolid()) {
                        if (!tile.isSolid(tileBbox, object.bbox, object.getVelocity())) {
                            isRelativelySolid = false;
                        }
                    }

                    if (isRelativelySolid) {
                        if (tile.isSlope()) {
                            const triangle = new AATriangle(tileBbox, tile.data);
                            const result = Collision.rectangleCollidesWithAATriangle(rect, triangle);

                            if (result && result.hits) {
                                hitsBottom |= result.hitsRectangleBottom;
                            }
                        } else {
                            var newConstraints = this.checkCollisions(object.getVelocity(), dest, tilebBox);

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
                    result |= (tile.getAttributes() & Tile.ICE);
                }
            }
        }

        return result;
    }

    collisionObject(object1, object2) {
        if (object1.collisionGroup == CollisionGroup.COLGROUP_MOVING_STATIC &&
            object2.collisionGroup == CollisionGroup.COLGROUP_MOVING_STATIC)
            return;

        var rect1 = object1.dest;
        var rect2 = object2.dest;

        var hit = new CollisionHit();

        if (rect1.overlaps(rect2)) {
            var normal = new Phaser.Math.Vector2(0, 0);

            this.hitNormal(object1, object2, hit, normal);

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
        const rect1 = object1.dest;
        const rect2 = object2.dest;

        const itop = rect1.bottom - rect2.top;
        const ibottom = rect2.bottom - rect1.top;
        const ileft = rect1.right - rect2.left;
        const iright = rect2.right - rect1.left;

        const verticalPenetration = Math.min(itop, ibottom);
        const horizontalPenetration = Math.min(ileft, iright);

        if (object1.isUniSolid() && rect2.bottom - object2.getVelocityY() > rect1.top)
            return;
        if (object2.isUniSolid() && rect1.bottom - object1.getVelocityY() > rect2.top)
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
    }
}