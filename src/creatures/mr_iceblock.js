import { LedgeBehavior, WalkingEnemy } from './walking_enemy.js';
import { EnemyState } from './enemy.js';
import { HitResponse } from '../collision/collision_hit.js';

export var EnemyIceState = {
    ICESTATE_NORMAL: 0,
    ICESTATE_FLAT: 1,
    ICESTATE_GRABBED: 2,
    ICESTATE_KICKED: 3,
    ICESTATE_WAKING: 4
};

export var MrIceBlockType = {
    TYPE_NORMAL: "normal",
    TYPE_LAPTOP: "laptop"
}

export class MrIceBlock extends WalkingEnemy {
    constructor(config) {
        config.walkSpeed = 80;

        super(config);

        this.walkAnimation = "mriceblock-walk";
        this.iceState = EnemyIceState.ICESTATE_NORMAL;
        this.WALK_SPEED = 80;
        this.KICK_SPEED = 500;
        this.body.setSize(32, 32, true);
        this.body.setOffset(7, 6);
        this.setOrigin(0.5, 0.5);
        this.width = 100;

        this.type = config.type || MrIceBlockType.TYPE_NORMAL;

        this.direction = 0;
        this.firstActivated = false;

        this.noKickTimer = 0;
        this.flatTimer = 0;
        this.squishCount = 0;

        this.objectName = "MrIceBlock";

        this.canMelt = true;

        this.initialize();
    }

    create() {
        this.createWalkAnimation();
    }

    initialize() {
        super.initialize();
        this.setIceState(EnemyIceState.ICESTATE_NORMAL);
    }

    update(time, delta) {
        super.update(time, delta);
    }

    isFreezable() {
        return this.type == MrIceBlockType.TYPE_LAPTOP;
    }

    freeze() {
        super.freeze();

        if (this.iceState == EnemyIceState.ICESTATE_KICKED) {
            this.setIceState(EnemyIceState.ICESTATE_FLAT);
        }
    }

    unfreeze(melt) {
        super.unfreeze(melt);

        if (this.iceState == EnemyIceState.ICESTATE_FLAT) {
            this.setIceState(EnemyIceState.ICESTATE_WAKING);
        }
    }

    activeUpdate(time, delta) {
        if (this.frozen) {
            if (this.iceState == EnemyIceState.ICESTATE_FLAT) {
                const velocityX = this.getVelocityX();

                // Gradually slow down, when frozen in FLAT state, if any horizontal velocity is present.
                if ((this.direction == this.DIRECTION_LEFT && velocityX < 0) || (this.direction == this.DIRECTION_RIGHT && velocityX > 0))
                this.setVelocityX(velocityX * 0.95);
            } else {
                this.setVelocityX(0);
            }

            super.activeUpdate(time, delta);

            return;
        }

        if(this.iceState == EnemyIceState.ICESTATE_GRABBED || this.isGrabbed()) {
            return;
        }

        if (this.iceState == EnemyIceState.ICESTATE_FLAT && this.flatTimer <= 0) {
            this.setIceState(EnemyIceState.ICESTATE_WAKING);
        }

        if (this.iceState == EnemyIceState.ICESTATE_WAKING && this.anims.isAnimationDone()) {
            this.setIceState(EnemyIceState.ICESTATE_NORMAL);
        }

        if (this.iceState == EnemyIceState.ICESTATE_NORMAL) {
            super.activeUpdate(time, delta);
            return;
        }

        super.EnemyActiveUpdate(time, delta);
    }

    canBreak() {
        return this.iceState == EnemyIceState.ICESTATE_KICKED || this.iceState == EnemyIceState.ICESTATE_FLAT;
    }

