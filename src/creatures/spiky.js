import { WalkingEnemy, LedgeBehavior } from './walking_enemy.js';

export var SpikyState = {
    STATE_SLEEPING: 0,
    STATE_WAKING: 1,
    STATE_WALKING: 2
}

export class Spiky extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 45;

        super(config);

        if (config.sleeping != null) {
            this.sleeping = config.sleeping;
        } else {
            this.sleeping = false;
        }
        
        this.walkAnimation = "spiky-walk";
        this.direction = 0;

        if (config.direction == "left") {
            this.direction = this.DIRECTION_LEFT;
        } else if (config.direction == "right") {
            this.direction = this.DIRECTION_RIGHT;
        }

        this.firstActivated = false;
        this.canClimb = false;

        this.body.x = config.x;
        this.body.y = config.y;
        this.body.setSize(32, 32, true);
        this.setOrigin(0.5, 0.5);
        this.body.setOffset(7, 6);

        this.objectName = "Spiky";

        this.squishable = false;
        this.initialize();
    }

    initialize() {
        this.setLedgeBehavior(LedgeBehavior.NORMAL);
    }

    update(time, delta) {
        super.update(time, delta);
        if (this.sleeping) {
            this.state = SpikyState.STATE_SLEEPING;
            this.setVelocityX(0);
            this.anims.play("spiky-sleep");
        } else {
            this.state = SpikyState.STATE_WALKING;
            this.anims.play("spiky-walk");
            super.walk();
        }
    }

    isFreezable() {
        return true;
    }

    isFlammable() {
        return true;
    }
}

export class HellSpiky extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 60;

        super(config);

        this.angry = config.angry != null ? config.angry : false;
        this.body.allowGravity = !this.angry;
        this.walkAnimation = "hellspiky-walk";
        this.tint = 0xFF0000;
        this.direction = 0;
        this.firstActivated = false;

        this.body.setSize(32, 32, true);
        this.setOrigin(0.5, 0.5);
        this.body.setOffset(7, 6);

        this.squishable = false;
        this.up = 1;
        this.verticallyDown = 0;
        this.runningDegrees = "horizontal";
        this.clockwise = this.direction * -1;
        this.walkSpeed = 100;

        this.objectName = "HellSpiky";
    }

    initialize() {
        if (!this.angry) {
            super.walk();
        } 
    }

    roundContinuousWalk() {
        var x = Math.floor((this.body.x + (this.direction * this.body.width / 2)) / 32);
        var y = Math.floor(this.body.y / 32);
        var topY = Math.floor(this.body.top / 32)
        var bottomY = Math.floor(this.body.bottom / 32);

        if (this.isWalkingHorizontally()) {
            if (isTileBlockInFrontWhenHorizontal(x, y)) {
                this.turnDegrees(this.up * -this.direction * 90);//ok
                this.adjustPositionIsTileBlockInFrontWhenHorizontal();
                this.walkVerticallyUpOrDown();
            } else if (this.isNoTileBlockBelowWhenWalkingHorizontal(x, y)) {
                this.turnDegrees(this.up * this.direction * -90);
                this.adjustPositionIsNoTileBlockBelowWhenWalkingHorizontal();
                this.walkVerticallyUpOrDownReverse();
            }
        } else if (this.isWalkingVertically()) {
            if (this.isTileBlockInFrontWhenVertical(x, y)) {//ok
                this.turnDegrees(90);
                this.adjustPositionIsTileBlockInFrontWhenVertical();
                this.walkHorizontallyRightOrLeft();
            } else if (this.isNoTileBlockBelowWhenWalkingVertical(x, y)) {
                this.turnDegrees(-90);
                this.adjustPositionIsNoTileBlockBelowWhenWalkingVertical();
                this.walkHorizontallyRightOrLeftReverse();
            }
        }
    }

    isWalkingHorizontally() {
        return this.angle == 0 || this.angle == 360;
    }

    isWalkingVertically() {
        return Math.abs(this.angle) == 90;
    }

    isTileBlockInFrontWhenHorizontal(x, y) {
        return !Level.isFreeOfStatics(x + this.direction, y);//ok
    }

    isTileBlockInFrontWhenVertical(x, y) {
        return !Level.isFreeOfStatics(x, y + this.verticallyDown);//ok
    }

    isNoTileBlockBelowWhenWalkingHorizontal(x, y) {
        return Level.isFreeOfStatics(x + this.direction, y - this.up);//ok
    }

    isNoTileBlockBelowWhenWalkingVertical(x, y) {
        return Level.isFreeOfStatics(x + this.left, y + this.verticallyDown);//ok
    }

    adjustPositionIsTileBlockInFrontWhenHorizontal() {
        this.x += this.direction;
    }

    adjustPositionIsTileBlockInFrontWhenVertical() {
        this.y += this.verticallyDown;
    }

    adjustPositionIsNoTileBlockBelowWhenWalkingHorizontal() {
        this.x += this.direction;
        this.y -= this.up;
    }

    adjustPositionIsNoTileBlockBelowWhenWalkingVertical() {
        this.x += this.left;
        this.y += this.verticallyDown;
    }

    turnDegrees(degrees) {
        this.angle = (this.angle + (degrees * this.direction)) % 360;
    }

    walkHorizontallyRightOrLeft() {//ok
        this.body.velocity.x = -this.left;
        this.body.velocity.y = 0;
    }

    walkHorizontallyRightOrLeftReverse() {//ok
        this.body.velocity.x = this.left;
        this.body.velocity.y = 0;
    }

    walkVerticallyUporDown() {//ok
        this.body.velocity.y = -this.up * this.walkSpeed;
        this.body.velocity.x = 0;
    }

    walkVerticallyUpOrDownReverse() {//ok
        this.body.velocity.y = this.up * this.walkSpeed;
        this.body.velocity.x = 0;
    }

    update(time, delta) {
        super.update(time, delta);
    }

    collisionSolid(hit) {

    }
}