import { PowerUp } from "./powerup.js";
import { CollisionGroup } from "../../collision/collision_group.js";
import { HitResponse } from "../../collision/collision_hit.js";
import { PlayerBonus } from "../../creatures/player.js";

export var FlowerType = {
    BONUS_FIRE: 0,
    BONUS_ICE: 1,
    BONUS_AIR: 2,
    BONUS_EARTH: 3
};

export class Flower extends PowerUp {
    constructor(config, collisionGroup) {
        super(config, CollisionGroup.COLGROUP_TOUCHABLE);

        this.body.setAllowGravity(false);
        this.type = config.type;
        this.isScheduledForRemoval = false;
        this.block = config.block;
        this.setDepth(8999);
        this.setOrigin(0, 0);
        this.collectible = false;

        this.init();
    }

    init() {
        if (this.type == FlowerType.BONUS_FIRE) {
            this.anims.play("fire-flower"); 
            this.bonus = PlayerBonus.BONUS_FIRE;
        }
        else if (this.type == FlowerType.BONUS_ICE) {
            // this.anims.play("ice-flower");
        }
        else if (this.type == FlowerType.BONUS_AIR) {
            // this.anims.play("air-flower");
        }
        else if (this.type == FlowerType.BONUS_EARTH) {
            // this.anims.play("earth-flower");
        } else {
            console.log("Invalid flower animation type: " + this.type); 
        }
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.isScheduledForRemoval) {
            return;
        }

        if (this.body.y <= this.block.y - 32) {
            this.body.y = this.block.y - 32;
            this.body.velocity.y = 0;
            this.collectible = true;
        } else {
            this.body.velocity.y = -10;
        }
    }

    collision(other, hit) {
        if (!this.collectible) { return; }

        var player = other.parent.isPlayer ? other.parent : undefined;

        if (player === undefined) {
            return HitResponse.ABORT_MOVE;
        }

        if (!player.addBonus(this.bonus, true)) {
            return HitResponse.FORCE_MOVE;
        }

        this.scene.sound.play("fire-flower");

        this.isScheduledForRemoval = true;
        this.scene.removePowerUp(this);
        this.destroy();
    }
}