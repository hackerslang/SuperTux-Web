import { MovingSprite } from "../moving_object";
import { CollisionGroup } from "../../collision/collision_group.js";
import { PowerUp } from "./powerup.js";

class StarPowerUp extends PowerUp {
    constructor(config) {
        super(config, CollisionGroup.COLGROUP_MOVING);

        this.body.setAllowGravity(true);
        this.player = config.player;
        this.sector = config.sector;
        this.scene = config.scene;
        this.id = this.scene.getPowerUpId();
        this.anims.play('star-moving');
        this.startY = config.y;
        this.isEmpty = false;
        this.done = false;
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.direction = config.direction;
        this.body.velocity.x = this.direction * 70;
        this.objectName = "PowerupStar";
        this.isScheduledForRemoval = false;
        this.group = CollisionGroup.COLGROUP_MOVING;
    }

    update(time, delta) {
        if (this.isScheduledForRemoval) {
            this.scene.removePowerUp(this);
            this.destroy();

            return;
        }

        super.update(time, delta);

        if (this.body.blocked.down) {
            
        }
    }

    isValid() {
        return true;
    }

    collected(star, player) {
        player.makeInvincible();
        this.isScheduledForRemoval = true;
    }

    collisionSolid() {
        if (hit.bottom) {
            this.body.velocity.y = -300;
        }

        if (hit.left || hit.right) {
            this.setAccelerationX(0);
            this.direction *= -1;
            this.body.velocity.x = this.direction * 70;
        }
    }
}