class Enemy extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.level = config.level;
        this.alive = true;
        this.id = config.id

        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);
        this.body.allowGravity = true;
        this.hasBeenSeen = false;

        this.player = config.player;
        this.DIRECTION_LEFT = -1;
        this.DIRECTION_RIGHT = 1;

        this.groundLayerCollider = this.scene.physics.add.collider(this, this.level.groundLayer);
    }

    activated() {
        if (!this.hasBeenSeen) {
            if (this.x < this.scene.cameras.main.scrollX + this.scene.sys.game.canvas.width + 32) {
                this.hasBeenSeen = true;
                this.body.velocity.x = this.direction;
                
                //alert("adzdazkpoazd");
                return true;
            }
            //aler('false');
            return false;
        }
        //alert('true');
        return true;
    }

    update(time, delta) {

    }

    verticalHit(enemy, player) {
        if (!player.isActiveAndAlive()) {

            return false;
        }

        return player.body.velocity.y >= 0 && (player.body.y + player.body.height) - enemy.body.y < 10;
    }

    downHit(enemy, player) {
        if (!player.isActiveAndAlive()) {

            return false;
        }

        return enemy.body.y + enemy.body.height <= player.body.y && player.body.x >= enemy.body.x - 30 && player.body.x < enemy.body.x + (enemy.body.width);
    }

    hurtPlayer(enemy, player) {
        this.player.hurtBy(enemy);
    }

    kill() {
        this.level.removeEnemy(this);
        this.destroy();
    }

    enemyOut() {

    }
}