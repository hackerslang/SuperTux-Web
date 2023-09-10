class Tux extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.level = config.level;
        this.originalLevel = config.level;
        this.anims.play("tux-stand");
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.REAL_COLLISION_BOX_WIDTH = 46;
        this.REAL_COLLISION_BOX_HEIGHT = 80;

        this.SPARKLE_BODY_WIDTH = 40;
        this.SPARKLE_BODY_HEIGHT = 72;

        this.body.setSize(this.REAL_COLLISION_BOX_WIDTH, this.REAL_COLLISION_BOX_HEIGHT);
        this.body.setOffset(15, 15);
        this.setDepth(999);
        this.health = 3;

        this.x = config.x;
        this.y = config.y;
        this.scene = config.scene;

        this.killTimer = 0;
        this.wasHurt = 0;
        this.hurtStep = 0;
        this.damagedToggle = false;
        this.killed = false;

        this.directionSign = 0;

        this.isDying = false;
        this.isDeactivated = false;

        this.canJump = true;
        this.isDucked = false;
        this.isBig = true;
        this.isOnGround = true;
        this.fallMode = this.ON_GROUND;

        this.ON_GROUND = 0;

        this.SKID_XM = 200;

        this.MAX_WALK_XM = 250;
        this.MAX_RUN_XM = 500;
        this.WALK_SPEED = 100;

        this.WALK_ACCELERATION_X = 300;
        this.RUN_ACCELERATION_X = 550; 

        this.NORMAL_FRICTION_MULTIPLIER = 1.5;
        this.ICE_FRICTION_MULTIPLIER = 0.1;
        this.ICE_ACCELERATION_MULTIPLIER = 0.25;

        this.DIRECTION_LEFT = -1;
        this.DIRECTION_RIGHT = 1;

        this.HEIGHT = 80;
        this.DUCK_HEIGHT = 40;
        this.currentHeight = this.HEIGHT;

        this.JUMP_GRACE_TIME = 180;
        this.SKID_TIME = 100;

        this.jumpButtonTimer = 0;

        this.flipped = false;

        this.direction = this.DIRECTION_RIGHT;
        this.pointingTo = this.DIRECTION_RIGHT;
        this.flipDirection = false;

        this.MIN_DELTA = 100;
        this.currentDelta = 0;

        this.invincible = false;
        this.invincibleStep = 0;
        this.invincibleIndex = 0;

        this.falling = false;
        this.jumping = false;

        this.skiddingTimer = 0;

        this.INVINCIBLE_TIME = 14000;
        this.INVINCIBLE_TIME_WARNING = 2000;
        this.sparkleEveryOther = false;

        this.inputEnabled = true;
        this.setInteractive();

        this.grabbedObject = null;
        this.stone = false;
        this.doesButtJump = false;
        this.particleSprites = [];
        this.particleMaxId = 0;

        this.adjustBodyStandingRight();
    }

    listener() {
        alert("");
    }

    getOriginalLevel() {
        return this.originalLevel;
    }
    
    getKeyController() {
        return this.scene.getKeyController();
    }

    getJumpKey() {
        return this.scene.keys['jump'];
    }

    getFireKey() {
        return this.scene.keys['fire'];
    }

    getLeftKey() {
        return this.scene.keys['left'];
    }

    getRightKey() {
        return this.scene.keys['right'];
    }

    getDuckKey() {
        return this.scene.keys['duck'];
    }

    getPauseKey() {
        return this.scene.keys['menu'];
    }

    getAccelerationX() {
        return this.body.acceleration.x;
    }

    getAccelerationY() {
        return this.body.acceleration.y;
    }

    setAccelerationX(acceleration) {
        this.body.setAccelerationX(acceleration);
    }

    setAccelerationY(acceleration) {
        this.body.setAccelerationY(acceleration);
    }

    getVelocityX() {
        return this.body.velocity.x;
    }

    getVelocityY() {
        return this.body.velocity.y;
    }

    setVelocityX(velocity) { 
        this.body.setVelocityX(velocity);
    }

    setVelocityY(velocity) {
        this.body.setVelocityY(velocity);
    }

    playAnimation(key) {
        this.anims.play(key, true);
    }

    gameover() {
        this.playAnimation('tux-gameover');
    }

    jump() {
        this.setVelocityY(-100);
        this.playAnimation('tux-jump');
        this.body.setSize(59, 70, true);
        this.body.setOffset(0, 5);
    }

    run(velocity, frameRate) {
        this.setVelocityX(velocity);
        this.playAnimation('tux-run');
    }

    isActiveAndAlive() {
        return !this.isDying && !this.isDeactivated;
    }

    update(time, delta) {
        if (this.killed) {
            return;
        }

        if (this.body.y >= Math.floor(this.level.getLevelData().length * 32 - this.body.height) && !this.killed) {
            this.die();

            return;
        }

        if (this.invincible) {
            this.forceUpdateSprites(this.particleSprites, time, delta);

            if (this.invincibleTimer > 0) {
                this.invincibleTimer -= delta;
                this.invincibleStep += delta;

                var random = Math.floor(Math.random() * 3);

                if (this.invincibleStep >= 50) {
                    if (random == 0) {
                        this.sparkleEveryOther = !this.sparkleEveryOther;

                        var sparkleKey = "";

                        if (this.invincibleTimer > this.INVINCIBLE_TIME_WARNING) {
                            if (this.sparkleEveryOther) {
                                sparkleKey = "sparkle-medium";
                            } else {
                                sparkleKey = "sparkle-small";
                            }
                        } else {    
                            sparkleKey = "sparkle-dark";
                        }

                        var sparkle = new Sparkle({
                            id: this.particleMaxId,
                            scene: this.scene,
                            key: sparkleKey,
                            level: this.level,
                            player: this,
                            depth: 1000
                        });

                        this.particleSprites.push(sparkle);
                        this.particleMaxId++;
                    }
                    
                }
            } else {
                this.invincible = false;
                this.particleMaxId = 0;
                this.particleSprites = [];
            }
        }

        if (this.wasHurt > 0 && !this.invincible) {
            this.wasHurt -= delta;
            this.hurtStep += delta;

            if (this.hurtStep > 50) {
                this.damagedToggle = !this.damagedToggle;
                this.hurtStep = 0;
            }
            
            this.alpha = this.damagedToggle ? 0.3 : 1;
        }

        this.resetHurtIfNeeded();

        if (this.jumping && this.body.blocked.down && this.body.velocity.y == 0) {
            this.jumping = false;
            this.canJump = true;
            this.jumpButtonTimer = this.JUMP_GRACE_TIME;
        }

        if (this.jumpButtonTimer > 0) {
            this.jumpButtonTimer -= delta;
        }

        if (this.onGround()) {
            this.fallMode = this.ON_GROUND;
            this.lastGroundY = this.y;
        } else {
            if (this.y > this.lastGroundY) {
                this.fallMode = this.FALLING;
            } else if (this.fallMode === this.ON_GROUND) {
                this.fallMode = this.JUMPING;
            }
        }

        this.handleInput(delta);
    }

    forceUpdateSprites(sprites, time, delta) {
        if (sprites != null) {
            for (var i = 0; i < sprites.length; i++) {
                var sprite = sprites[i];

                if (sprite != null) {
                    sprite.update(time, delta);
                }
            }
        }
    }

    removeParticle(particle) {
        var index = particle.id;
        this.particleSprites[index] = null;
    }
    
    resetHurtIfNeeded() {
        if (this.wasHurt <= 0 || this.invincible) {
            this.resetHurt();
        }
    }

    resetHurt() {
        this.alpha = 1;
        this.hurtStep = 0;
    }

    die() {
        this.scene.cameras.main.setLerp(0, 0);
        this.dieWithoutRemovingColliders();
        
        if (this.level.playerGroundCollider != null)
            this.level.playerGroundCollider.destroy();

        if (this.level.woodCollider != null)
            this.level.woodCollider.destroy();

        if (this.level.spikeCollider != null)
            this.level.spikeCollider.destroy();
    }

    dieWithoutRemovingColliders() {
        if (this.killed) { return; }
        this.scene.setHealthBar(0);
        this.killed = true;
        this.tint = 0xFFFFFF;
        this.alpha = 1;
        this.playAnimation("tux-gameover");
        this.setVelocityX(0);
        this.setVelocityY(-550);
        this.setAccelerationX(0);
    }

    isDead() {
        return this.killed;
    }

    doDuck() {
        if (this.isDucked) {
            return;
        } 

        if (!this.isBig) {
            return;
        }

        if (this.getVelocityY() != 0) {
            return;
        }

        if (this.onGround()) {
            
        }

        this.sprite.adjustHeight(this.DUCKED_TUX_HEIGHT);
        this.isDucked = true;
        //this.growing = false;
        //m_unduck_hurt_timer.stop();  
    }

    onGround() {
        return (this.getVelocityY() == 0 && !this.jumping) || this.slightlyAboveGround() || this.onObject();
    }

    slightlyAboveGround() {
        let absVelocityY = Math.abs(this.getVelocityY());
        let groundYDelta = Math.abs(this.lastGroundY - this.y);

        return (absVelocityY == 16.625 || absVelocityY == 31.25) && groundYDelta < 0.85;
    }

    onObject() {
        var isOnObject = false;
        var playerX = this.x;
        var playerY = Math.floor(this.y / 32);

        if (this.onTopOfBlock()) {
            isOnObject = true;
        } else if (this.onTopOfEnemy()) {
            isOnObject = true;
        }

        return isOnObject;
    }

    onTopOfBlock() {
        var isOnTopOfBlock = false;
        var playerY = Math.floor(this.y / 32);

        //Array.from(this.level.blockGroup.children.entries).forEach(
        //    (block) => {
        //        var blockY = Math.floor(block.y / 32);

        //        if (this.x >= block.x - 20 && this.x <= block.x + 20 && playerY == blockY - 2) {
        //            isOnTopOfBlock = true;
                    
        //            return;
        //        }
        //    }
        //);

        return isOnTopOfBlock;
    }

    onTopOfEnemy() {
        var isonTopOfEnemy = false;

        Array.from(this.level.enemyGroup.children.entries).forEach(
            (enemy) => {
                if (enemy.enemyType == "krosh") {
                    if (this.x >= enemy.x - (enemy.width / 2) && this.x <= enemy.x + (enemy.width / 2) //128 40 //enemy still in air, so player moves left and right!!!
                        && this.y >= enemy.y - 111 && this.y <= enemy.y - 109) {
                        isonTopOfEnemy = true;
                        return;
                    }
                }
            }
        );

        return isonTopOfEnemy;
    }

    doStandUp() {
        if (!this.isDucked) {
            return;
        }

        if (!this.isBig) {
            return;
        }

        this.sprite.adjustHeight(BIG_TUX_HEIGHT);
        this.isDucked = false;
        //m_unduck_hurt_timer.stop();
    }

    handleInput(delta) {
        //this.currentDelta += delta;

        //if (this.currentDelta < this.MIN_DELTA) {
        //    return;
        //} else {
        //    this.currentDelta = 0;
        //}

        if (this.getKeyController().pressed('menu')) {
            this.level.pause();
        }

        this.handleHorizontalInput(delta);

        //if (this.onGround()) {
        //    this.canJump = true;
        //}

        if (this.getKeyController().hold('duck')) {
            this.doDuck();
        } else {
            this.doStandUp();    
        }

        this.handleVerticalInput(delta); 
    }

    handleHorizontalInput(delta) { //done, FULLY OK!  
        let vx = this.getVelocityX();
        let vy = this.getVelocityY();
        let ax = this.getAccelerationX();
        let ay = this.getAccelerationY();

        let leftKey = this.getLeftKey();
        let rightKey = this.getRightKey();
        let fireKey = this.getFireKey();
        let jumpKey = this.getJumpKey();
        let duckKey = this.getDuckKey();

        let controller = this.getKeyController();

        this.directionSign = 0;

        if (!this.ducked() || vy != 0) {
            if (controller.hold('left') && !controller.hold('right')) {
                this.oldDirection = this.direction;
                this.direction = this.DIRECTION_LEFT;
                this.directionSign = -1;
            } else if (!controller.hold('left') && controller.hold('right')) {
                this.oldDirection = this.direction;
                this.direction = this.DIRECTION_RIGHT;
                this.directionSign = 1;
            }

            if (this.direction != this.oldDirection) {
                this.flipDirection = true;
            }
        }

       // console.log("direction sign" + this.directionSign);

        //if (this.grabbedObject != null && this.grabbedObject.isHampering()) {

        //} else

        // GOOD FOR JUMP!! falling
        if (this.directionSign == 0 && vy == 0) {
            if (Math.abs(vx) > 80) {
                if (vx < 0) {
                    ax += 5;
                    vx += 5;
                } else if (vx > 0) {
                    ax -= 5;
                    vx -= 5;
                }
            } else {
                ax = 0;
                vx = 0;
            }
        } else if (vx * this.directionSign < this.MAX_WALK_XM) {
            ax = this.directionSign * this.WALK_ACCELERATION_X;
        } else {
            ax = this.directionSign * this.RUN_ACCELERATION_X;
        }

        if (vx >= this.MAX_RUN_XM && this.directionSign > 0) {
            vx = this.MAX_RUN_XM;
            ax = 0;
        } else if (vx <= -this.MAX_RUN_XM && this.directionSign < 0) {
            vx = -this.MAX_RUN_XM;
            ax = 0;
        }

        if (this.directionSign != 0 && Math.abs(vx) < this.WALK_SPEED) {
            vx = this.directionSign * this.WALK_SPEED;
        }

        this.skiddingTimer -= delta;
        if (this.directionSign != 0) {
            //console.log("dir sign" + this.directionSign + " " + vx);
            //console.log("ONGROUND" + this.onGround());
        }

        if ((vx < 0 && controller.hold('right') && !controller.hold('left')) || (vx > 0 && controller.hold('left') && !controller.hold('right'))) {
            if (this.onGround()) {
                if (Math.abs(vx) > this.SKID_XM && this.skiddingTimer <= 0) { //use time, delta update function!
                    this.skiddingTimer = this.SKID_TIME;
                    ax *= 2.5;
                } else {
                    ax *= 2;
                }
            } else {
                ax *= 2;
            }
        }

        if (this.onIce()) {
            ax *= this.ICE_ACCELERATION_MULTIPLIER;  
        }

        this.setVelocityX(vx);
        this.setVelocityY(vy);
        this.setAccelerationX(ax);
        this.setAccelerationY(ay);

        //if (this.directionSign == 0)
        //{
            //this.applyFriction();

        //}
            
    }

    applyFriction() {
        if (this.onGround() && this.getVelocityX() < this.WALK_SPEED) {
            this.setVelocityX(this.getVelocityX() / 2);
            this.setAccelerationX(0);
        } else {
            var friction = this.WALK_ACCELERATION_X * (this.onIce ? this.ICE_FRICTION_MULTIPLIER : this.NORMAL_FRICTION_MULTIPLIER);
            if (this.getVelocityX() < 0) {
                this.setAccelerationX(friction);
            } else if (this.getVelocityX() > 0) {
                this.setAccelerationX(-friction);
            }
        }
    }

    makeInvincible() {
        this.invincible = true;
        this.invincibleTimer = this.INVINCIBLE_TIME;
    }

    onIce() {
        return false;
    }

    ducked() {
        return false;
    }

    isActiveAndAlive() {
        return !this.isDying && !this.isDeactivated;
    }

    handleVerticalInput(delta) { //ok
        let vx = this.getVelocityX();
        let vy = this.getVelocityY();
        let ax = this.getAccelerationX();
        let ay = this.getAccelerationY();

        let leftKey = this.getLeftKey();
        let rightKey = this.getRightKey();
        let fireKey = this.getFireKey();
        let jumpKey = this.getJumpKey();
        let duckKey = this.getDuckKey();

        let controller = this.getKeyController();

        if (this.jumpButtonTimer <= 0 && this.skiddingTimer <= 0 && this.canJump) {
             if (controller.pressed('jump')) {
                this.doJump(Math.abs(vx) > this.MAX_WALK_XM ? -580 : -520);
            } 
        }

        //console.log("vx:" + vx + "vy" + vy);
        this.setAccelerationY(0);  
    }

    doJump(speed) {
        if (!this.onGround()) { return; }
        
        this.setVelocityY(speed);

        this.jumping = true;
        this.isOnGround = false;
        this.canJump = false;
    }

    draw(time, delta) {
        // if Tux is above camera, draw little "air arrow" to show where he is x-wise
        if (this.killed) {

            return;
        } 
        // else if backflipping

        if (this.invincible) {
            //this.tint = [0xFFFFFF, 0xFF0000, 0xFFFFFF, 0x00FF00, 0xFFFFFF, 0x0000FF][this.invincibleIndex];
        } else if (this.wasHurt <= 0) {
           //this.tint = 0xFFFFFF;
        }

        if (this.duck && this.isBig) {
            this.drawDuck();
        } else if (this.skiddingTimer > 0) {
            this.drawSkid();
        } else if ((!this.onGround() || this.fallMode != this.ON_GROUND) && !this.body.blocked.down) {
            this.drawJumping();
        } else if (Math.abs(this.getVelocityX()) < 1) {
            this.drawStanding();
        } else {
            if (Math.abs(this.getVelocityX()) > this.MAX_WALK_XM) {
                this.drawRunning();
            } else {
                this.drawWalking();
            }
        }
    }

    flipDraw() {
        if (this.flipDirection) {
            this.flipX = (this.direction == this.DIRECTION_RIGHT ? false : true);
            //this.pointingTo = this.direction;
            this.flipDirection = false;
        }
    }

    adjustBody(width, height, offsetX, offsetY) {
        this.body.setSize(width, height);
        this.body.setOffset(offsetX, offsetY);
    }

    adjustBodyStanding() {
        if (this.direction == this.DIRECTION_RIGHT) {
            this.adjustBodyStandingRight();
        } else {
            this.adjustBodyStandingLeft();
        }
    }

    adjustBodySkidding() {
        if (this.direction == this.DIRECTION_RIGHT) { //Whatch out, when walking right and skidding, skidding is left and vice versa!
            this.adjustBodySkiddingRight();
        } else {
            this.adjustBodySkiddingLeft();
        }
    }

    adjustBodyStandingRight() {
        this.adjustBody(46, 80, 15, 15);
    }

    adjustBodyStandingLeft() {
        this.adjustBody(46, 80, 15, 15);
    }

    adjustBodySkiddingRight() {
        this.adjustBody(62, 80, 8, 15);
    }

    adjustBodySkiddingLeft() {
        this.adjustBody(62, 80, 8, 15);
    }

    adjustBodyFalling() {
        this.adjustBody(59, 78, 10, 15);
    }

    drawFalling() {
        this.flipDraw();
        this.setTexture("tux-jump-0");
        this.adjustBodyFalling();
    }

    drawJumping() {
        this.flipDraw();
        this.setTexture("tux-jump-0");
        this.adjustBodyFalling();
    }

    drawStanding() {
        this.playAnimation("tux-stand");
        this.adjustBodyStanding();
    }

    removeFalling() {
        this.falling = false;
    }

    drawDuck() {
        if (this.oldDirection == this.DIRECTION_LEFT) {
            //this.sprite.ScaleX = -1;
        } else if (this.oldDirection == this.DIRECTION_RIGHT) {
            //this.sprite.ScaleX = 1;
        }
        this.playAnimation("tux-duck");
    }

    drawSkid() {
        this.flipDraw();
        this.setTexture("tux-skid");
        this.adjustBodySkidding();
    }

    drawWalking() {
        this.flipDraw();
        this.playAnimation("tux-run");
    }

    drawRunning() {
        this.flipDraw();
        this.playAnimation("tux-run");
    }

    drawDying() {
        this.playAnimation("tux-gameover");
    }

    bounce(enemy) {
        // Force Mario y-position up a bit (on top of the enemy) to avoid getting killed
        // by neigbouring enemy before being able to bounce
        this.body.y = enemy.body.y - this.body.height;
        // TODO: if jump-key is down, add a boost value to jump-velocity to use and init jump for controls to handle.
        this.body.setVelocityY(-150);
    }

    hurtBy(enemy) {
        if (this.wasHurt > 0) {
            return;
        }

        this.health = Math.max(0, this.health - 1);
        
        var newHealth = this.health * 33;

        if (newHealth >= 99) {
            newHealth = 100;
        }

        this.scene.setHealthBar(newHealth);

        if (this.health <= 0) {
            this.die();
        } else {
            console.log(this.wasHurt);
            this.wasHurt = 4000;
        }   
    }

    addHealth(health) {
        if (this.killed) {
            return;
        }

        this.health = Math.min(3, this.health + 1);

        let newHealth = this.health * 33;

        if (newHealth >= 99) {
            newHealth = 100;
        }

        this.scene.setHealthBar(newHealth);
    }

    getGrabbedObject() {
        return this.grabbedObject;
    }

    unGrab() {
        this.grabbedObject = null;
    }

    isStone() {
        return this.stone;
    }
}

class Tony {//sprite.anims.msPerFrame = n;

}

class Tix {

}

class Tax {

}