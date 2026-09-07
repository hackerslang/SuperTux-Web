import { Enemy, EnemyState } from './enemy.js';

export var LedgeBehavior = {
    STRICT: 0,  /* Do not fall off any ledge at all. */
    SMART: 1,   /* Do not fall off any ledgen byt still go down slopes. */
    NORMAL: 2,  /* Fall off any ledge, unless the ledge is too tall or the ledge falls offscreen. */
    FALL: 4     /* Fall off any ledge. */
}

export class WalkingEnemy extends Enemy { //everything implemented except collision and flipX sprite
    constructor(config, self) {
        super(config);
        this.enemy = self;

        this.initWalkSpeed(config);

        this.turnedAroundTimerActivated = false;
        this.turnAroundCounter = 0;
        this.maxDropHeight = -1;

        this.stayOnPlatformOverridden = false;
    }

    initWalkSpeed(config) {
        var walkSpeed = 100;

        if (config.walkSpeed != null) {
            walkSpeed = config.walkSpeed;
        }

        if (walkSpeed < 0) {
            this.direction = this.DIRECTION_LEFT;
        } else {
            this.direction = this.DIRECTION_RIGHT;
        }

        this.setWalkSpeed(walkSpeed);
    }

    initialize() {
        if (this.frozen) {
            return;
        }

        this.walk();
        this.setAccelerationX(0);
    }

    walk() {
        this.anims.play(this.walkAnimation);

        if (this.direction == this.DIRECTION_RIGHT) {
            this.setVelocityX(this.walkSpeed);
            this.flipX = true;
        } else {
            this.setVelocityX(-this.walkSpeed);
            this.flipX = false;
        }
    }

    setWalkSpeed(walkSpeed) {   //FULLY IMPLEMENTED!!
        this.walkSpeed = Math.abs(walkSpeed);
    }

    update(time, delta) {
        super.update(time, delta);

        // Rounding bug phaser, character lowers slowly without this fix!
        this.body.y = Math.floor(this.body.y);

        this.activeUpdate(delta);
    }

    activeUpdate(delta) {
        activeUpdate(delta, (this.direction == Direction_LEFT) ? -walk_speed : +walk_speed);
    }

    activeUpdate(delta, destinationXVelocity, modifier) {
        // if (Math.abs(this.getVelocityX()) > 0) {
        //     this.anims.play(this.walkAnimation);
        // }

        super.activeUpdate();

        modifier = 0;

        // Walk down the slopes easily ...

        if (this.onGround() && this.floorNormal.y != 0 && (this.floorNormal.x * this.getVelocityX()) >= 0) {
            this.setVelocityY(Math.abs(this.getVelocityX()) * Math.abs(this.floorNormal.x) + 100);
        }

        var currentVelocityX = this.getVelocityX();

        if (this.frozen) {
            return;
        }
        
        if ((currentVelocityX > (destinationXVelocity - 5)) && (currentVelocityX < destinationXVelocity + 5)) {
            this.setVelocityX(destinationXVelocity);
            this.setAccelerationX(0);
        } else if (((destinationXVelocity <= 0) && (currentVelocityX > destinationXVelocity)) ||
            ((destinationXVelocity > 0) && (currentVelocityX < destinationXVelocity))) {
            var iceMultiplier = (this.onIce && this.onGround()) ? super.BADGUY_ICE_ACCELERATION_MULTIPLIER : 1;

            this.setAccelerationX(destinationXVelocity * modifier * iceMultiplier);
        } else if (((destinationXVelocity <= 0) && (currentVelocityX < destinationXVelocity)) ||
            ((destinationXVelocity > 0) && (currentVelocityX > destinationXVelocity))) {
            var iceMultiplier = (this.onIce && this.onGround()) ? super.BADGUY_ICE_ACCELERATION_MULTIPLIER : 1;

            this.setAccelerationX((-1) * destinationXVelocity * iceMultiplier);
        }

        if (this.maxDropHeight > -1 && this.onGround() && super.mightFall(this.maxDropHeight + 1) && !this.stayOnPlatformOverridden) {
            this.turnAround();
        }
        
        this.stayOnPlatformOverridden = false;

        if (this.direction == this.DIRECTION_LEFT && this.getVelocityX() > 0) {
            this.direction = this.DIRECTION_RIGHT;
            this.anims.play(this.walkAnimation);
            this.flipX = true;
        } else if (this.direction == this.DIRECTION_RIGHT && this.getVelocityX() < 0) {
            this.direction = this.DIRECTION_LEFT;
            this.anims.play(this.walkAnimation);
            this.flipX = false;
        }
    }

    setLedgeBehavior(ledgeBehavior) {
        switch (ledgeBehavior) {
            case LedgeBehavior.STRICT:
                this.maxDropHeight = 0;
                break;
            case LedgeBehavior.SMART:
                this.maxDropHeight = 16;
                break;
            case LedgeBehavior.NORMAL:
                this.maxDropHeight = this.normalMaxDropHeight;
                break;
            case LedgeBehavior.FALL:
                this.maxDropHeight = -1;
                break;
            default:
                this.maxDropHeight = -1;
                break;
        }
    }

    collisionSolid(hit) {
        super.updateOnGroundFlag(hit);

        if (this.frozen || !this.isActive()) {
            super.collisionSolid(hit);

            return;
        }

        if (hit.top && !hit.bottom) {
            this.setVelocityY(0.2);
        } else if (hit.bottom) {
            this.disableGravityTemporarily();
        } else {
            this.restoreGravityY();
        }

        if (hit.slopeNormal.x == 0 &&
            (hit.left && this.direction == Direction.LEFT) ||
                (hit.right && this.direction == Direction.RIGHT)) {
            this.turnAround();
        }
    }

    disableGravityTemporarily() {
        this.saveGravityY();
        this.body.setGravityY(0);
        this.setVelocityY(0);
        this.setAccelerationY(0);
    }

    saveGravityY() {
        const gravity = this.body && this.body.gravity ? this.body.gravity : { x: 0, y: 0 };

        this.savedGravityY = gravity.y;
    }

    restoreGravityY() {
        if (!this.body || !this._savedGravityY) return;

        this.body.setGravityY(this.savedGravityY || 0);
    }

    turnAround() {
        if (this.frozen) {
            return;
        }

        this.flipX = (this.direction == this.DIRECTION_RIGHT);

        this.direction = this.direction == this.DIRECTION_LEFT ? this.DIRECTION_RIGHT : this.DIRECTION_LEFT;
        var state = super.getState();

        if (state == EnemyState.STATE_INIT || state == EnemyState.STATE_INACTIVE || state == EnemyState.STATE_ACTIVE) {
            this.anims.play(this.walkAnimation);
        }

        this.spriteFlip();

        this.setVelocityX(-this.getVelocityX());
        this.setAccelerationX(-this.getAccelerationX());

        if (this.turnedAroundTimerActivated) {
            if (this.turnAroundCounter++ > 10) {
                this.killFalling();
            } else {
                this.turnedAroundTimerActivated = true;
                this.turnAroundCounter = 0;
            }
        }
    }

    freeze() {
        super.freeze();
    }

    unfreeze(melt) {
        super.unfreeze(melt);
        this.initialize(); //WalkingEnemy.initialize();
    }

    EnemyPlayerHit(enemy, player) {
        super.playerHit(enemy, player);
    }

    EnemyActiveUpdate(time, delta) {
        super.activeUpdate(time, delta);
    }

    activate() {
        this.walk();
    }

    enemyHit(thisEnemy, enemy) {
       
    }

    spriteFlip() {
        this.flipX = !this.flipX;
    }
}