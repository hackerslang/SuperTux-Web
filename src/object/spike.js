const spikeMapping = [
    { key: "spk-dwn", value: "spike-down" },
    { key: "spk-left", value: "spike-left" }, 
    { key: "spk-rght", value: "spike-right" },
    { key: "spk-up", value: "spike-up" },

    { key: "spk-b-dwn", value: "blood-spike-down" },
    { key: "spk-b-lft", value: "blood-spike-left" },
    { key: "spk-b-rght", value: "blood-spike-right" },
    { key: "spk-b-up", value: "blood-spike-up" }
];

export class HurtableStillObject extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);

        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id;
        this.setOrigin(0, 0);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
    }

    update(time, delta) {
        this.scene.physics.world.collide(this, this.player, this.playerHit);
    }

    playerHit(object, player) {
        if (player.invincible) {
            return;
        }

        player.hurtBy(object);
    }
}

export class Spike extends HurtableStillObject {
    constructor(config) {
        super(config);

        this.initTexture(config.type);
    }

    initTexture(type) {
        var texture = spikeMapping.find(item => item.key === type);
        var textureKey = "spike-up"

        if (texture !== undefined) {
            textureKey = texture.value;
        }

        this.setTexture(textureKey);
    }

    update(time, delta) {
        super.update(time, delta);
        //
    }
}