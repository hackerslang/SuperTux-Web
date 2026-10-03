import { Level } from '../object/level/level.js';
import { Sector } from '../object/level/sector.js';
import { Tile, TileType } from '../object/level/tile.js';
import { SectorScene } from '../scenes/sectorscene.js';
import { CollisionGroup } from '../collision/collision_group.js';
import { MovingSprite } from '../object/moving_object.js';
import { RaycastResult } from '../collision/collision_system.js';
import { Collision } from '../collision/collision.js';
import { HitResponse } from '../collision/collision_hit.js';

export var EnemyState = {
    STATE_INIT: 0,
    STATE_INACTIVE: 1,
    STATE_ACTIVE: 2,
    STATE_SQUISHED: 3,
    STATE_FALLING: 4,
    STATE_BURNING: 5,
    STATE_MELTING: 6,
    STATE_GROUND_MELTING: 7,
    STATE_INSIDE_MELTING: 8,
    STATE_GEAR: 9
}

export class Enemy extends MovingSprite {
    constructor(config) {
        super(config);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.scene = config.scene;
        this.sector = config.sector;
        this.alive = true;
        this.id = config.id;
        this.enemyType = config.key;
        this.powerUps = config.powerUps;

        this.isTile = false;
        this.isEnemy = true;

        this.playerCollides = true;
        this.canClimb = false;

        this.body.setVelocity(0, 0);
        this.body.allowGravity = true;
        this.hasBeenSeen = false;

        this.setDepth(900);

        this.frozen = false;

        this.BADGUY_ICE_FRICTION_MULTIPLIER = 0.1;      // Same as player
        this.BADGUY_ICE_ACCELERATION_MULTIPLIER = 0.25; // Same as player

        this.realY = config.realY;
        this.player = config.player;
        this.DIRECTION_AUTO = -2;
        this.DIRECTION_LEFT = -1;
        this.DIRECTION_RIGHT = 1;

        this.changedDirectionBeforeEdge = false;
        this.turnedAroundLeft = false;
        this.turnedAroundRight = false;

        this.prevTurnAround = false;
        this.currentNormalWalkSpeed = 0;

        this.PADDING_ENEMY_COLLISION = 2;
        this.ENEMY_COLLISION_TURN_TIMER = 400;
        this.KILL_AT = 2500;

        this.direction = this.DIRECTION_LEFT;

        this.collisionTurnedTimer = 0;
        this.playerCollisionTurnedTimer = 0;
        
        this.waitForTurn = false;
        this.setWaitTurnTimer = 0;
        this.cannotWaitForTurn = false;
        this.cannotWaitForTurnTimer = 0;
        this.justTurnAround = false;
        this.sliding = false;
        this.killFalling = false;
        this.killed = false;
        this.removed = false;

        this.isActiveFlag = false;

        this.state = EnemyState.STATE_INIT;

        this.TURN_AROUND_WAIT_TIMER = 150;
        this.turnAroundWaitTimer = 0;
        this.SQUISH_TIME = 2;
        this.killAt = this.KILL_AT;
        this.squishable = false;
        this.body.pushable = false;
        this.setDepth(101);

        this.onGroundFlag = true;
        this.floorNormal = new Phaser.Math.Vector2(0, 0);
        this.detectedSlope = 0;

        //Collides with moving tiles, such as platforms or industrial tiles??
        this.collidesWithExtraTiles = true;

        this.collidesWithOtherEnemies = true;

        this.normalMaxDropHeight = 600;

        this.group = CollisionGroup.COLGROUP_DISABLED;
        this.collisionGroupActive = CollisionGroup.COLGROUP_MOVING;

        this.isScheduledForRemoval = false;
    }

    initWithGameSession(enemyFromGameSession) {
        this.x = enemyFromGameSession.x;
        this.y = enemyFromGameSession.y;
        this.body.velocity.x = enemyFromGameSession.velocityX;
        this.body.velocity.y = enemyFromGameSession.velocityY;
        this.direction = enemyFromGameSession.direction;
    }

