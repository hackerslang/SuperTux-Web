class WalkingEnemy extends Enemy { //everything implemented except collision and flipX sprite
    constructor(config, self) {
        super(config);
        this.enemy = self;

        this.initWalkSpeed(config);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.turnedAroundTimerActivated = false;
        this.turnAroundCounter = 0;
        this.maxDropHeight = -1;
    }

    initWalkSpeed(config) {     //FULLY IMPLEMENTED!!
        var walkSpeed = 100;

        if (config.walkSpeed != null) {
            walkSpeed = config.walkSpeed;
        }

        this.setWalkSpeed(walkSpeed);
    }

    initialize() {              //FULLY IMPLEMENTED!!
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

    //update(time, delta) {
    //    super.update(time, delta);
    //}

    //update(time, delta) {
    //    if (this.killed) {
    //        return;
    //    }

    //    if (!this.activated()) {
    //        return;
    //    }

    //    if (this.activated()) {
    //        this.activateStartMoving();
    //    }
    //}

    update(time, delta) {
        super.update(time, delta);
    }

    activeUpdate() {            //FULLY IMPLEMENTED!!
        super.activeUpdate();

        if (this.frozen) {
            return;
        }

        //super.walkAndTurnOnEdge();

        //perhaps we must make sure they can drop from small heights!! == walkAndTurnOnEdge();
        //if (this.onGround() && this.mightFall()) {
        //    this.turnAround();
        //}

        super.walkAndTurnOnEdge();

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

    turnAround() {                  //FULLY IMPLEMENTED!!
        if (this.frozen) {
            return;
        }

        this.flipX();

        this.direction = this.direction == this.DIRECTION_LEFT ? this.DIRECTION_RIGHT : this.DIRECTION_LEFT;
        var state = this.getState();

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

    //activateStartMoving() {
    //    this.setActivated();
    //    this.direction = this.DIRECTION_LEFT;
    //    this.setVelocityInDirection();
    //}

    //setActivated() {
    //    this.firstActivated = true;
    //}

    //turnAround() {
    //    super.switchDirection();
    //    this.setVelocityInDirection();
    //    this.spriteFlip();
    //}

    //setVelocityInDirection() {
    //    this.body.velocity.x = this.direction * speed;
    //}

    spriteFlip() {
        this.flipX = !this.flipX;
    }
}