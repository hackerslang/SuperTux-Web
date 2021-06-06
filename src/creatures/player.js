class Tux extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.level = config.level;
        this.originalLevel = config.level;
        this.anims.play("tux-stand");
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.setSize(48, 90, true);
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

        this.JUMP_GRACE_TIME = 0.25;
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
    }

    run(velocity, frameRate) {
        //console.log(this.sprite);
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
            if (this.invincibleTimer > 0) {
                this.invincibleTimer -= delta;
                this.invincibleStep += delta;

                if (this.invincibleStep >= 50) {
                    this.invincibleIndex = (this.invincibleIndex == 5 ? 0 : this.invincibleIndex + 1);
                    this.invincibleStep = 0;
                }
            } else {
                this.invincible = false;
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

        if (this.onGround()) {
            this.jumping = false;
        }

        this.handleInput(delta);
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
        this.scene.setHealthBar(0);
        this.killed = true;
        this.tint = 0xFFFFFF;
        this.alpha = 1;
        this.playAnimation("tux-gameover");
        this.setVelocityX(0);
        this.setVelocityY(-550);
        this.setAccelerationX(0);
        
        if (this.level.playerGroundCollider != null)
            this.level.playerGroundCollider.destroy();

        if (this.level.woodCollider != null)
            this.level.woodCollider.destroy();

        if (this.level.spikeCollider != null)
            this.level.spikeCollider.destroy();
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
        return this.getVelocityY() == 0 || this.slightlyAboveGround();
    }

    slightlyAboveGround() {
        let absVelocityY = Math.abs(this.getVelocityY());
        let groundYDelta = Math.abs(this.lastGroundY - this.y);

        return (absVelocityY == 16.625 || absVelocityY == 31.25) && groundYDelta < 0.85;
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

        this.handleHorizontalInput(delta);

        if (this.onGround()) {
            this.canJump = true;
        }

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
        if (vx * this.directionSign < this.MAX_WALK_XM) {
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

        if ((vx < 0 && controller.hold('right')) || (vx > 0 && controller.hold('left'))) {
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

        if (ax > 0)
            //console.log(vx + " " + vy + " " + ax + " " + ay);

        this.setVelocityX(vx);
        this.setVelocityY(vy);
        this.setAccelerationX(ax);
        this.setAccelerationY(ay);

        if (this.directionSign == 0) {
            this.applyFriction();
        }
    }

    applyFriction() {
        if (this.onGround() && Math.abs(this.getVelocityY()) < this.WALK_SPEED) {
            this.setVelocityX(0);
            this.setAccelerationX(0);
        } else {
            var friction = this.WALK_ACCELERATION_X * (this.onIce ? this.ICE_FRICTION_MULTIPLIER : this.NORMAL_FRICTION_MULTIPLIER);
            if (this.getVelocityX() < 0) {
                this.setAccelerationX(friction);
            } else if (this.getVelocity > 0) {
                this.setAccelerationX(-friction);
            }
        }
    }

    makeInvincible() {
        this.invincible = true;
        this.invincibleTimer = 5000;
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

        if (controller.pressed('jump')) {
            this.jumpButtonTimer = this.JUMP_GRACE_TIME;
        }

        if (controller.hold('jump') && this.jumpButtonTimer > 0 && this.canJump) {
            this.jumpButtonTimer = 0;
            this.doJump(Math.abs(vx) > this.MAX_WALK_XM ? -580 : -520);
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
            this.tint = [0xFFFFFF, 0xFF0000, 0xFFFFFF, 0x00FF00, 0xFFFFFF, 0x0000FF][this.invincibleIndex];
        } else if (this.wasHurt <= 0) {
            this.tint = 0xFFFFFF;
        }

        if (this.duck && this.isBig) {
            this.drawDuck();
        } else if (this.skiddingTimer > 0) {
            this.drawSkid();
        } else if ((!this.onGround() || this.fallMode != this.ON_GROUND)) {
            if (this.getVelocityX() != 0 || this.fallMode != this.ON_GROUND) {
                if (this.getVelocityY() > 0) {
                    this.drawFalling();
                } else if (this.getVelocityY() <= 0 || this.fallMode != this.ON_GROUND) {
                    this.drawJumping();
                }
            }
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

    drawFalling() {
        this.flipDraw();
        this.setTexture("tux-jump-0");
        //this.playAnimation("tux-jump");
    }

    drawJumping() {
        this.flipDraw();
        this.setTexture("tux-jump-0");
    }

    drawStanding() {
        this.playAnimation("tux-stand");
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
        this.playAnimation("tux-skid");
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

    enemyBounce(enemy) {
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
}

class Tony {//sprite.anims.msPerFrame = n;

}

class Tix {

}

class Tax {

}