    collisionSolid(hit) {
        this.updateOnGroundFlag(hit);

        if (hit.top || hit.bottom) { // Floor or roof.
            this.setVelocityY(0);
        }

        // Hit left or right.
        switch (this.iceState) {
            case EnemyIceState.ICESTATE_NORMAL:
                super.collisionSolid(hit);
                break;
            case EnemyIceState.ICESTATE_KICKED: {
                if (hit.left || hit.right) {
                    if ((hit.right && this.direction == this.DIRECTION_RIGHT) || (hit.left && this.direction == this.DIRECTION_LEFT)) {
                        this.direction = (this.direction == this.DIRECTION_LEFT) ? this.DIRECTION_RIGHT : this.DIRECTION_LEFT;
                    }
                    this.scene.sound.play("iceblock-bump");
                    this.setVelocityX(-this.getVelocityX() * 0.975);
                }
                //flipx
                this.anims.play("mriceblock-stomped");
                if (Math.abs(this.getVelocityX()) < this.WALK_SPEED * 1.5) {
                    this.setIceState(EnemyIceState.ICESTATE_NORMAL);
                }
                break;
            }
            case EnemyIceState.ICESTATE_FLAT:
                if (this.frozen) {
                    if ((hit.right && this.direction == this.DIRECTION_RIGHT) || (hit.left && this.direction == this.DIRECTION_LEFT))
                    {
                        this.direction = (this.direction == this.DIRECTION_LEFT) ? this.DIRECTION_RIGHT : this.DIRECTION_LEFT;
                        this.inverseVelocityX();
                    }
                    break;
                }
            case EnemyIceState.ICESTATE_WAKING:
                this.setVelocityX(0);
                break;
            case EnemyIceState.ICESTATE_GRABBED:
                break;
        }
    }

    collision(other, hit) {
        if (this.frozen) {
            var bullet = other.parent.isBullet ? other.parent : undefined;
            if (bullet !== undefined) {
                return super.collisionBullet(other, hit);
            }

            return HitResponse.FORCE_MOVE;
        }

        if (this.iceState == EnemyIceState.ICESTATE_GRABBED) {
            return HitResponse.FORCE_MOVE;
        }

        return super.collision(other, hit);
    }

    collisionPlayer(player, hit) {
        // Handle kicks from left or right side.
        if ((this.iceState == EnemyIceState.ICESTATE_WAKING || this.iceState == EnemyIceState.ICESTATE_FLAT) && this.getState() == EnemyState.STATE_ACTIVE) {
            if (hit.left) {
                this.direction = this.DIRECTION_RIGHT;
                player.kick();
                this.setIceState(EnemyIceState.ICESTATE_KICKED);
                return HitResponse.FORCE_MOVE;
            }
            else if (hit.right) {
                this.direction = this.DIRECTION_LEFT;
                player.kick();
                this.setIceState(EnemyIceState.ICESTATE_KICKED);
                return HitResponse.FORCE_MOVE;
            }
        }

        return super.collisionPlayer(player, hit);
    }

    collisionEnemy(enemy, hit) {
        switch (this.iceState) {
            case EnemyIceState.ICESTATE_NORMAL:
                return super.collisionEnemy(enemy, hit);
            case EnemyIceState.ICESTATE_FLAT:
            case EnemyIceState.ICESTATE_WAKING:
                return HitResponse.FORCE_MOVE;
            case EnemyIceState.ICESTATE_KICKED:
                enemy.killFall();
                return HitResponse.FORCE_MOVE;
            default:
                break;
        }

        return HitResponse.ABORT_MOVE;
    }

