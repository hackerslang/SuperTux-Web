class Spike extends Phaser.GameObjects.Sprite {
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

        var prefix = "";
        if (config.landscape == 'snow') { 
            prefix = 'snow-';
        }

        var name = prefix + 'spike-' + config.position;
        this.setTexture(name);
    }

    update(time, delta) {
        //this.scene.physics.world.collide(this, this.player, this.spikeHit);
    }
}