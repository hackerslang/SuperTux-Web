import { Enemy } from './enemy.js';

export class Fish extends Enemy {
    constructor(config) {
        super(config);

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.setSize(37, 46);
        this.body.setOffset(2, 1);
        this.killAt = 0;
        this.direction = 0;
        this.startY = this.body.y;
        this.firstActivated = true;
        this.body.allowGravity = true;
        this.scene.add.existing(this);
        this.animDown = config.down;
        this.animUp = config.up;
        this.flip = config.flip;
        this.anims.play(this.animUp);
        this.jumping = true;
        this.setDepth(110);

        //Collides with moving tiles, such as platforms or industrial tiles??
        this.collidesWithExtraTiles = false;

        this.collidesWithOtherEnemies = false;
    }

    update(time, delta) {
        if (!this.player.isDead()) {
            this.scene.physics.world.overlap(this, this.player, this.playerHit);
        }

        this.body.velocity.x = 0;

        if (this.body.y >= this.startY) {
            this.body.velocity.y = -700;
        }

        if (this.body.velocity.y > 0) {
            this.jumping = false;
            if (this.flip) {
                this.flipY = true;
            }
            this.anims.play(this.animDown, true);
        } else if (!this.jumping) {
            this.anims.play(this.animUp, true);
            this.jumping = true;
            if (this.flip) {
                this.flipY = false;
            }
        }
    }

    playerHit(enemy, player) {
        if (!player.invincible) {
            enemy.hurtPlayer(enemy, player);
        }
    }
}