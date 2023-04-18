EnemyIceState = {
    ICESTATE_NORMAL: 0,
    ICESTATE_FLAT: 1,
    ICESTATE_GRABBED: 2,
    ICESTATE_KICKED: 3,
    ICESTATE_WAKING: 4
};

class MrIceBlock extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 80;

        //config.canSlide = true;
        //config.slideSpeed = 300;
        //config.slideSprite = 'mriceblock-stomped';
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        //this.killAt = 0;
        //this.direction = 0;
        this.walkAnimation = "mriceblock-walk";
        this.iceState = EnemyIceState.ICESTATE_NORMAL;
        this.WALK_SPEED = 80;
        this.KICK_SPEED = 500;
        //this.firstActivated = false;
        //this.changedDirectionBeforeEdge = false;
        //this.turnedAroundLeft = false;
        //this.turnedAroundRight = false;
        //this.stomped = false;
        //this.sliding = false;
        this.body.setSize(32, 32, true);
        this.body.setOffset(7, 6);
        this.setOrigin(0.5, 0.5);
        this.width = 100;

        this.direction = 0;
        this.firstActivated = false;

        this.noKickTimer = 0;
        this.flatTimer = 0;
        this.squishCount = 0;
    }

        create() {
            this.createWalkAnimation();
    }

    setIceState(iceState) {
        if (this.iceState == iceState) {
            return;
        }

        switch (iceState) {
            case EnemyIceState.ICESTATE_NORMAL:
                super.initialize();

                break;
            case EnemyIceState.ICESTATE_FLAT:
                this.anims.play("flat");
                this.flipX = (this.direction == this.DIRECTION_RIGHT);
                this.flatTimer = 4 * 1000;

                break;

            case EnemyIceState.ICESTATE_KICKED:
                this.setVelocityX(this.direction == this.DIRECTION_RIGHT ? this.KICK_SPEED : -this.KICK_SPEED);
                this.flipX = (this.direction == this.DIRECTION_RIGHT);
                //set coll size
                break;

            case EnemyIceState.ICESTATE_GRABBED:
                this.flatTimer = 0;

                break;

            case EnemyIceState.ICESTATE_WAKING:
                this.anims.play("waking");
                this.flipX = (this.direction == this.DIRECTION_RIGHT);

                break;
            default:
                break;
        }

        this.iceState = iceState;
    }

    initialize() {
        super.initialize(); //WalkingEnemy.initialize();
        this.setIceState(EnemyIceState.ICESTATE_NORMAL);
    }

    update(time, delta) {
        if (this.noKickTimer > 0) {
            this.noKickTimer -= delta;
        }

        super.update(time, delta);
    }

    activeUpdate(time, delta) {
        if (this.iceState == EnemyIceState.ICESTATE_GRABBED || this.isGrabbed()) {
            return;
        }

        if (this.iceState == EnemyIceState.ICESTATE_FLAT && this.flatTimer <= 0) {
            this.setIceState(EnemyIceState.ICESTATE_WAKING);
        }

        if (this.iceState == EnemyIceState.ICESTATE_WAKING /* && this.animationDone */) {
            this.seticeState(EnemyIceState.ICESTATE_NORMAL);
        }

        if (this.iceState == EnemyIceState.ICESTATE_NORMAL) {
            super.activeUpdate(time, delta);
        }

        return super.EnemyActiveUpdate(time, delta);
    }

    grab(player, direction) {

    }

    isPortable() {
        return this.frozen || this.iceState == EnemyIceState.ICESTATE_FLAT;
    }

    canBreak() {
        return this.iceState == EnemyIceState.ICESTATE_KICKED;
    }

    playerHit(enemy, player) {
        if ((this.iceState == EnemyIceState.ICESTATE_WAKING || this.iceState == EnemyIceState.ICESTATE_FLAT) && this.state == EnemyState.STATE_ACTIVE) {
            if (!enemy.verticalHit(player)) {
                if (player.x < enemy.x) {
                    enemy.direction = enemy.DIRECTION_RIGHT;
                    enemy.kick(enemy, player);

                    return;
                } else if (player.x > enemy.x) {
                    enemy.direction = enemy.DIRECTION_LEFT;
                    enemy.kick(enemy, player);

                    return;
                }
            }
        }

        return super.EnemyPlayerHit(enemy, player);
    }

    kick(enemy, player) {
        player.kick();
        enemy.setIceState(EnemyIceState.ICESTATE_KICKED);
    }

    enemyHit(enemy, otherEnemy) {
        switch (this.iceState) {
            case EnemyIceState.ICESTATE_NORMAL:
                return super.enemyHit(enemy, otherEnemy);
            case EnemyIceState.ICESTATE_FLAT:
            case EnemyIceState.ICESTATE_WAKING:
                return;
            case EnemyIceState.ICESTATE_KICKED:
                otherEnemy.killFall();

                return;
            default:

                return;
        }

        return;
    }

    collisionSquished(player) {
        if (player != null && (player.doesButtJump || player.isInvincible)) {
            player.bounce(this);
            this.killFall();

            return true;
        }

        switch (this.iceState) {
            case EnemyIceState.ICESTATE_KICKED:
            case EnemyIceState.ICESTATE_NORMAL:
                this.squishCount++;
                if (this.squishCount >= this.MAXSQUISHES) {
                    this.killFall();

                    return true;
                }

                this.setVelocityX(0);
                this.setVelocityY(0);
                this.setIceState(EnemyIceState.ICESTATE_FLAT);
                this.noKickTimer = this.NO_KICK_TIME;
                break;

            case EnemyIceState.ICESTATE_FLAT:
            case EnemyIceState.ICESTATE_WAKING:
                if (player.x < this.x) {
                    this.direction = this.DIRECTION_RIGHT;
                } else {
                    this.direction = this.DIRECTION_LEFT;
                }

                if (this.noKickTimer <= 0) {
                    this.setState(EnemyIceState.ICESTATE_KICKED);
                }

                break;

            default:
                break;
        }

        if (player != null) {
            player.bounce(this);
        }
    }

    //update(time, delta) {
    //    super.update(time, delta);
    //}

    //update(time, delta) {
    //    super.update(time, delta);
    //    if (this.sliding) {
    //        this.enemyCollideSliding();
    //        this.playerCollideSliding();
    //    } else {
    //        super.enemyCollideTurn();
    //        super.playerCollideTurn();
    //    }

    //    //if (!this.player.isDead()) {
    //    //    this.scene.physics.world.collide(this, this.player, this.playerHit);
    //    //}

    //    //this.scene.physics.world.collide(this, this.level.groundLayer);

    //    //if (!this.activated()) {
    //    //    return;
    //    //}

    //    //if (!this.firstActivated) {
    //    //    this.activateStartMoving();
    //    //}



    //    if (!this.sliding) {
    //        super.walkAndTurnOnEdge();
    //    } else {
    //        if (this.body.blocked.left) {
    //            this.body.velocity.x = 300;
    //        } else if (this.body.blocked.right) {
    //            this.body.velocity.x = -300;
    //        }
    //    }
    //}

    enemyCollideSliding() {
        Array.from(this.level.enemyGroup.children.entries).forEach(
            (currentEnemy) => {
                if (this.body.x != currentEnemy.body.x || this.body.y != currentEnemy.body.y) {
                    if (this.horizontalCollision(currentEnemy, this)) {
                        currentEnemy.slideKill();
                        this.slideChangeDirection();
                    } else if (this.horizontalCollision(this, currentEnemy)) {
                        currentEnemy.slideKill();
                        this.slideChangeDirection();
                    }
                }
            }
        );
    }

    playerCollideSliding() {

    }

    slideChangeDirection() {
        if (this.direction == this.DIRECTION_LEFT) {
            this.slideRight();
        } else {
            this.slideLeft();
        }
    }

    slideRight() {
        this.turnAroundSpeed(300, this.DIRECTION_RIGHT);

    }

    slideLeft() {
        this.turnAroundSpeed(300, this.DIRECTION_LEFT);
    }

    activateStartMoving() {
        this.firstActivated = true;

        this.direction = this.DIRECTION_LEFT;
        this.body.velocity.x = this.direction * 100;
    }

    playAnimation(key) {
        this.anims.play(key, true);
    }

    //playerHit(enemy, player) {
    //    if (enemy.sliding && !enemy.verticalHit(enemy, player) && !player.invincible) {
    //        enemy.hurtPlayer(enemy, player);
    //        enemy.slide(player);
    //    } else if (enemy.stomped) {
    //        enemy.slide(player);
    //    } else if (enemy.verticalHit(enemy, player)) {
    //        player.bounce(enemy);
    //        enemy.makeStomped();
    //    } else if (player.invincible) {
    //        enemy.makeStomped();
    //    } else {
    //        enemy.hurtPlayer(enemy, player);
    //    }
    //}

    enemyHit(thisEnemy, enemy) {
        if (thisEnemy.sliding) {
            enemy.slideKill();
        } else {
            enemy.walkAndTurnCollideEnemy(thisEnemy);
            thisEnemy.walkAndTurnCollideEnemy(enemy);
        }
    }

    makeStomped() {
        this.anims.play("mriceblock-stomped");
        this.body.setVelocityX(0);
        this.body.acceleration.x = 0;

        this.stomped = true;
        this.sliding = false;
    }

    //slide(player) {
    //    this.direction = (player.body.x < this.body.x ? this.DIRECTION_RIGHT : this.DIRECTION_LEFT);
    //    this.body.velocity.x = this.direction * 300;
    //    this.sliding = true;
    //}

    

    //slideKillOther(thisEnemy, other) {
    //    other.slideKill();
    //}
}