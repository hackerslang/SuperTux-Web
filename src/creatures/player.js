import { GameSession } from '../object/game_session.js';
import { Level } from '../object/level/Level.js';
import { Sector } from '../object/level/sector.js';
import { GAME_GRAVITY } from '../game.js';

export class Tux extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.level = config.level;
        this.originalLevel = config.level;
        this.scene = config.scene;
        this.anims.play("tux-stand");
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.REAL_COLLISION_BOX_WIDTH = 40;
        this.REAL_COLLISION_BOX_HEIGHT = 60;

        this.SPARKLE_BODY_WIDTH = 40;
        this.SPARKLE_BODY_HEIGHT = 80;

        this.setOrigin(0.5, 0);
        this.adjustBodyStanding();
        this.setDepth(999);
        this.health = config.health != null ? config.health : 3;

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

        this.MAX_WALK_XM = 175;
        this.MAX_RUN_XM = 400;
        this.WALK_SPEED = 100;

        this.MAX_CLIMB_XM = 50;
        this.MAX_CLIMB_YM = 50;

        this.WALK_ACCELERATION_X = 300;
        this.RUN_ACCELERATION_X = 400; 

        this.NORMAL_FRICTION_MULTIPLIER = 1.5;
        this.ICE_FRICTION_MULTIPLIER = 0.1;
        this.ICE_ACCELERATION_MULTIPLIER = 0.25;

        this.OVERSPEED_DECELERATION = 100;

        this.DIRECTION_LEFT = -1;
        this.DIRECTION_RIGHT = 1;

        this.HEIGHT = 80;
        this.DUCK_HEIGHT = 40;
        this.currentHeight = this.HEIGHT;

        this.JUMP_GRACE_TIME = 180;
        this.SKID_TIME = 100;

        this.CLIMBING_PRESSED_TIME = 500;

        this.jumpButtonTimer = 0;
        this.fallingStartTimer = 0;
        this.climbingPressedTimer = 0;

        this.flipped = false;

        this.direction = this.DIRECTION_RIGHT;
        this.pointingTo = this.DIRECTION_RIGHT;
        this.flipDirection = false;
        this.forceDrawWalking = 0;

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
        this.hasPlayedDuck = false;
        this.hasPlayedKick = false;
        this.hasPlayerJump = false;

        this.isClimbing = false;

        this.KICK_TIME = 300;

        this.killAt = 0;

        //When Tux climbs, he can hang with his arms at the climbing fence. This padding allows him to hang at the bottom of the climbing fence, while hanging
        //with his head below the fence. This is approximately the length of his hands.
        this.climbingTopPadding = 10;

        this.setCustomGravityIfNeeded();
    }

    setCustomGravityIfNeeded() {
        var customGravity = Sector.getCurrentSector().getCustomGravity();

        if (customGravity !== undefined) {
            this.body.setGravityX(customGravity.x || 0);
            this.body.setGravityY(customGravity.y || GAME_GRAVITY);
        }
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

    playAnimationOnce(key) {
        this.anims.play(key, false);
    }

    gameover() {
        this.playAnimation('tux-gameover');
    }

    jump() {
        this.setVelocityY(-200);
        this.playAnimation('tux-jump');
    }

    isActiveAndAlive() {
        return !this.isDying && !this.isDeactivated;
    }

    update(time, delta) {
        if (this.killAt > 0) {
            this.killAt -= delta;
        }

        if (this.killed) {
            if (this.killAt <= 0) {
                this.scene.restartCurrentSector();
            }

            return;
        }

        this.stayInStaticsIfNeeded();

        //rounding bug phaser
        if (!this.isClimbing) { this.body.y = Math.ceil(this.body.y); }

        if (this.body.y >= Math.floor(Level.getMaxLevelHeightY() * 32 - this.body.height) && !this.killed) {
            this.die();

            return;
        }

        if (this.forceDrawWalking > 0) {
            this.forceDrawWalking -= delta;
        }

        this.fallIfMightAlmostFallOverEdge();

        if (this.fallingStartTimer > 0) {
            this.fallingStartTimer -= delta;
        }

        if (this.skiddingTimer > 0) {
            this.skiddingTimer -= delta;
        }

        if (this.kickTimer > 0) {
            this.kickTimer -= delta;
        } else {
            this.hasPlayedKick = false;
        }

        this.setCollisionBoxesForAnimations();

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
                            sector: Sector.getCurrentSector(),
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

        if (this.jumping && (this.body.blocked.down || this.onGround())) {
            this.jumping = false;
            this.canJump = true;
            this.jumpButtonTimer = this.JUMP_GRACE_TIME;
        }

        if (this.jumpButtonTimer > 0) {
            this.jumpButtonTimer -= delta;
        }

        if (this.onGround() || Level.isInClimbingFence(this, this.scene)) {
            this.fallMode = this.ON_GROUND;
            this.lastGroundY = this.y;
            this.fallingFlagStart = false;
        } else {
            if (!this.fallingFlagStart && !this.jumping) {
                this.fallingStartTimer = 300;
                this.fallingFlagStart = true;
            }

            if (this.y > this.lastGroundY) {
                this.fallMode = this.FALLING;
            } else /*if (this.fallMode === this.ON_GROUND)*/ {
                this.fallMode = this.JUMPING;
            }
        }

        this.handleInput(delta);
    }

    setCollisionBoxesForAnimations() {
        if (this.texture.key  == "tux-skid") {
            this.adjustBody(64, 63, 1, 14);
        } else if (this.anims.getName() == 'tux-stand') {
            this.adjustBodyStanding();
        } else if (this.anims.getName() == 'tux-walk') {
            let textureKey = this.anims.currentFrame.textureKey;

            switch (textureKey) {
                case "tux-walk-0":
                    this.adjustBody(52, 65, 7, 14);
                    break;
                case "tux-walk-1":
                    this.adjustBody(53, 66, 7, 12);
                    break;
                case "tux-walk-2":
                    this.adjustBody(53, 60, 7, 18);
                    break;
                case "tux-walk-3":
                    this.adjustBody(39, 63, 11, 15);
                    break;
                case "tux-walk-4":
                    this.adjustBody(47, 65, 10, 13);
                    break;
                case "tux-walk-5":
                    this.adjustBody(51, 65, 10, 13);
                    break;
                case "tux-walk-6":
                    this.adjustBody(50, 60, 10, 18);
                    break;
                case "tux-walk-7":
                    this.adjustBody(41, 64, 12, 15);
                    break;
                default:
                    console.log("Error: invalid texture in tux-walk!");
                    break;
            }
        } else if (this.anims.getName() == 'tux-run') {
            let textureKey = this.anims.currentFrame.textureKey;

            if (this.direction == this.DIRECTION_RIGHT) {
                switch (textureKey) {
                    case "tux-run-0":
                    case "tux-run-1":
                        this.adjustBody(62, 64, 7, 12);
                        break;
                    case "tux-run-2":
                        this.adjustBody(67, 61, 3, 15);
                        break;
                    case "tux-run-3":
                        this.adjustBody(60, 58, 5, 18);
                        break;
                    case "tux-run-4":
                    case "tux-run-5":
                        this.adjustBody(60, 63, 5, 13);
                        break;
                    case "tux-run-6":
                        this.adjustBody(66, 61, 3, 15);
                        break;
                    case "tux-run-7":
                        this.adjustBody(60, 58, 5, 18);
                        break;
                    default:
                        console.log("Error: invalid texture in tux-run!");
                        break;
                }
            }
        } else if (this.anims.getName() == 'tux-jump') {
            let textureKey = this.anims.currentFrame.textureKey;

            if (this.direction == this.DIRECTION_RIGHT) {
                switch (textureKey) {
                    case "tux-jump-0":
                        this.adjustBody(59, 70, 1, 0);
                        break;
                    case "tux-jump-1":
                    case "tux-jump-2":
                        this.adjustBody(62, 77, 1, 0);
                        break;
                    default:
                        console.log("Error: invalid texture in tux-jump!");
                }

            } else {

            }
        } else if (this.anims.getName() == 'tux-fall') {
            if (this.direction == this.DIRECTION_RIGHT) {
                this.adjustBody(62, 77, 1, 0);
            }
        } else if (this.anims.getName() == 'tux-kick') {
            let textureKey = this.anims.currentFrame.textureKey;

            if (textureKey == "tux-kick-0") {
                if (this.direction == this.DIRECTION_RIGHT) {
                    this.adjustBody(42, 57, 10, 20);
                } else {

                }

            } else if (textureKey == "tux-kick-1") {
                this.adjustBody(43, 46, 11, 31);
            } else if (textureKey == "tux-kick-2") {
                this.adjustBody(50, 31, 8, 46);
            } else if (textureKey == "tux-kick-3") {
                this.adjustBody(46, 36, 8, 41);
            } else if (textureKey == "tux-kick-4") {
                this.adjustBody(46, 36, 8, 41);
            }
        } else if (this.anims.getName() == 'tux-duck') {
            let textureKey = this.anims.currentFrame.textureKey;

            if (textureKey == "tux-duck-0") {
                this.adjustBody(43, 57, 11, 20);
            } else if (textureKey == "tux-duck-1") {
                this.adjustBody(43, 46, 11, 31);
            } else if (textureKey == "tux-duck-2") {
                this.adjustBody(50, 31, 8, 46);
            } else if (textureKey == "tux-duck-3") {
                this.adjustBody(46, 36, 8, 41);
            } else if (textureKey == "tux-duck-4") {
                this.adjustBody(46, 36, 8, 41);
            }
        }
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
        if (this.killed) { return; }

        this.body.setAllowGravity(true);
        this.scene.cameras.main.setLerp(0, 0);
        this.dieWithoutRemovingColliders();
        this.removeColliders();
    }

    dieWithoutRemovingColliders() {
        this.scene.setHealthBar(0);
        this.killed = true;
        this.killAt = 3000;
        this.tint = 0xFFFFFF;
        this.alpha = 1;
        this.playAnimation("tux-gameover");
        this.setVelocityX(0);
        this.setVelocityY(-550);
        this.setAccelerationX(0);

        GameSession.playerDied(this.level);
    }

    removeColliders() {
        if (this.scene.playerGroundCollider != null)
            this.scene.playerGroundCollider.destroy();

        if (this.scene.woodCollider != null)
            this.scene.woodCollider.destroy();

        if (this.scene.spikeCollider != null)
            this.scene.spikeCollider.destroy();
    }

    isDead() {
        return this.killed;
    }

    doDuck() {
        if (this.ducked) {
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

        this.ducked = true;
    }

    onGround() {
        return (this.getVelocityY() == 0 && !this.jumping) || this.slightlyAboveGround() || this.onObject(); //|| this.slightlyAboveObject();
    }

    slightlyAboveGround() {
        var x = this.body.x;
        var bottomY = this.body.bottom - 10;
        var bottomY2 = this.body.bottom + 15;
        var y = this.body.y + 32;

        return Level.isOnTopOfObjects(x, y, this.scene) || Level.isOnTopOfPlayerCollisionObject(x, bottomY, bottomY2, this.scene);
    }

    onObject() {
        var isOnObject = false;

        if (this.onTopOfBlock()) {
            isOnObject = true;
        } else if (this.onTopOfEnemy()) {
            isOnObject = true;
        }

        return isOnObject;
    }

    slightlyAboveObject() {
        var tileBelowX = this.body.x;
        var bottomY = this.body.bottom - 5;
        var tileBelowY = bottomY + 32;

        return Level.isFreeOfObjects(tileBelowX, tileBelowY, this.scene);
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

        Array.from(this.scene.enemyGroup.children.entries).forEach(
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
        if (!this.ducked) {
            return;
        }

        if (!this.isBig) {
            return;
        }

        this.adjustBodyStanding();
        this.ducked = false;
        this.hasPlayedDuck = false;
    }

    handleInput(delta) {
        this.handleInputClimbing(delta);

        if (this.isClimbing) {
            return;
        }

        this.handleHorizontalInput();

        if (this.getKeyController().pressed('duck') || (this.ducked && this.getKeyController().hold('duck'))) {
            this.doDuck();
        } else {
            this.doStandUp();    
        }

        this.handleVerticalInput(delta); 
    }

    handleInputClimbing(delta) {
        if (this.climbingPressedTimer > 0) {
            this.climbingPressedTimer -= delta;
        }

        if (!this.isClimbing) {
            if (this.wantsToClimb()) {
                this.startClimbing();
            }
        }

        if (this.isClimbing) {
            if (this.keyPressAlwaysJump()) {
                this.jumpWhenHanging();
            } else if (this.wantsToLetGoOfClimbing()) {
                this.letGoOfClimbing();
            } else {
                this.handleClimbingInDirections();
            }
        }
    }

    wantsToClimb() {
        return this.keyPressClimbing() && this.isInClimbingFence() && this.climbingPressedTimer <= 0;
    }

    startClimbing() {
        this.isClimbing = true;
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.setAllowGravity(false);
        this.climbingPressedTimer = this.CLIMBING_PRESSED_TIME;
    }

    wantsToLetGoOfClimbing() {
        return this.keyPressClimbing() && this.climbingPressedTimer <= 0;
    }

    letGoOfClimbing() {
        this.climbingPressedTimer = this.CLIMBING_PRESSED_TIME * 2;
        this.isClimbing = false;
        this.body.setAllowGravity(true);
    }

    isHangingToClimb() {
        return this.isClimbing && this.isInClimbingFence();
    }

    jumpWhenHanging() {
        this.climbingPressedTimer = this.CLIMBING_PRESSED_TIME;
        this.body.setAllowGravity(true);
        this.isClimbing = false;
        this.doJump(-550);
    }

    handleClimbingInDirections() {
        var vx = 0;
        var vy = 0;

        if (!((this.keyPressClimbingUp() && this.keyPressClimbingDown())
            || (this.keyPressClimbingLeft() && this.keyPressClimbingRight()))) {
            if (this.keyPressClimbingLeft() && Level.hasClimbingLeftToLeft(this, this.scene)) {
                vx = -this.MAX_CLIMB_XM;
            }

            if (this.keyPressClimbingRight() && Level.hasClimbingLeftToRight(this, this.scene)) {
                vx = this.MAX_CLIMB_XM;
            }

            if (this.keyPressClimbingUp() && Level.hasClimbingLeftToTop(this, this.scene)) {
                vy = -this.MAX_CLIMB_YM;
            }

            if (this.keyPressClimbingDown() && (Level.hasClimbingLeftToBottom(this, this.scene) || Level.hasClimbingLeftToBottomByHangingTop(this, this.scene))) {
                vy = this.MAX_CLIMB_YM;
            }
        }

        this.body.setVelocityX(vx);
        this.body.setVelocityY(vy);
    }

    stopClimbingButKeepHanging() {
        if (this.isClimbing) {
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
        }
    }

    keyPressAlwaysJump() {
        return this.getKeyController().pressed('jumpalways') || this.getKeyController().hold('jumpalways');
    }

    keyPressClimbing() {
        return this.getKeyController().pressed('use') || this.getKeyController().hold('use')
            || this.getKeyController().pressed('grab') || this.getKeyController().hold('grab');
    }

    keyPressClimbingUp() {
        return this.getKeyController().hold('jump');
    }

    keyPressClimbingDown() {
        return this.getKeyController().hold('duck');
    }

    keyPressClimbingLeft() {
        return this.getKeyController().hold('left');
    }

    keyPressClimbingRight() {
        return this.getKeyController().hold('right');
    }

    isInClimbingFence() {
        return Level.isInClimbingFence(this, this.scene);
    }

    handleHorizontalInput() {
        let vx = this.getVelocityX();
        let vy = this.getVelocityY();
        let ax = this.getAccelerationX();
        let ay = this.getAccelerationY();

        let controller = this.getKeyController();

        this.directionSign = 0;

        if (!this.ducked || vy != 0) {
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
        //tot hier: 

        //// limit speed
        //if (vx >= MAX_RUN_XM + BONUS_RUN_XM * ((m_player_status.bonus[get_id()] == AIR_BONUS) ? 1 : 0)) {
        //    ax = std:: min(ax, -OVERSPEED_DECELERATION);
        //} else if (vx <= -MAX_RUN_XM - BONUS_RUN_XM * ((m_player_status.bonus[get_id()] == AIR_BONUS) ? 1 : 0)) {
        //    ax = std:: max(ax, OVERSPEED_DECELERATION);
        //}

        if (vx >= this.MAX_RUN_XM && this.directionSign > 0) {
            vx = this.MAX_RUN_XM;
            ax = 0;
        } else if (vx <= -this.MAX_RUN_XM && this.directionSign < 0) {
            vx = -this.MAX_RUN_XM;
            ax = 0;
        }
        //////


        if (this.directionSign != 0 && Math.abs(vx) < this.WALK_SPEED) {
            vx = this.directionSign * this.WALK_SPEED;
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

        if (this.directionSign == 0)
        {
            this.applyFriction();
        }
    }

    isAtEndSector(sector) {
        return this.x >= sector.sectorWidth - 32;
    }

    stayInStaticsIfNeeded() {
        var tileBelowX = this.body.x;
        var tileBelowY = this.body.bottom;

        if ((!this.scene.isFreeOfMovingStatics(tileBelowX, tileBelowY) ||
            !Level.isFreeOfObjects(tileBelowX, tileBelowY, this.scene))// &&
            /*Level.isInClimbingFence(this, this.scene)*/) {
            this.body.setVelocityY(Math.min(this.body.velocity.y, 0));
            this.body.y -= this.body.bottom % 32;
        }
    }

    fallIfMightAlmostFallOverEdge() {
        var halfX = this.direction == this.DIRECTION_RIGHT ? this.body.width / 2 : -this.body.width / 2;
        var halfY = this.body.height / 2;
        var overEdge = this.body.x % 32;
        var tileBelowX = this.body.x + halfX;
        var tileBelowY = this.body.bottom - 10;

        if (this.forceDrawWalking > 0 && !this.jumping) {
            this.setVelocityX(this.fallingDirection * this.WALK_SPEED);
            this.playAnimation("tux-walk");
        }

        if (this.forceDrawWalking <= 0 && this.falling) {
            if (overEdge > 16 &&
                this.scene.isFreeOfMovingStatics(tileBelowX, tileBelowY + 32) &&
                !this.scene.isFreeOfMovingStatics(tileBelowX - 32, tileBelowY + 32) &&
                Level.isFreeOfObjects(tileBelowX, tileBelowY+32, this.scene) &&
                !Level.isFreeOfObjects(tileBelowX-32, tileBelowY+32, this.scene) &&
                !this.isSkidding() && Math.abs(this.getVelocityX()) <= this.WALK_SPEED) {

                this.forceDrawWalking = 300;
                this.fallingDirection = this.DIRECTION_RIGHT;
                this.setVelocityX(this.WALK_SPEED);
            } else if (overEdge < 16 &&
                this.scene.isFreeOfMovingStatics(tileBelowX, tileBelowY + 32) && 
                !this.scene.isFreeOfMovingStatics(tileBelowX + 32, tileBelowY + 32) &&
                Level.isFreeOfObjects(tileBelowX, tileBelowY + 32, this.scene) &&
                !Level.isFreeOfObjects(tileBelowX+32, tileBelowY+32, this.scene) &&
                !this.isSkidding() && Math.abs(this.getVelocityX()) <= this.WALK_SPEED) {

                this.forceDrawWalking = 300;
                this.fallingDirection = this.DIRECTION_LEFT;
                this.setVelocityX(-this.WALK_SPEED);
            }
        }
    }

    isSkidding() {
        return this.skiddingTimer > 0;
    }

    applyFriction() {
        if (this.onGround() && Math.abs(this.getVelocityX()) < this.WALK_SPEED) {
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
                this.fallingFlagStart = true;
                this.fallingStartTimer = 0;
                this.doJump(Math.abs(vx) > this.MAX_WALK_XM ? -620 : -550);
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

        if (this.ducked && this.isBig) {
            this.drawDuck();
        } else if (this.skiddingTimer > 0) {
            this.drawSkid();
        } else if (this.kickTimer > 0) {
            this.drawKicking();
        } else if (this.isClimbing) {
            if (this.getVelocityX() == 0 && this.getVelocityY() == 0) {
                this.drawClimingHanging();
            } else {
                this.drawClimbing();
            }
        } else if ((!this.onGround() || this.fallMode != this.ON_GROUND) && !this.body.blocked.down) {
            this.drawJumping();
        } else if (Math.abs(this.getVelocityX()) < 1) {
            this.drawStanding();
            this.hasPlayerJump = false;
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

    adjustBodyFalling() {
        if (this.direction == this.DIRECTION_RIGHT) {
            this.adjustBodyFallingRight();
        } else {
            this.adjustBodyFallingLeft();
        }
    }

    adjustBodySkidding() {
        if (this.direction == this.DIRECTION_RIGHT) { //Watch out, when walking right and skidding, skidding is left and vice versa!
            this.adjustBodySkiddingRight();
        } else {
            this.adjustBodySkiddingLeft();
        }
    }

    adjustBodyStandingRight() { //ok
        this.adjustBody(43, 66, 0, 12);
    }

    adjustBodyStandingLeft() { //ok
        this.adjustBody(43, 66, 8, 12);
    }

    adjustBodySkiddingRight() {
        this.adjustBody(38, 70, 11, 0);
    }

    adjustBodySkiddingLeft() {
        this.adjustBody(38, 70, 11, 0);
    }

    adjustBodyFallingRight() { //ok
        this.adjustBody(59, 70, 1, 0);
    }

    adjustBodyFallingLeft() { //ok
        this.adjustBody(60, 70, 0, 0);
    }

    drawFalling() {
        //if (this.forceDrawWalking > 0) { return; }

        this.flipDraw();
        this.setTexture("tux-jump-0");
    }

    drawJumping() {
        //if (this.forceDrawWalking > 0) { return; }

        this.flipDraw();

        if (!this.hasPlayerJump) {
            this.playAnimationOnce("tux-jump");
            this.hasPlayerJump = true;
        } else if (this.fallingStartTimer <= 0) {
            this.playAnimation("tux-fall");
        }
    }

    drawClimingHanging() {
        this.playAnimation("tux-climb-hang");
    }

    drawClimbing() {
        this.playAnimation("tux-climb");
    }

    drawStanding() {
        if (this.forceDrawWalking > 0) { return; }

        this.playAnimation("tux-stand");
        //strange bug rounding float, player sprite trembles!
        this.body.y = Math.ceil(this.body.y);
    }

    removeFalling() {
        this.falling = false;
    }

    drawDuck() {
        if (this.forceDrawWalking > 0) { return; }

        if (!this.hasPlayedDuck) {
            this.playAnimationOnce("tux-duck");
            this.hasPlayedDuck = true;
        }

        //strange bug rounding float, player sprite trembles!
        this.body.y = Math.ceil(this.body.y);
    }

    drawSkid() {
        if (this.forceDrawWalking > 0) { return; }

        this.flipDraw();
        this.setTexture("tux-skid");
        this.adjustBodySkidding();
    }

    drawKicking() {
        if (this.forceDrawWalking > 0) { return; }

        if (!this.hasPlayedKick) {
            this.anims.play("tux-kick", true);
            this.hasPlayedKick = true;
        }
    }

    drawWalking() {
        this.flipDraw();
        this.playAnimation("tux-walk");
    }

    drawRunning() {
        if (this.forceDrawWalking > 0) { return; }

        this.flipDraw();
        this.playAnimation("tux-run");
    }

    drawDying() {
        this.playAnimation("tux-gameover");
    }

    bounce(enemy) {
        this.body.y = enemy.body.y - this.body.height;
        this.body.setVelocityY(-150);
    }

    hurtBy(enemy) {
        if (this.killed || this.wasHurt > 0) {
            return;
        }

        this.setHealth(Math.max(0, this.health - 1));

        if (this.health <= 0) {
            this.die();
        } else {
            this.wasHurt = 4000;
        }   
    }

    setHealth(health) {
        this.health = health;
        GameSession.session.health = health;
        this.scene.setHealthBar(this.health);
    }

    addHealth(health) {
        this.health += health;
        this.health = Math.min(3, this.health);
        this.setHealth(this.health);
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

    kick() {
        this.kickTimer = this.KICK_TIME;
    }
}

class Tony {//sprite.anims.msPerFrame = n;

}

class Tix {

}

class Tax {

}