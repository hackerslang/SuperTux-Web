class Brick extends BounceableBlock {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id;
        this.setTexture(config.brickSprite);
        this.startY = config.y;
        this.done = false;
        this.body.setBounce(0);
        this.setOrigin(0, 0);
        this.body.setImmovable(true);
        this.brickPieces = [];
        this.brickPiecesDestroyAt = 180;
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

    bounceComplete() {
        if (this.done) { return; }
        var brickX = brick.x;
        var brickY = brick.y;
        brick.done = true;

        ['brick-piece1', 'brick-piece2', 'brick-piece3', 'brick-piece4', 'brick-piece5', 'brick-piece6'].forEach(texture => {
            var velocityX = Math.floor((Math.random() * 201) - 100);
            var velocityY = Math.floor((Math.random() * 701) - 300);

            var particle = new Particle({
                x: this.x,
                y: this.y,
                texture: texture,
                scene: this.scene,
                allowGravity: true
            });

            particle.setVelocity(velocityX, velocityY);

            this.level.particleSprites.push(particle);
        });

        this.level.removeBlock(brick);
        this.destroy();
    }
}