    activated() {
        if (!this.hasBeenSeen) {
            return (this.x < this.scene.cameras.main.scrollX + this.scene.sys.game.canvas.width + 32);
        }
        
        return true;
    }

    intialize() {

    }

    activate() {

    }

    deActivate() {

    }

    isOffScreen() {
        if (this.x < this.scene.cameras.main.scrollX) {
            return true;
        }

        if (this.x > this.scene.cameras.main.scrollX + this.scene.sys.game.canvas.width + 32) {
            return true;
        }

        if (this.y < this.scene.cameras.main.scrollY) {
            return true;
        }

        if (this.y > this.scene.cameras.main.scrollY + this.scene.sys.game.canvas.height + 32) {
            return true;
        }

        return false;
    }

    update(time, delta) {
        if (this.isScheduledForRemoval) {
            return;
        }

        super.update(time, delta);

        if (this.killed) {

            if (this.killAt <= 0) {
                this.remove();
            } else {
                this.killAt -= delta;
            }

            return;
        }

        if (this.scene == null) {
            return;
        }

        if (this.killFalling) {
            return;
        }

        if (Math.abs(this.getVelocityX()) > 0.5) {
            this.currentNormalWalkSpeed = this.getVelocityX();
            this.currentDirection = this.direction;
        }

        if (!this.canClimb) {
            this.scene.physics.world.collide(this, this.scene.climbableTilesGroup);
        } else {
            this.scene.physics.world.overlap(this, this.scene.climbableTilesGroup, this.climbHit);
        }

        if (this.stateTimer > 0) {
            this.stateTimer -= delta;
        }

        // And here it begins ...

        if (this.frozen && !this.isGrabbed()) {
            var playerBox = this.getBbox().grown(-2);
            playerBox.setBottom(this.getBbox().getBottom() + 7);

            if (playerBox.overlaps(player.getBbox()) && this.getVelocityY() > 0 && this.isPortable()) {
                this.setVelocityY(-250);
            }

            this.setCollisionGroupActive(Math.abs(this.getVelocityY) < 0.2 && Math.abs(this.getvelocityX()) < 0.2
                ? CollisionGroup.COLGROUP_MOVING_STATIC : CollisionGroup.COLGROUP_MOVING);

            if (this.unfreezeTimer <= 0) {
                this.unfreeze(false);
            }
        }

        if (this.isActiveFlag && this.isOffScreen() && this.getVelocityY() <= 0 && !this.alwaysActive()) {
            this.deActivate();
            this.setState(EnemyState.STATE_INACTIVE);
        }

        if (this.scene.isFreeOfTiles(this.getBbox().grown(1), true, TileType.WATER) && this.inWater) {
            this.inWater = false;
        }

        var watertopbox = this.getBbox();
        watertopbox.setBottom(this.getBbox().getBottom() - this.getBbox().height / 3);
        watertopbox.top = this.getBbox().top + this.getBbox.height / 3;
        var wateroutbox = this.getBbox();
        wateroutbox.setBottom(this.getBbox().top + this.getBbox().height / 3);

        var middleHasWater = !this.scene.isFreeOfTiles(watertopbox, true, TileType.WATER);
        var onTopOfWater = (middleHasWater && this.scene.isFreeOfTiles(wateroutbox, true, TileType.WATER));

        var inWaterBigger = !this.scene.isFreeOfTiles(this.getBbox().grown(-4), true, TileType.WATER);

        if (this.gravityEnabled) {
            this.gravityModifier = middleHasWater ? this.frozen ? 1 : 0.3 : 1;
        }

        if (inWaterBigger && this.frozen && !this.isGrabbed()) {
            if (this.getVelocityX() > -2 && this.getVelocityX() < 2) {
                this.setVelocityX(0);
                this.setAccelerationX(0);
            } else {
                this.setVelocityX(this.getVelocityX() - (this.getVelocityX() > 0 ? 2 : -2));
            }

            if (!onTopOfWater && this.getVelocityY() < -100) {
                this.setVelocityY(-100);
            }

            if (onTopOfWater && this.getVelocityY() <= 0) {
                this.collisionObject.setMovement(this.collisionObject.getMovement().x, 0);
                this.setVelocityY(0);
                this.setAccelerationY(0);
                this.setGravityModifier(0);
            }
        }

        switch (this.state) {
            case EnemyState.STATE_ACTIVE:
                this.isActiveFlag = true;

                // to be done !!
                if (this.frozen && this.isPortable()) {
                    // this.freezeSpite
                } else {

                }

                this.activeUpdate(time, delta);
                break;

            case EnemyState.STATE_INIT:
            case EnemyState.STATE_INACTIVE:
                this.isActiveFlag = false;
                this.inWater = this.scene.isFreeOfTiles(this.collisionObject.getBbox().grown(-4), false, Tile.WATER);
                this.inActiveUpdate();
                this.tryActivate();
                break;

            case EnemyState.STATE_BURNING:
                this.isActiveFlag = false;
                // to be done ...
                break;

            case EnemyState.STATE_GEAR:
            case EnemyState.STATE_SQUISHED:
                var self = this;
                this.scene.tweens.add({
                    targets: self,
                    alpha: 0,
                    duration: self.SQUISH_TIME * 1000,
                    ease: 'Linear',
                    onComplete: () => {
                        self.remove();
                    }
                });

                break;
            // melting, ground melting to be done ...

            case EnemyState.STATE_FALLING:
                this.isActiveFlag = false;

                break;
        }

        this.setWaitTurnTimer -= delta;
    }