    collisionSquished(object) {
        var player = object.isPlayer ? object : undefined;
        if (player && (player.doesButtjump || player.isInvincible())) {
            player.bounce(this);
            this.killFall();
            return true;
        }

        switch (this.iceState) {
            case EnemyIceState.ICESTATE_KICKED:
                {
                    var enemy = object.isEnemy ? object : undefined;
                    if (enemy) {
                        enemy.killFall();
                        break;
                    }
                }
            case EnemyIceState.ICESTATE_NORMAL:
                {
                    squishcount++;
                    if (squishcount >= MAXSQUISHES) {
                        this.killFall();
                        return true;
                    }
                }

                this.scene.sound.play("stomp");
                this.setVelocity(0, 0);
                this.setIceState(EnemyIceState.ICESTATE_FLAT);
                this.nokickTimer = this.NOKICK_TIME;
                break;

            case EnemyIceState.ICESTATE_FLAT:
            case EnemyIceState.ICESTATE_WAKING:
                {
                    if (object.body.x < this.body.x) {
                        this.direction = this.DIRECTION_RIGHT;
                    }
                    else {
                        this.direction = this.DIRECTION_LEFT;
                    }
                }
                if (this.nokickTimer <= 0) this.setIceState(EnemyIceState.ICESTATE_KICKED);
                break;

            case EnemyIceState.ICESTATE_GRABBED:
                assert(false);
                break;
        }

        if (player) player.bounce(this);

        return true;
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
                this.anims.play("mriceblock-stomped");
                this.flipX = (this.direction == this.DIRECTION_RIGHT);
                this.flatTimer = 4 * 1000;

                break;
            case EnemyIceState.ICESTATE_KICKED:
                this.scene.sound.play("kick");
                this.setVelocityX(this.direction == this.DIRECTION_RIGHT ? this.KICK_SPEED : -this.KICK_SPEED);
                this.flipX = (this.direction == this.DIRECTION_RIGHT);
                this.anims.play("mriceblock-stomped");

                //bbox

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

    grab(object, pos, direction) {
        if (this.frozen) {
            super.grab(object, pos, direction);
            return;
        }

        //portable.grab(object, pos, direction);
        //m_col.set_movement(pos - get_pos());
        this.setVelocity(this.body.getVelocityX() * LOGICAL_FPS, this.body.getVelocityY() * LOGICAL_FPS);
        this.direction = direction;
        this.anims.play("mriceblock-stomped");
        this.setIceState(EnemyIceState.ICESTATE_GRABBED);
        this.setColGroupActive(COLGROUP_DISABLED);
    }

    ungrab(object, direction) {
        if (this.frozen) {
            super.ungrab(object, direction);
            return;
        }

        var player = object.isPlayer ? object : undefined;
        if (player && (player.isSwimming() || player.isWaterJumping())) {
            // Move the ice cube slightly away to avoid instantly killing Tux.
            var swimangle = player.getSwimmingAngle();
            this.col.bbox.move(new Vector(Math.cos(swimangle) * 48, Math.sin(swimangle) * 48));
        }

        if (this.direction == this.DIRECTION_UP) {
            this.setVelocityY(-KICKSPEED);
            if (Math.abs(player.getPhysic().getVelocityX()) < 1.0) {
                this.setIceState(EnemyIceState.ICESTATE_FLAT);
            } else {
                this.direction = (this.getVelocityX() > 0) ? this.DIRECTION_RIGHT : this.DIRECTION_LEFT;
                this.setIceState(EnemyIceState.ICESTATE_KICKED);
            }
        } else if (this.direction == this.DIRECTION_DOWN) {
            var mov = new Vector(0, 32);
            if (this.scene.isFreeOfStatics(this.getBBox().moved(mov), this)) {
                // There is free space, so throw it down.
                this.scene.sound.play("kick");
                this.setVelocityY(KICKSPEED);
            }

            this.setIceState(EnemyIceState.ICESTATE_FLAT);
        } else {
            this.direction = direction;
            this.setIceState(EnemyIceState.ICESTATE_KICKED);
        }

        this.setColGroupActive(COLGROUP_MOVING);
        portable.ungrab(object, direction);
    }

    isPortable() {
        return (this.frozen || this.iceState == EnemyIceState.ICESTATE_FLAT);
    }

    ignite() {
        this.setIceState(EnemyIceState.ICESTATE_NORMAL);
        super.ignite();
    }

    initialize() {
        super.initialize(); //WalkingEnemy.initialize();
        this.setLedgeBehavior(LedgeBehavior.NORMAL);
        this.setIceState(EnemyIceState.ICESTATE_NORMAL);
    }

    update(time, delta) {
        if (this.noKickTimer > 0) {
            this.noKickTimer -= delta;
        }

        if (this.flatTimer > 0) {
            this.flatTimer -= delta;
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
            this.setIceState(EnemyIceState.ICESTATE_NORMAL);
        }

        if (this.iceState == EnemyIceState.ICESTATE_NORMAL) {
            super.activeUpdate(time, delta);
        }

        return super.EnemyActiveUpdate(time, delta);
    }

    isPortable() {
        return this.frozen || this.iceState == EnemyIceState.ICESTATE_FLAT;
    }

    canBreak() {
        return this.iceState == EnemyIceState.ICESTATE_KICKED || this.iceState == EnemyIceState.ICESTATE_FLAT;
    }

    playerHit(enemy, player) {
        if ((enemy.iceState == EnemyIceState.ICESTATE_WAKING || enemy.iceState == EnemyIceState.ICESTATE_FLAT) && enemy.state == EnemyState.STATE_ACTIVE) {
            if (!enemy.verticalHit(enemy, player)) {
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

    enemyHit(thisEnemy, enemy) {
        switch (thisEnemy.iceState) {
            case EnemyIceState.ICESTATE_NORMAL:
                //WalkingBadguy::collision_badguy(badguy, hit);
                break;
            case EnemyIceState.ICESTATE_FLAT:
            case EnemyIceState.ICESTATE_WAKING:
                return;
            case EnemyIceState.ICESTATE_KICKED:
                enemy.killfall();
                return;
            default:
                return;
        }
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
                    this.setIceState(EnemyIceState.ICESTATE_KICKED);
                }

                break;

            default:
                break;
        }

        if (player != null) {
            player.bounce(this);
        }

        return true;
    }
}