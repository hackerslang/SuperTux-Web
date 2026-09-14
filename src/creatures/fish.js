import { Enemy } from './enemy.js';
import { MovingSprite } from '../object/moving_object.js';
import { CollisionGroup } from '../collision/collision_group.js';

export class LavaFishJumping extends Enemy {
    constructor(config) {
        super(config);

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
        this.player = config.player;
        this.setDepth(110);
        this.isActiveFlag = true;
    }

    update(time, delta) {
        super.update(time, delta);

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

    collides(otherObject, hit) {
        return true;
    }

    collisionSolid(hit) {

    }

    collision(other, hit) {
        var player = !other.parent.isEnemy && !other.parent. isCollectible ? other.parent : undefined;

        if (player !== undefined && (hit.left || hit.right || hit.top || hit.bottom)) {
            player.kill(false);
        }
    }
}