    updateOnGroundFlag(hit) {
        if (hit.bottom) {
            this.onGroundFlag = true;
            this.floorNormal = hit.slopeNormal;
        }
    }

    collision(other, hit) {
        if (!this.isActive()) return HitResponse.ABORT_MOVE;
        if (this.isGrabbed()) return HitResponse.FORCE_MOVE;

        var otherCreature = other !== undefined && other.parent !== undefined ? other.parent : undefined;

        if (otherCreature !== undefined && otherCreature.isEnemy && hit.bottom && this.frozen && otherCreature.getCollisionObject().getGroup() != CollisionGroup.COLGROUP_TOUCHABLE) {
            this.setVelocityY(otherCreature.getVelocityY);

            if (!otherCreature.isFrozen()) {
                otherCreature.killFalling();
            }

            return HitReponse.FORCE_MOVE;
        } 

        if (otherCreature !== undefined && otherCreature.isEnemy && otherCreature.isActive() && otherCreature.getCollisionObject().getGroup() == CollisionGroup.COLGROUP_MOVING) {
            return this.collisionEnemy(otherCreature, hit);
        }
        var player = (!otherCreature.isEnemy && otherCreature.getCollisionObject().getGroup() == CollisionGroup.COLGROUP_MOVING ? otherCreature : undefined);

        if (player !== undefined) {
            if (player.getBbox().getBottom() < (this.getCollisionObject().getBbox().top + 16)) {
                // if (player.isStone()) {
                //     this.killFalling();

                //     return HitResponse.FORCE_MOVE;
                // }
                
                if (this.collisionSquished(player)) {
                    return HitResponse.FORCE_MOVE;
                }
            }

            // We leave stone out of it!!

            return this.collisionPlayer(this.player, hit);
        }
    }

    collisionEnemy(enemy, hit) {
        if (enemy.isFrozen()) {
            this.collisionSolid(hit);
        }

        return HitResponse.FORCE_MOVE;
    }

    collisionPlayer(player, hit) {
        if (player.invincible || (this.isSnipable() && (player.doesButtJump || player.isSliding()))) {
            this.killFalling();

            return HitResponse.ABORT_MOVE;
        }

        if (this.isGrabbed()) {
            return HitResponse.FORCE_MOVE;
        }
  
        if (player.getGrabbedObject() !== undefined && this.frozen) {
            var enemy = player.getGrabbedObject();

            if (enemy !== undefined) {
                player.getGrabbedObject().unGrab(player, player.direction);
                player.stopGrabbing();
                enemy.killFalling();

                return HitResponse.ABORT_MOVE;
            }
        }

        if (this.frozen) {
            if (hit.bottom) {
                this.setVelocityY(-250);
            }
        } else {
            player.kill(false);
        }

        return HitResponse.FORCE_MOVE;
    }

