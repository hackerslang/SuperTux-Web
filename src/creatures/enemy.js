class Enemy extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.level = config.level;
        this.alive = true;
        this.id = config.id
        this.enemyType = config.key;

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.allowGravity = true;
        this.hasBeenSeen = false;

        this.realY = config.realY;
        this.player = config.player;
        this.DIRECTION_LEFT = -1;
        this.DIRECTION_RIGHT = 1;

        this.changedDirectionBeforeEdge = false;
        this.turnedAroundLeft = false;
        this.turnedAroundRight = false;

        this.PADDING_ENEMY_COLLISION = 2;
        this.ENEMY_COLLISION_TURN_TIMER = 400;

        this.enemyLayerCollider = this.scene.physics.add.collider(this, this.level.enemyGroup);
        this.groundLayerCollider = this.scene.physics.add.collider(this, this.level.groundLayer);

        this.collisionTurnedTimer = 0;
        this.playerCollisionTurnedTimer = 0;
        
        this.waitForTurn = false;
        this.setWaitTurnTimer = 0;
        this.cannotWaitForTurn = false;
        this.cannotWaitForTurnTimer = 0;
        this.sliding = false;
        this.killFalling = false;
        this.killed = false;

        this.setDepth(101);
    }

    setWaitTurn() {
        if (!this.cannotWaitForTurn) {
            this.setWaitTurnTimer = this.ENEMY_COLLISION_TURN_TIMER * 4;
            this.waitForTurn = true;
        }
    }

    activated() {
        if (!this.hasBeenSeen) {
            if (this.x < this.scene.cameras.main.scrollX + this.scene.sys.game.canvas.width + 32) {
                this.hasBeenSeen = true;
                this.body.velocity.x = this.direction;
                
                return true;
            }
            
            return false;
        }
        
        return true;
    }

    update(time, delta) {
        this.setWaitTurnTimer -= delta;

        if (this.collisionTurnedTimer > 0) {
            this.collisionTurnedTimer -= delta;
        }

        if (this.playerCollisionTurnedTimer > 0) {
            this.playerCollisionTurnedTimer -= delta;
        }

        if (this.waitForTurn && this.setWaitTurnTimer <= 0) {
            this.changeDirection();
            this.collisionTurnedTimer = this.ENEMY_COLLISION_TURN_TIMER;
            this.waitForTurn = false;
        }

        if (this.cannotWaitForTurn) {
            this.cannotWaitForTurnTimer -= delta;
        }

        if (this.cannotWaitForTurnTimer <= 0) {
            this.cannotWaitForTurn = false;
        }
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
                this.kill();
            }
        }
    }

    kill() {
        this.level.removeEnemy(this);
        this.destroy();
    }

    killNoFlat(texture) {
        this.setTexture(texture);
        this.body.setVelocityX(0);
        this.body.setVelocityY(-200);
        this.killAt = 1500;
        this.killFalling = true;
        this.groundLayerCollider.destroy();
    }

    getFlat(texture) {
        this.setTexture(texture);
        this.body.height = 13;
        this.body.setVelocityX(0);
        this.body.acceleration.x = 0;
        this.killAt = 500;
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

    turnAroundSpeed(speed, direction) {
        this.direction = direction;
        this.body.velocity.x = this.direction * speed;
        this.flipX = !this.flipX;
        this.turnedAroundLeft = (direction != this.DIRECTION_RIGHT);
        this.turnedAroundRight = (direction == this.DIRECTION_RIGHT);
    }

    turnRight() {
        this.turnAroundSpeed(100, this.DIRECTION_RIGHT);
    }

    turnLeft() {
        this.turnAroundSpeed(100, this.DIRECTION_LEFT);
    }

    enemyOut() {

    }

    slideKill() {

    }
}