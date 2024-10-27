import { CANVAS_WIDTH } from "../../game";

export class Rain {
    constructor(config) {
        this.scene = config.scene;
        this.player = config.player;
        this.currentAmount = config.intensity;
        this.angle = config.angle;
        this.speed = config.speed;

        if (config.type == "acid") {
            this.prefix = "acid-";
        } else {
            this.prefix = "";
        }

        this.MIN_AMOUNT = 0.1;
        this.MAX_AMOUNT = 5;

        this.virtualWidth = CANVAS_WIDTH * 2;
        this.currentRealAmount = 0;
        this.particles = [];
        this.setAmount(this.currentAmount);
    }

    setAmount(amount) {
        var realAmount = Math.max(amount, this.MIN_AMOUNT);

        realAmount = Math.min(realAmount, this.MAX_AMOUNT);

        var oldRainDropCount = this.virtualWidth * this.currentRealAmount / 6;
        var newRainDropCount = this.virtualWidth * realAmount / 6;
        var delta = newRainDropCount - oldRainDropCount;

        if (delta > 0) {
            for (var i = 0; i < delta; i++) {
                var rainSize = Math.random() * 2;
                var particle = new RainDrop({ texture: this.prefix + "rain" + Math.floor(rainSize) });
            }

            particle.speed = (rainSize + 1) * 45 + Math.floor(Math.random() * 3.6);
            this.particles.push(particle);
        } else {

        }

    }

    update(time, delta) {

    }
}

export class RainDrop {
    constructor(config) {
        uper(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setAllowGravity(false);


        this.setTexture(config.texture);
    }
}