    collisionSolid(hit) {
        if (this.frozen) {
            if (hit.top || hit.bottom) {
                this.setVelocityY(0);

                if (hit.bottom) {
                    super.disableGravityTemporarily();
                }
            } else {
                this.restoreGravityY();
            }

            if (hit.left || hit.right) {
                this.setVelocityX(0);
            }

            if ((this.getVelocityX() > -5) &&
                (this.getVelocityX() < 5)) {
                this.setVelocityX(0);
                this.setAccelerationX(0);
            } else {
                this.setVelocityX(this.getVelocityX() - (this.getVelocityX() > 0 ? 5 : -5));
            }
        }
        else
        {
            this.saveGravityY();
            this.body.setGravityY(0);
            this.setVelocity(0, 0);
            this.setAccelerationX(0);
            this.setAccelerationY(0);
        }

        this.updateOnGroundFlag(hit);
    }

    saveGravityY() {
        const gravity = this.body && this.body.gravity ? this.body.gravity : { x: 0, y: 0 };

        this.savedGravityY = gravity.y;
    }

    restoreGravityY() {
        if (!this.body || !this._savedGravityY) return;

        this.body.setGravityY(this.savedGravityY || 0);
    }

    setCollisionGroupActive(group) {
        this.collisionGroupActive = group;
        if (this.state == EnemyState.STATE_ACTIVE) setGroup(group);
    }

    setGroup(group) {
        super.setGroup(group);
    }

    isSnipable() { return false; }

    turnAroundOnce() {
        this.turnAroundSpeed(Math.abs(this.currentNormalWalkSpeed), this.currentDirection * -1);
        this.turnAroundWaitTimer = this.TURN_AROUND_WAIT_TIMER;
        this.currentTurnAround = false;
        this.justTurnAround = true;
    }

    activeUpdate(time, delta) {
        if (!this.iceThisFrame && this.onGround()) {
            this.onIce = false;
        }

        this.iceThisFrame = false;

        if (!this.isGrabbed()) {
            if (this.isInWater && this.waterAffected) {
                if (this.frozen) {
                    //                
                }
            }
        }

        if (this.frozen) {
            //this.setTexture(this.anims.currentFrame);
        }

        this.applyIcePhysics();

        if (this.frozen) {
            // Stop animation !!!
        }
    }

    inActiveUpdate() {
        this.setVelocityX(0);
    }

    deActivate() {

    }

    applyIcePhysics() {
        if (!this.onIce || !this.onGround())
            return;
  
        var velx = this.getVelocityX();
        // No artificial velocity threshold - let natural physics handle sliding

        // Use same friction base as player (WALK_ACCELERATION_X = 300)
        var friction = 300.0 * BADGUY_ICE_FRICTION_MULTIPLIER; // Base friction value

        if (velx < 0) {
            this.setAccelerationX(friction);
        } else if (velx > 0) {
            this.setAccelerationX(-friction);
        }
    }

    //Must be overridden
    enemyHit(thisEnemy, enemy) {

    }

    climbHit(thisEnemy, climbable) {

    }

    tryActivate() {
        if (this.player == null || this.player.isDead()) {
            return;
        }

        if (!this.isOffScreen()) {
            this.setState(EnemyState.STATE_ACTIVE);

            if (!this.isInitialized) {
                //if (this.startDirection == this.DIRECTION_AUTO) {
                //    if (this.player.x < this.x) {
                //        this.direction = this.DIRECTION_LEFT;
                //    } else {
                //        this.direction = this.DIRECTION_RIGHT;
                //    }
                //}

                this.initialize();
                this.isInitialized = true;
            }
            
            this.activate();
        }

        
    }

    initialize() {

    }

