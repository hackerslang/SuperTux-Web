EnemyState = {
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

class Enemy extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.scene = config.scene; //console.log(this.scene);
        this.level = config.level;
        this.alive = true;
        this.id = config.id;
        this.enemyType = config.key;
        this.powerUps = config.powerUps;

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.allowGravity = true;
        this.hasBeenSeen = false;



        this.setDepth(900);

        this.realY = config.realY;
        this.player = config.player;
        this.DIRECTION_AUTO = -2;
        this.DIRECTION_LEFT = -1;
        this.DIRECTION_RIGHT = 1;

        this.changedDirectionBeforeEdge = false;
        this.turnedAroundLeft = false;
        this.turnedAroundRight = false;

        this.PADDING_ENEMY_COLLISION = 2; /**/
        this.ENEMY_COLLISION_TURN_TIMER = 400; /**/

        //this.enemyLayerCollider = this.scene.physics.add.collider(this, this.level.enemyGroup);
        //this.groundLayerCollider = this.scene.physics.add.collider(this, this.level.groundLayer);

        this.collisionTurnedTimer = 0;
        this.playerCollisionTurnedTimer = 0;
        
        this.waitForTurn = false;
        this.setWaitTurnTimer = 0;
        this.cannotWaitForTurn = false;
        this.cannotWaitForTurnTimer = 0;
        this.sliding = false;
        this.killFalling = false;
        this.killed = false;

        this.state = EnemyState.STATE_INIT;

        

        //this.setCanBeSquished(config);
        //this.setCanSlide(config);

        this.SQUISH_TIME = 2;

        this.setDepth(101);
    }

    //setCanBeSquished(config) {
    //    this.canBeSquished = false;
    //    if (config.canBeSquished != null) {
    //        this.canBeSquished = config.canBeSquished;

    //        if (this.canBeSquished) {
    //            this.squishedSprite = config.squishedSprite;
    //        }
    //    }
    //}

    //setCanSlide(config) {
    //    this.canSlide = false;
    //    if (config.canSlide != null) {
    //        this.canSlide = true;

    //        if (this.canSlide) {
    //            this.slideSpeed = config.slideSpeed;
    //            this.slideSprite = config.slideSprite;
    //        }
    //    }
    //}

    setWaitTurn() {
        if (!this.cannotWaitForTurn) {
            this.setWaitTurnTimer = this.ENEMY_COLLISION_TURN_TIMER * 4;
            this.waitForTurn = true;
        }
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
        if (this.killed) {
            return;
        }

        if (this.scene == null) {
            return;
        }

        if (this.killFalling) {
            return;
        }

        this.scene.physics.world.collide(this, this.level.groundLayer);

        this.scene.physics.world.collide(this, this.level.enemyGroup, this.enemyHit);

        if (!this.player.isDead()) {
            this.scene.physics.world.collide(this, this.player, this.playerHit);
        }

        if (this.stateTimer > 0) {
            this.stateTimer -= delta;
        }

        if (this.frozen && !this.isGrabbed()) {
            //setcolgroup??
            if (this.unfreezeTimer <= 0) {
                this.unfreeze(false);
            }
        }

        if (this.isActiveFlag && this.isOffScreen()) {
            this.deActivate();
            this.setState(EnemyState.STATE_INACTIVE);
        }

        switch (this.state) {
            case EnemyState.STATE_ACTIVE:
                this.isActiveFlag = true;

                //NOG DOEN!!
                if (this.frozen && this.isPortable()) {
                    //this.freezeSpite
                } else {

                }

                this.activeUpdate();
                break;

            case EnemyState.STATE_INIT:
            case EnemyState.STATE_INACTIVE:
                this.isActiveFlag = false;
                this.inActiveUpdate();
                this.tryActivate();
                break;

            case EnemyState.STATE_BURNING:
                this.isActiveFlag = false;
                //to be done ...
                break;

            case EnemyState.STATE_GEAR:
            case EnemyState.STATE_SQUISHED:
                this.isActiveFlag = false;

                if (this.stateTimer <= 0) {
                    this.remove();
                }

                

                break;

            //melting, ground melting to be done ...

            case EnemyState.STATE_FALLING:
                this.isActiveFlag = false;

                break;
        }


        

        this.setWaitTurnTimer -= delta;

        //if (this.collisionTurnedTimer > 0) {
        //    this.collisionTurnedTimer -= delta;
        //}

        //if (this.playerCollisionTurnedTimer > 0) {
        //    this.playerCollisionTurnedTimer -= delta;
        //}

        ////if (this.waitForTurn && this.setWaitTurnTimer <= 0) {
        ////    this.changeDirection();
        ////    this.collisionTurnedTimer = this.ENEMY_COLLISION_TURN_TIMER;
        ////    this.waitForTurn = false;
        ////}

        //if (this.cannotWaitForTurn) {
        //    this.cannotWaitForTurnTimer -= delta;
        //}

        //if (this.cannotWaitForTurnTimer <= 0) {
        //    this.cannotWaitForTurn = false;
        //}
    }

    activeUpdate() {
        if (this.frozen) {
            this.setTexture(this.aims.currentFrame);
        }
    }

    inActiveUpdate() {
        this.setVelocityX(0);
    }

    deActivate() {

    }

    //Must be overridden
    enemyHit(thisEnemy, enemy) {
        
    }

    tryActivate() {
        if (this.player == null || this.player.isDead()) {
            return;
        }

        if (!this.isOffScreen()) {
            this.setState(EnemyState.STATE_ACTIVE);

            if (!this.isInitialized) {
                if (this.startDirection == this.DIRECTION_AUTO) {
                    if (this.player.x < this.x) {
                        this.direction = this.DIRECTION_LEFT;
                    } else {
                        this.direction = this.DIRECTION_RIGHT;
                    }
                }

                this.initialize();
                this.isInitialized = true;
            }
            
            this.activate();
        }

        
    }

    initialize() {

    }

    //must be overridden
    playerHit(enemy, player) {                  //OK, but needs revision!!


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

    collisionSquished(player) {
        if (this.frozen) {
            if (player != null && player.doesButtJump) {
                player.bounce(this);
                this.killFall();

                return true;
            }
        }

        return false;
    }

    killSquished() {                //ALMOST DONE!!!
        if (!this.isActive()) {
            return;
        }

        //playSound

        this.stopMoving();
        this.setState(EnemyState.STATE_SQUISHED);

        if (this.player != null && !this.player.isDead()) {
            this.player.bounce(this);
        }

        this.stateTimer = this.SQUISH_TIME * 1000;
        this.killed = true;
        this.releasePowerUps();
        //do dead stuff killAt = ??
    }

    isActive() {
        return this.isActiveFlag;
    }

    stopMoving() {
        this.setVelocityX(0);
        this.setVelocityY(0);
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
        this.scene.physics.world.collide(this, this.level.groundLayer);
    }

    addAllOtherEnemiesCollisionDetection() {
        var enemies = this.level.getEnemies();

        for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];

            if (this !== enemy) {
                this.scene.physics.world.collide(this, enemy, this.collideEnemy);
            }
        }
    }
    
    collideEnemy(self, other) {
        self.changeDirection();
    }

    enemyCollideTurn() {
        Array.from(this.level.enemyGroup.children.entries).forEach(
            (currentEnemy) => {
                if (this.setWaitTurnTimer <= 0) {
                    if (this.body.x != currentEnemy.body.x || this.body.y != currentEnemy.body.y && !currentEnemy.sliding) {
                        if (this.collisionTurnedTimer <= 0) {
                            if (this.horizontalCollision(currentEnemy, this)) {
                                this.changeDirection();
                                this.collisionTurnedTimer = this.ENEMY_COLLISION_TURN_TIMER;
                                if (this.direction == currentEnemy.direction) {
                                    currentEnemy.setWaitTurn();
                                    this.setCannotWaitTurn();
                                }
                            } else if (this.horizontalCollision(this, currentEnemy)) {
                                this.changeDirection();
                                this.collisionTurnedTimer = this.ENEMY_COLLISION_TURN_TIMER;
                                if (this.direction == currentEnemy.direction) {
                                    currentEnemy.setWaitTurn();
                                    this.setCannotWaitTurn();
                                }
                            }
                        }
                    }
                }
            }
        );
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

    isAtEdgeLeft() {
        var levelTiles = this.level.getLevelData();
        var tileX = Math.floor(this.body.x / 32);
        var tileY = this.realY;

        if (tileX <= 0 || tileY >= levelTiles.length - 1) {
            return false;
        }

        var edgeTile = levelTiles[tileY + 1][tileX - 1];

        return (edgeTile == 0 || this.body.blocked.left /*|| this.body.touching.left*/);
    }

    isAtEdgeRight() {
        var levelTiles = this.level.getLevelData();
        var tileX = Math.floor(this.body.x / 32);
        var tileY = this.realY;
        
        if (tileX >= levelTiles[0].length - 1 || tileY >= levelTiles.length - 1) {
            return false;
        }

        var edgeTile = levelTiles[tileY + 1][tileX + 1];

        return (edgeTile == 0 || this.body.blocked.right /*|| this.body.touching.right*/);
    }

    verticalHit(enemy, player) {
        if (!player.isActiveAndAlive()) {

            return false;
        }

        return player.body.velocity.y >= 0 && (player.body.y + player.body.height) - enemy.body.y < 10;
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

    checkKillAtSquishedOrFall(squishedTexture, fallingTexture, delta) {
        if (this.killAt > 0) {
            this.killed = true;
            this.body.setVelocityX(0);

            if (!this.killFalling) {
                this.anims.play(squishedTexture);
            } else {
                this.setTexture(fallingTexture);
            }

            this.killAt -= delta;
            if (this.killAt <= 0) {
                this.remove();
            }
        }
    }

    killWhenFallenDown() {
        if (this.hasFallenDown()) {
            this.remove();
        }
    }

    hasFallenDown() {
        var levelTiles = this.level.getLevelData();
        var tileY = Math.floor(this.body.y / 32);

        return tileY + 1 >= levelTiles.length;
    }

    remove() {
        this.level.removeEnemy(this);
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

    releasePowerUps() {
        if (this.powerUps == null) { return; }

        var self = this;

        this.powerUps.forEach(function (powerUp, idx) {
            if (self.doesGeneratePowerup(powerUp.chance)) {
                switch (powerUp.name) {
                    case 'egg':
                        self.releaseEgg();
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
        
        this.level.addEgg(this.x + (rndDirection * 40), this.y - 32, rndDirection, 100);
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

        Array.from(this.level.blockGroup.children.entries).forEach(
            (block) => {
                var blockY = Math.floor(block.y / 32);

                if (this.x >= block.x - 20 && this.x <= block.x + 20 && playerY == blockY - 2) {
                    isOnTopOfBlock = true;

                    return;
                }
            }
        );

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

    adjustBody(width, height, offsetX, offsetY) {
        this.body.setSize(width, height);
        this.body.setOffset(offsetX, offsetY);
    }
}