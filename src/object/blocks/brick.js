import { BonusBlock } from "./bonusblock.js";
import { BounceableBlock } from "./bounceableblock.js";

export class Brick extends BounceableBlock {
    constructor(config) {
        super(config);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id;
        this.setTexture(config.brickSprite);
        this.breakable = false;
        this.coinsWorth = 0;
        this.startY = config.y;
        this.done = false;
        this.body.setBounce(0);
        this.setOrigin(0, 0);
        this.body.setImmovable(false);
        this.brickPieces = [];
        this.brickPiecesDestroyAt = 180;

        this.coinCounter = 0;
        if (config.data == 1) {
            this.coinCounter = 5;
        } else {
            this.breakable = true;
        }
        this.isEmpty = false;
        this.coinsWorth = this.coinCounter;
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.brickPiecesDestroyAt <= 0) {
            for (var i = 0; i < this.brickPieces.length; i++) {
                var brickPiece = this.brickPieces[i];

                brickPiece.destroy();
            }
        } else {
            this.brickPiecesDestroyAt -= delta;

            for (var i = 0; i < this.brickPieces.length; i++) {
                var brickPiece = this.brickPieces[i];

                brickPiece.alpha -= 0.05;
            }
        }
    }

    collision(other, hit) {
        if (hit.hasDirection()) {
            let player = other.parent.isPlayer ? other.parent : null;
            if (player && player.doesButtjump) {
                this.tryBreak(player);
            }

            let enemy = other.parent.isEnemy ? other.parent : null;
            if (enemy) {
                // Hit contains no information for collisions with blocks.
                // Enemy's bottom has to be below the top of the brick
                // SHIFT_DELTA is required to slide over one tile gaps.
                if (enemy.canBreak() && (enemy.getBBox().getBottom() > this.getBBox().getTop() + SHIFT_DELTA)) {
                    tryBreak(null);
                }
            }
            let portable = other.parent.isPortable ? other.parent : null;
            if (portable && !enemy) {
                if (other.getBBox().getTop() > this.getBBox().getBottom() - SHIFT_DELTA) {
                    tryBreak(null);
                }
            }

            let explosion = other.parent.isExplosion ? other.parent : null;
            if (explosion && explosion.hurts()) {
                tryBreak(null);
            }

            let crusher = other.parent.isCrusher ? other.parent : null;
            if (crusher && crusher.getState() == Crusher.CRUSHING && this.coinCounter == 0)
            tryBreak(null);
        }

        return super.collision(other, hit);
    }

    collides(other, hit) {
        if (other?.parent instanceof BonusBlock || other?.parent instanceof Brick) {
            return false;
        }
        return true;
    }

    bounceComplete() {
        if (this.done) { return; }
        var brickX = brick.x;
        var brickY = brick.y;
        brick.done = true;

        ['brick-piece1', 'brick-piece2', 'brick-piece3', 'brick-piece4', 'brick-piece5', 'brick-piece6'].forEach(texture => {
            var velocityX = Math.floor((Math.random() * 201) - 100);
            var velocityY = Math.floor((Math.random() * 701) - 300);

            var particle = this.scene.addParticle(this.x, this.y, texture);
        });

        this.level.removeBlock(brick);
        this.destroy();
    }

    hit(player) {
        if (this.isEmpty) { return; }

        this.tryBreak(player);
    }

    tryBreak(player, slider) {
        if (this.isEmpty) return;

        if (super.playerHasHitBeforeTimer > 0) {
            return;
        }
        super.resetPlayerHitBeforeTimer();

        // Takes too long for sliding tux to barrel through crates and ends up stopping him otherwise.
        if (slider && this.breakable && this.coinCounter <= 0)
            this.breakMe();

        this.scene.sound.play("brick");

        if (this.coinCounter > 0) {
            this.scene.addBouncyCoin(this.body.x, this.body.y, true);
            this.coinCounter--;
            
            this.scene.addCollectedCoin(1);

            if (this.coinCounter == 0) {

                this.isEmpty = true;
            }
            this.startBounce(player);
        } else if (this.breakable) {
            if (player) {
                if (player.isBig()) {
                    this.startBreak(player);
                } else {
                    this.startBounce(player);
                }
                return;
            }
            this.breakMe();
        }
    }
}

export class HeavyBrick extends Brick {
    constructor(config) {
        super(config);
    }

    collision(other, hit) {
        let player = other.parent.isPlayer ? other.parent : null;
        if (player && player.doesButtjump) ricochet(other);

        // let crusher = other.parent.isCrusher ? other.parent : null;
        // if (crusher && crusher.getState() == Crusher.CRUSHING)
        // {
        //     if (crusher.isBig())
        //         tryBreak(null);
        //     else
        //         ricochet(other);
        // }

        let badguy = other.parent.isBadGuy ? other.parent : null;
        if (badguy && badguy.canBreak() && (badguy.getBBox().getBottom() > this.getBBox().getTop() + SHIFT_DELTA))
            ricochet(other);

        let portable = other.parent.isPortable ? other.parent : null;
        if (portable) {
            if (other.getBBox().top > this.getBBox().getBottom() - SHIFT_DELTA)
                ricochet(other);
        }

        // Skip Brick::collision
        // TODO: Make the Brick class an absract class and have the normal brick and
        //       heavy brick both inherit that class?
        return super.collision(other, hit);
    }

    ricochet(collider) {
        SoundManager.current().play("metalHit", this.get_pos());
        this.startBounce(collider);
    }

    hit(player) {
        this.ricochet(player);
    }
}