    //must be overridden
    playerHit(enemy, player) {
        //OK, but needs revision!!
        if (player.invincible /* || */) {
            enemy.killFall();

            return;
        }

        if (enemy.isGrabbed()) {
            return;
        }

        if (player.getGrabbedObject() != null && !enemy.frozen) {
            var grabbedEnemy = player.getGrabbedObject();

            if (grabbedEnemy != null) {
                player.getGrabbedObject().unGrab(player, player.direction);
                player.stopGrabbin();
                grabbedEnemy.killFall();
                enemy.killFall();

                return;
            }
        }

        if (enemy.verticalHit(enemy, player)) {
            if (player.isStone()) {
                enemy.killFall();
                
                return;
            } else {
                if (enemy.collisionSquished(player)) {

                    return;
                }
            }
        } else {
            if (enemy.body.x < player.body.x) {
                enemy.turnRight();
            } else if (enemy.body.x > player.body.x) {
                enemy.turnLeft();
            }
        }

        if (enemy.frozen) {
            //collision solid
        } else {
            player.hurtBy(enemy);
        }
    }

    turnAroundSpeed(speed, direction) {
        this.direction = direction;
        this.body.velocity.x = this.direction * speed;
        this.flipX = !this.flipX;
        this.turnedAroundLeft = (direction != this.DIRECTION_RIGHT);
        this.turnedAroundRight = (direction == this.DIRECTION_RIGHT);
    }

    turnRight() {
        this.turnAroundSpeed(this.walkSpeed, this.DIRECTION_RIGHT);
    }

    turnLeft() {
        this.turnAroundSpeed(this.walkSpeed, this.DIRECTION_LEFT);
    }

    isGrabbed() {
        return false;
    }

    collisionSquished(creature) {
        if (this.frozen) {
            var player = !creature.isEnemy ? creature : undefined;

            if (player !== undefined && player.doesButtJump) {
                player.bounce(this);
                this.killFall();

                return true;
            }
        }

        return false;

        // if (this.squishable) {
        //     this.anims.play(this.squishedAnim);
        //     this.killSquished(this.squishedAnim);

        //     return true;
        // }

        // return false;
    }

    killSquished(object) {
        if (!this.isActive()) {
            return;
        }

        this.scene.sound.play("squish");

        this.gravityEnabled = true;

        this.setVelocity(0, 0);
        this.setState(EnemyState.STATE_SQUISHED);
        this.setGroup(CollisionGroup.COLGROUP_MOVING_ONLY_STATIC);

        if (!object.isEnemy) {
            var player = object;

            player.bounce(this);
        }

        if (this.powerUps !== undefined) {
            this.releasePowerUps();
        }
    }

    isActive() {
        return this.isActiveFlag;
    }

    stopMoving() {
        this.setVelocityX(0);
        this.setVelocityY(0);
    }

    getState() {
        return this.state;
    }

    setState(state) {
        if (this.state == state) {
            return;
        }

        var lastState = this.state;
        this.state = state;

        switch (state) {
            case EnemyState.STATE_BURNING:
                this.stateTimer = this.BURN_TIME;

                break;
            case EnemyState.STATE_SQUISHED:
                this.stateTimer = this.SQUISH_TIME;

                break;
            case EnemyState.STATE_GEAR:
                this.stateTimer = this.GEAR_TIME;

                break;
            case EnemyState.STATE_ACTIVE:
                //setGroup(active);

                break;
            case EnemyState.STATE_INACTIVE:
                if (lastState == EnemyState.STATE_SQUISHED || lastState == EnemyState.STATE_FALLING) {
                    //removeMe();
                }
                //setGroup(disabled);

                break;

            case EnemyState.STATE_FALLING:
                //setGroup(disabled);
                this.flipY = true;

                break;

            default:

                break;
        }
    }

    ifPlayerAliveAddCollisionDetection() {
        if (!this.player.isDead()) {
            this.scene.physics.world.collide(this, this.player, this.playerHit);
        }
    }

    addGroundCollisionDetection() {
        this.scene.physics.world.collide(this, this.sector.groundLayer);
    }
    
    collideEnemy(self, other) {
        self.changeDirection();
    }

    enemyCollideTurn() {

    }

