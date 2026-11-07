import { StillSprite } from './still_object.js';
import { CollisionGroup } from '../collision/collision_group.js';
import { HitResponse } from '../collision/collision_hit.js';

export class Coin extends StillSprite {
    constructor(config) {
        super(config, CollisionGroup.COLGROUP_TOUCHABLE);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id;

        this.destroyed = false;

        this.isCollectible = true;
        this.isCoin = true;
        this.setCoinType(config);
    }

    setCoinType(config) {
        if (config.coinType === undefined || config.coinType === "coin") {
            this.setCoinTypeNormal();
        } else {
            this.setCoinTypeHell();
        }
    }

    setCoinTypeNormal() {
        this.coinType = "coin";
        this.coinValue = 1;
        this.anims.play('coin-moving');

        return this;
    }

    setCoinTypeHell() {
        this.coinType = "hell-coin";
        this.coinValue = 2;
        this.anims.play('hell-coin-moving');

        return this;
    }

    update(time, delta) {
        if (this.destroyed) {
            return;
        }

        super.update(time, delta);

        if (this.soundTimer > 0) {
            this.soundTimer -= delta;
        }
    }



    collision(other, hit) {
        var player = !other.parent.isEnemy && (other.getGroup() == CollisionGroup.COLGROUP_MOVING || other.getGroup() == CollisionGroup.COLGROUP_MOVING_STATIC)
            ? other.parent : undefined;

        if (player === undefined)
            return HitResponse.ABORT_MOVE;
        if (this.getCollisionObject().getBbox().overlaps(player.getBbox().grown(-0.1))) {
            this.collect();
        }

        return HitResponse.ABORT_MOVE;
    }

    collect() {
        var pitchOne = 128;
        var lastPitch = 1;
        var pitch = 1;

        var tile = Math.floor(this.body.x / 32);

        if (!super.isValid())
            return;

        if (!this.soundTimer > 0) {
            pitchOne = tile;
            pitch = 1;
            lastPitch = 1;
        } else if (1000 - this.soundTimer < 0.02) {
            pitch = lastPitch;
        } else {
            switch ((pitchOne - tile) % 7) {
                case -6:
                    pitch = 1 / 2;  // C.
                    break;
                case -5:
                    pitch = 5 / 8;  // E.
                    break;
                case -4:
                    pitch = 4 / 6;  // F.
                    break;
                case -3:
                    pitch = 3 / 4;  // G.
                    break;
                case -2:
                    pitch = 5 / 6;  // A.
                    break;
                case -1:
                    pitch = 9 / 10;  // Bb.
                    break;
                case 0:
                    pitch = 1  // c.
                    break;
                case 1:
                    pitch = 9 / 8;  // d.
                    break;
                case 2:
                    pitch = 5 / 4;  // e.
                    break;
                case 3:
                    pitch = 4 / 3;  // f.
                    break;
                case 4:
                    pitch = 3 / 2;  // g.
                    break;
                case 5:
                    pitch = 5 / 3;  // a.
                    break;
                case 6:
                    pitch = 9 / 5;  // bb.
                    break;
            }

            lastPitch = pitch;
        }

        this.soundTimer = 1000;

        this.scene.sound.play("collect-coin", { detune: pitch * 100 });
        this.scene.addBouncyCoin(this.x, this.y, false);
        this.scene.addCollectedCoin(this.coinValue);

        this.destroyCoin();
    }

    destroyCoin() {
        this.destroyed = true;
        this.remove();
        this.destroy();
    }

    remove() {
        this.scene.removeCoin(this);
    }
}
