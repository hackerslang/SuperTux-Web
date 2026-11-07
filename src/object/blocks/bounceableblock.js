import { MovingSprite } from "../moving_object.js";
import { CollisionGroup } from "../../collision/collision_group.js";
import { Rect } from '../../math/rect.js';
import { SHIFT_DELTA } from '../../common/constants.js';
import { HitResponse } from '../../collision/collision_hit.js';
import { Sector } from "../level/sector.js";
import { GAME_GRAVITY } from '../../game.js';

export class BounceableBlock extends MovingSprite {
    constructor(config) {
        super(config, CollisionGroup.COLGROUP_STATIC);
        this.block = config.block;
        this.startY = config.y;
        this.color = config.color;
        this.setDepth(9000);
        this.setOrigin(0.5, 0.5);
        this.isBlock = true;

        this.bouncing = false;
        this.breaking = false;
        this.bounceOffset = 0;
        this.originalY = -1;

        this.BOUNCY_BRICK_MAX_OFFSET = 8;
        this.BOUNCY_BRICK_SPEED = 90;
        this.BUMP_ROTATION_ANGLE = 10;

        this.playerHasHitBeforeTimer = 0;
        this.PLAYER_HIT_BEFORE_TIME = 250;
    }

    setVelocity(x, y) {
        this.body.velocity.x = x;
        this.body.velocity.y = y;
    }

    setVelocityX(x) {
        this.body.velocity.x = x;
    }

    setVelocityY(y) {
        this.body.velocity.y = y;
    }

    update(time, delta) {
        if (this.isScheduledForRemoval) {
            return;
        }

        this.collisionObject.bbox = new Rect({
            left: this.x,
            top: this.y,
            width: this.displayWidth,
            height: this.displayHeight      
        });

        if (!this.bouncing && !this.breaking)
            return;

        this.body.setImmovable(false);
        this.body.setAllowGravity(false);

        if (this.playerHasHitBeforeTimer >= 0) {
            this.playerHasHitBeforeTimer -= delta;
        }
        
        let offset = this.originalY - this.body.y;
        if (offset > this.BOUNCY_BRICK_MAX_OFFSET) {
            this.bounceDirection = this.BOUNCY_BRICK_SPEED;
            this.setVelocity(0, this.bounceDirection * delta);
            
            if (this.breaking) {
                this.breakMe();
            }
        } else if (offset < this.BOUNCY_BRICK_SPEED * delta && this.bounceDirection > 0) {
            this.setVelocity(0, offset);
            this.bounceDirection = 0;
            this.bouncing = false;
            this.body.angle = 0;
            //alert("pazkdazjd");
        } else {
            this.setVelocity(0, this.bounceDirection * delta);
        }
    }

    collides(other, hit) {
        if (other?.parent.isBlock) {
            return false;
        }

        return true;
    }

    collision(other, hit) {
        if (!hit.hasDirection()) {
            return HitResponse.FORCE_MOVE;
        }
        
        let player = other.parent.isPlayer !== undefined && other.parent.isPlayer ? other.parent : null;

        if (player) {
            let inLineWithPlayer = ((player.getVelocityX() > 0 &&
                new Rect(player.getBbox()).getRight() < new Rect(this.getBbox()).left) ||
                (player.getVelocityX() < 0 &&
                    new Rect(player.getBbox()).left > new Rect(this.getBbox()).getRight()));
            
            if (player.isSwimBoosting || ((player.isSliding() || player.isStone()) && inLineWithPlayer)) {
                this.hit(player);
            } else if (!player.isWaterJumping() && !player.isSwimming()) {
                let xCoordinatesIntersect =
                    new Rect(player.getBbox()).getRight() >= new Rect(this.getBbox()).left &&
                    new Rect(player.getBbox()).left <= new Rect(this.getBbox()).getRight();
                
                if (new Rect(player.getBbox()).top > new Rect(this.getBbox()).getBottom() - SHIFT_DELTA &&
                    xCoordinatesIntersect) {
                    this.hit(player);
                }
            }
        }

        // Only interact with other objects if:
        //   1) we are bouncing
        //   2) the object is not portable (either never or not currently)
        //   3) the object is being hit from below (baguys don't get killed for activating boxes).
        let enemy = other.parent.isEnemy ? other.parent : null;
        let portable = other.parent.isPortable ? other.parent : null;
        let isPortable = (portable != null) && portable.isPortable();
        let hitMoFromBelow = new Rect(other.getBbox()).getBottom() < new Rect(this.getBbox()).top + SHIFT_DELTA;
        if (this.bouncing && (!this.isPortable || enemy) && hitMoFromBelow) {

            // Enemies get killed.
            if (enemy) {
                enemy.killFall();
            }

            // Coins get collected.
            let coin = other.parent.isCoin ? other.parent : null;
            if (coin) {
                coin.collect();
            }

            // Eggs get jumped.
            let growup = other.parent.isGrowUp ? other.parent : null;
            if (growup) {
                growup.doJump();
            }
        }

        return HitResponse.FORCE_MOVE;
    }

    hit(player) {

    }

    resetPlayerHitBeforeTimer() {
        this.playerHasHitBeforeTimer = this.PLAYER_HIT_BEFORE_TIME;
    }

    playerHitEvents() {
        // Template method pattern, subclasses can override this method or leave it empty!
    }

    startBounce(hitter) {
        if (this.originalY == -1) {
            this.originalY = this.body.top;
        }

        this.bouncing = true;
        this.bounceDirection = -this.BOUNCY_BRICK_SPEED;
        this.bounceOffset = 0;

        if (!hitter) { return; }

        let centerOfHitter = hitter.getBbox().getMiddle().x;
        let offset = (this.getBbox().getMiddle().x - centerOfHitter) * 2 / this.getBbox().getWidth();

        // Without this, hitting a multi-coin bonus block from the side (e. g. with
        // an ice block or a snail) would turn the block 90 degrees.
        if (offset > 2 || offset < -2) {
            offset = 0;
        }

        this.body.angle = this.BUMP_ROTATION_ANGLE * offset;
    }

    startBreak(hitter) {
        this.startBounce(hitter);
        this.breaking = true;
    }

    breakMe() {
        const gravity = GAME_GRAVITY * 100;
        let pos = new Phaser.Math.Vector2(this.body.x, this.body.y).add(new Phaser.Math.Vector2(16.0, 16.0));

        for (const texture of [ "brick_piece1", "brick_piece2", "brick_piece3", "brick_piece4", "brick_piece5", "brick_piece6" ])
        {
            let velocity = new Phaser.Math.Vector2((Math.random() * 200) - 100, (Math.random() * 700) - 300);
            this.scene.addParticle(this.body.x, this.body.y, texture, velocity, new Phaser.Math.Vector2(0, gravity));
        }

        this.scene.removeBlock(this);
        this.destroy();
    }
}