    getClosestFacingEnemy() {
        var minDistance = -1;
        var closestFacingEnemy = null;
        var self = this;
 
        this.scene.creatureObjects.forEach(function (enemy, index) {
            if (enemy != null && !enemy.killed && enemy.collidesWithOtherEnemies) {
                var distanceY = Math.abs(self.y - enemy.y);

                if (distanceY < 80) {
                    if (self.direction == self.DIRECTION_LEFT && enemy.x < self.x) {
                        var distance = self.x - enemy.x;

                        if (distance < minDistance || minDistance == -1) {
                            closestFacingEnemy = enemy;
                            minDistance = distance;
                        }
                    } else if (self.direction == self.DIRECTION_RIGHT && self.x < enemy.x) {
                        var distance = enemy.x - self.x;

                        if (distance < minDistance || minDistance == -1) {
                            closestFacingEnemy = enemy;
                            minDistance = distance;
                        }
                    }
                }
            }
        });

        return closestFacingEnemy;
    }

    turnAroundBothEnemiesIfNeeded() {
        if (this.currentTurnAround) {
            this.turnAroundOnce();
        }

        var closestFacingEnemy = this.getClosestFacingEnemy();
        if (closestFacingEnemy == null) {
            return;
        }

        var distanceX = Math.abs(closestFacingEnemy.x - this.x);

        if (distanceX <= 32) {
            this.prevTurnAround = true;

            //if (!closestFacingEnemy.justTurnAround) {
                closestFacingEnemy.prevTurnAround = true;
            //}
        }
    }

    swapTurnAround() {
        this.currentTurnAround = this.prevTurnAround;
        this.prevTurnAround = false;
    }

    setCannotWaitTurn() {
        this.cannotWaitForTurnTimer = this.ENEMY_COLLISION_TURN_TIMER * 4;
        this.cannotWaitForTurn = true;
    }

    playerCollideTurn() {
        if (this.playerCollisionTurnedTimer <= 0) {
            if (this.horizontalCollision(this.player, this)) {
                this.changeDirection();
                this.player.hurtBy(this);
                this.playerCollisionTurnedTimer = this.ENEMY_COLLISION_TURN_TIMER;
            } else if (this.horizontalCollision(this, this.player)) {
                this.changeDirection();
                this.player.hurtBy(this);
                this.playerCollisionTurnedTimer = this.ENEMY_COLLISION_TURN_TIMER;
            }
        }
    }

    horizontalCollision(creature, otherCreature) {
        var creatureXWidth = creature.x + creature.body.width / 2;
        var creatureYHeight = Math.floor(creature.y) + creature.height;

        return (creature.killAt <= 0 && otherCreature.killAt <= 0 &&
            (creatureXWidth >= (otherCreature.x - (otherCreature.body.width / 2) - this.PADDING_ENEMY_COLLISION)) && (creatureXWidth <= (otherCreature.x - (otherCreature.body.width / 2)
            + this.PADDING_ENEMY_COLLISION))
            && (creatureYHeight >= Math.floor(otherCreature.y)) && (creature.y <= Math.floor(otherCreature.y) + otherCreature.body.height));
    }

    changeDirection() {
        if (this.direction == this.DIRECTION_LEFT) {
            this.turnRight();
        } else {
            this.turnLeft();
        }
    }

    alwaysActive() { return false; }

    getBbox() {
        return this.collisionObject.getBbox();
    }

