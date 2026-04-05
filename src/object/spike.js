const spikeMapping = [
    { key: "spk-dwn", value: "spike-down" },
    { key: "spk-left", value: "spike-left" }, 
    { key: "spk-rght", value: "spike-right" },
    { key: "spk-up", value: "spike-up" },

    { key: "spk-i-dwn", value: "ice-spike-down", atlas: 'ice-spikes' }, 
    { key: "spk-i-lft", value: "ice-spike-left", atlas: 'ice-spikes' }, 
    { key: "spk-i-rght", value: "ice-spike-right", atlas: 'ice-spikes' }, 
    { key: "spk-i-up", value: "ice-spike-up", atlas: 'ice-spikes' }, 

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

        this.ICE_SPIKE_MARGIN = 5;
        this.init(config.type);
    }

    init(type) {
        var texture = spikeMapping.find(item => item.key === type);

        this.initTexture(texture);
        this.position(texture);
    }

    position(texture) {
        // Ice spikes seem to have gap between themselves and tilemap, we move them below
        // the tilemap in depth (z-index) and we remove the gap!

        this.setDepth(0);

        if (texture.value.endsWith("up")) {
            this.x += this.ICE_SPIKE_MARGIN;
        } else if (texture.value.endsWith("down")) {
            this.x -= this.ICE_SPIKE_MARGIN;
        } else if (texture.value.endsWith("right")) {
            this.x -= this.ICE_SPIKE_MARGIN;
        } else if (texture.value.endsWith("left")) {
            this.x += this.ICE_SPIKE_MARGIN;
        }
    }

    initTexture(texture) {
        if (texture !== undefined) {
            if (texture.atlas !== undefined) {
                this.setTexture(texture.atlas, texture.value);
            } else {
                this.setTexture(texture.value);
            }
        }
    }

    update(time, delta) {
        super.update(time, delta);
        //
    }
}