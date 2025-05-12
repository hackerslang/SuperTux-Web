import { Level } from '../object/level/level.js';

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

export class Enemy extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.scene = config.scene;
        this.sector = config.sector;
        this.alive = true;
        this.id = config.id;
        this.enemyType = config.key;
        this.powerUps = config.powerUps;

        this.playerCollides = true;
        this.canClimb = false;

        this.collidesWithOtherEnmies = config.collidesWithOtherEnmies;

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

        this.prevTurnAround = false;

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
        this.sliding = false;
        this.killFalling = false;
        this.killed = false;
        this.removed = false;

        this.state = EnemyState.STATE_INIT;

        this.TURN_AROUND_WAIT_TIMER = 150;
        this.turnAroundWaitTimer = 0;
        this.SQUISH_TIME = 2;
        this.killAt = this.KILL_AT;
        this.squishable = false;
        this.body.pushable = false;
        this.setDepth(101);

        //Collides with moving tiles, such as platforms or industrial tiles??
        this.collidesWithExtraTiles = true;

        this.collidesWithOtherEnmies = true;
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

        if (!this.canClimb) {
            this.scene.physics.world.collide(this, this.scene.climbableTilesGroup);
        } else {
            this.scene.physics.world.overlap(this, this.scene.climbableTilesGroup, this.climbHit);
        }

        this.scene.physics.world.collide(this, this.scene.enemyCollisionGroup, this.enemyHit);
        this.scene.physics.world.collide(this, this.scene.groundLayer);

        if (this.turnAroundWaitTimer > 0) {
            this.turnAroundWaitTimer -= delta;
        }

        if (this.turnAroundWaitTimer <= 0) {
            this.swapTurnAround();
        }

        if (this.scene.enemyGroupCreated) {
            if (this.turnAroundWaitTimer <= 0) {
                this.turnAroundBothEnemiesIfNeeded();

                if (this.currentTurnAround) {
                    this.turnAroundSpeed(this.walkSpeed, this.direction * -1);
                    this.turnAroundWaitTimer = this.TURN_AROUND_WAIT_TIMER;
                    this.currentTurnAround = false;
                }
            }

            this.swapTurnAround();
        }

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

            return false;
        }

        if (this.squishable) {
            this.anims.play(this.squishedAnim);
            this.killSquished(this.squishedAnim);

            return true;
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
        this.scene.physics.world.collide(this, this.sector.groundLayer);
    }

    addAllOtherEnemiesCollisionDetection() {
        var enemies = this.sector.getEnemies();

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

    }

    getClosestFacingEnemy() {
        var minDistance = -1;
        var closestFacingEnemy = null;
        var self = this;
 
        this.scene.creatureObjects.forEach(function (enemy, index) {
            if (enemy != null && !enemy.killed) {
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
        var closestFacingEnemy = this.getClosestFacingEnemy();
        if (closestFacingEnemy == null) {
            return;
        }
        var distanceX = Math.abs(closestFacingEnemy.x - this.x);
        
        if (distanceX <= 32) {
            this.prevTurnAround = true;
            closestFacingEnemy.prevTurnAround = true;
            //this.turnAroundWaitTimer = this.TURN_AROUND_WAIT_TIMER;
            //closestFacingEnemy.turnAroundWaitTimer = this.TURN_AROUND_WAIT_TIMER;
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

    mightFall() {
        return (this.direction == this.DIRECTION_LEFT && this.isAtEdgeLeft()) || (this.direction == this.DIRECTION_RIGHT && this.isAtEdgeRight());
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

        Array.from(this.scene.blockGroup.children.entries).forEach(
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

    adjustBody(width, height, offsetX, offsetY) {
        this.body.setSize(width, height);
        this.body.setOffset(offsetX, offsetY);
    }
}