    mightFall(height) {
        var raycastResult = new RaycastResult();

        var oy = this.collisionObject.getBbox().getBottom() + 1;
        var fh = parseFloat(height);

        if (this.detectedSlope == 0) {
            var eye = new Phaser.Math.Vector2(0, oy - 2);
            eye.x = this.direction == this.DIRECTION_LEFT ? this.collisionObject.getBbox().left : this.collisionObject.getBbox().getRight();
            var end = new Phaser.Math.Vector2(eye.x, eye.y + fh + 2);

            var result = Sector.getCurrentSector().getFirstLineIntersection(eye, end, false, this.collisionObject);

            if (!result.isValid) {
                return true;
            }

            var tile;

            if (typeof result.hit === "Tile") {
                tile = result.hit;
            } else {
                tile = undefined;
            }

            if (tile !== undefined && tile.isSlope()) {
                var triBbox = new Rect();
                var tri = new AATriangle({ bbox: triBbox, direction: tile.data });

                if (tri.isSouth() && this.direction == this.DIRECTION_LEFT ? tri.isEast() : !tri.isEast()) {
                    this.detectedSlope = tri.direction;
                }
            }
        }

        if (this.detectedSlope != 0) {
            var dirmult = (this.direction == this.DIRECTION_LEFT ? 1: -1);

            // X position of the opposite face of the hitbox relative to m_dir.
            var rearx = (this.direction == this.DIRECTION_LEFT ? this.collisionObject.bbox.getRight() :this.collisionObject.bbox.left);

            // X Offset from rearx used for determining the start of the raycast.
            var startoff = (this.body.width / 5) * dirmult;
            var eye = new Phaser.Math.Vector2(rearx - startoff, oy);

            // X Offset from eye's X used for determining the end of the raycast.
            var endoff = startoff - (2 * dirmult);
            var end = new Phaser.Math.Vector2(eye.x + endoff, eye.y + 80);

            // The resulting line segment (eye, end) should result in a downwards facing diagonal direction.

            var result = Sector.getCurrentSector().getFirstLineIntersection(eye, end, false, this.collisionObject);

            if (!result.isValid) {
                // Turn around and climb the slope.
                this.detectedSlope = 0;

                return true;
            }

            if (result.box.top - oy > fh + 1)
            {
                // Result is not within reach.
                this.detectedSlope = 0;

                return true;
            }

            var tile;

            if (typeof result.hit === "Tile") {
                tile = result.hit;
            } else {
                tile = undefined;
            }

            if (tile !== undefined && tile.isSlope()) {
                // Still going down a slope. Continue.
                return false;
            }

            // No longer going down a slope. Switch off slope mode.
            this.detectedSlope = 0;
        }

        return false;
    }

    isAtEdgeLeft() {
        var x = this.body.x + 32;
        var y = this.body.y + 32;

        var tileX = Math.floor(x / 32);
        var tileY = Math.floor(y / 32);

        if (tileX <= 0 || tileY >= Level.getMaxLevelHeightY() - 1) {
            return false;
        }

        return (Level.isFreeOfObjects(x-32, y+32, this.scene, !this.canClimb)/* || this.body.blocked.left /*|| this.body.touching.left*/);
    }

    isAtEdgeRight() {
        var x = this.body.x;
        var y = this.body.y + 32;

        var tileX = Math.floor(x / 32);
        var tileY = Math.floor(y / 32);

        if (tileX >= Level.getMaxLevelWidthX() - 1 || tileY >= Level.getMaxLevelHeightY() - 1) {
            return false;
        }

        return (Level.isFreeOfObjects(x + 32, y + 32, this.scene, !this.canClimb)/* || this.body.blocked.right /*|| this.body.touching.right*/);
    }

    verticalHit(enemy, player) {
        if (!player.isActiveAndAlive()) {
            return false;
        }

        return (player.body.y + player.body.height) - enemy.body.y < 10;
    }

    downHit(enemy, player) {
        if (!player.isActiveAndAlive()) {

            return false;
        }

        return enemy.body.y + enemy.body.height <= player.body.y && player.body.x >= enemy.body.x - 30 && player.body.x < enemy.body.x + (enemy.body.width);
    }

    hurtPlayer(enemy, player) {
        this.player.hurtBy(enemy);
    }

    checkKillAtSquishedOrFall(squishedTexture, delta) {
        if (this.killAt > 0) {
            this.killed = true;
            this.body.setVelocityX(0);

            this.anims.play(squishedTexture);

            this.killAt -= delta;
            if (this.killAt <= 0) {
                this.remove();
            }
        }
    }

    killWhenFallenDown() {
        if (!this.killed) {
            if (this.hasFallenDown()) {
                this.killed = true;

                this.remove();
            }
        }
    }

    hasFallenDown() {
        var tileY = Math.floor(this.body.y / 32);

        return tileY + 1 >= Level.getMaxLevelHeightY();
    }

    remove() {
        if (this.killed) { return; }

        this.scene.removeEnemy(this);
        this.destroy();

        this.killed = true;
    }

    killFall() {
        this.killNoFlat();
    }

    killNoFlat() {
        //this.setTexture(texture);

        if (!this.isActive()) {
            return;
        }

        if (this.frozen) {
            //playSound
            //Do Stuff ...
        } else {
            this.scene.sound.play('enemy-fall');
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
            this.killAt = 1500;
            this.killFalling = true;
            this.setState(EnemyState.STATE_FALLING);
            this.releasePowerUps();
        }
    }

    isFrozen() {
        return this.frozen;
    }

    releasePowerUps() {
        if (this.powerUps == null) { return; }

        var self = this;

        this.powerUps.forEach(function (powerUp, idx) {
            if (self.doesGeneratePowerup(powerUp.chance)) {
                switch (powerUp.name) {
                    case 'egg':
                        self.releaseEgg();
                        break;
                    case 'plus':
                        self.releasePlus();
                        break;
                    default:
                        break;
                }
            }
        });
    }

    doesGeneratePowerup(chance) {
        var rnd = this.getRandomInt(100);

        if (rnd <= chance) {
            return true;
        }

        return false;
    }

    getRandomInt(max) {
        return Math.ceil(Math.random() * max);
    }

    releaseEgg() {
        var rndDirection = this.getRandomInt(2);

        if (rndDirection == 2) { rndDirection = -1; }
        
        this.scene.addEgg(this.x + (rndDirection * 40), this.y - 32, rndDirection, 600);
    }

    releasePlus() {
        var rndDirection = this.getRandomInt(2);

        if (rndDirection == 2) { rndDirection = -1; }

        this.scene.addPlus(this.x + (rndDirection * 40), this.y - 32, rndDirection, 600);
    }

    walkAndTurnOnEdge() {
        if ((this.body.x <= 10 || this.isAtEdgeLeft()) && !this.turnedAroundRight) {
            this.turnRight();
        } else if (this.isAtEdgeRight() && !this.turnedAroundLeft) { //no ground below
            this.turnLeft();
        }
    }

    walkAndTurnCollideEnemy(enemy) {
        if (enemy.body.x < this.body.x) {
            this.turnRight();
        } else if (enemy.body.x > this.body.x) {
            this.turnLeft();
        }
    }

    switchDirection() {
        if (this.direction == this.DIRECTION_LEFT) {
            this.turnRight();
        } else if (this.direction == this.DIRECTION_RIGHT) {
            this.turnLeft();
        }
    }

    turnRight() {
        this.direction = this.DIRECTION_RIGHT;
        this.hasJustTurnedAroundLeft = false;
        this.hasJustTurnedAroundRight = true;

        this.setVelocityX(Math.abs(this.getVelocityX()));
        this.flipX = true;
    }

    turnLeft() {
        this.direction = this.DIRECTION_LEFT;
        this.hasJustTurnedAroundLeft = true;
        this.hasJustTurnedAroundRight = false;

        this.setVelocityX(-Math.abs(this.getVelocityX()));
        this.flipX = false;
    }

    enemyOut() {

    }

    slideKill() {

    }

    setVelocityX(x) {
        this.body.setVelocityX(x);
    }

    setVelocityY(y) {
        this.body.setVelocityY(y);
    }

    setVelocity(x, y) {
        this.body.setVelocity(x, y);
    }

    setAccelerationX(x) {
        this.body.setAccelerationX(x);
    }

    setAccelerationY(y) {
        this.body.setAccelerationY(y);
    }

    getVelocityX() {
        return this.body.velocity.x;
    }

    getVelocityY() {
        return this.body.velocity.y;
    }

    getAccelerationX() {
        return this.body.acceleration.x;
    }

    getAccelerationY() {
        return this.body.acceleration.y;
    }

    onGround() {
        return this.onGroundFlag;
    }

    slightlyAboveGround() {
        let absVelocityY = Math.abs(this.getVelocityY());
        let groundYDelta = Math.abs(this.lastGroundY - this.y);

        return (absVelocityY == 16.625 || absVelocityY == 31.25) && groundYDelta < 0.85;
    }

    adjustBody(width, height, offsetX, offsetY) {
        this.body.setSize(width, height);
        this.body.setOffset(offsetX, offsetY);
    }
}