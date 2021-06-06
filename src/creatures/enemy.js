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

        this.realY = config.realY;
        this.player = config.player;
        this.DIRECTION_LEFT = -1;
        this.DIRECTION_RIGHT = 1;

        this.changedDirectionBeforeEdge = false;
        this.turnedAroundLeft = false;
        this.turnedAroundRight = false;

        this.groundLayerCollider = this.scene.physics.add.collider(this, this.level.groundLayer);
    }

    activated() {
        if (!this.hasBeenSeen) {
            if (this.x < this.scene.cameras.main.scrollX + this.scene.sys.game.canvas.width + 32) {
                this.hasBeenSeen = true;
                this.body.velocity.x = this.direction;
                
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

    isAtEdgeLeft() {
        var levelTiles = this.level.getLevelData();
        var tileX = Math.floor(this.body.x / 32);
        var tileY = this.realY;

        if (tileX <= 0 || tileY >= levelTiles.length - 1) {
            return false;
        }

        var edgeTile = levelTiles[tileY + 1][tileX - 1];

        return (edgeTile == 0 || this.body.blocked.left /*|| this.body.touching.left*/);
    }

    isAtEdgeRight() {
        var levelTiles = this.level.getLevelData();
        var tileX = Math.floor(this.body.x / 32);
        var tileY = this.realY;
        
        if (tileX >= levelTiles[0].length - 1 || tileY >= levelTiles.length - 1) {
            return false;
        }

        var edgeTile = levelTiles[tileY + 1][tileX + 1];

        return (edgeTile == 0 || this.body.blocked.right /*|| this.body.touching.right*/);
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

    killNoFlat(texture) {
        this.setTexture(texture);
        this.body.setVelocityX(0);
        this.body.setVelocityY(-200);
        this.killAt = 1500;
        this.killFalling = true;
        this.groundLayerCollider.destroy();
    }

    getFlat(texture) {
        this.setTexture(texture);
        this.body.height = 13;
        this.body.setVelocityX(0);
        this.body.acceleration.x = 0;
        this.killAt = 500;
    }

    walkAndTurnOnEdge() {
        if (this.body.x <= 10 || this.isAtEdgeLeft() && !this.turnedAroundLeft) {
            this.direction = this.DIRECTION_RIGHT;
            this.body.velocity.x = this.direction * 100;
            this.flipX = true;
            this.turnedAroundLeft = true;
            this.turnedAroundRight = false;
        } else if (this.isAtEdgeRight() && !this.turnedAroundRight) { //no ground below
            this.direction = this.DIRECTION_LEFT;
            this.body.velocity.x = this.direction * 100;
            this.flipX = false;
            this.turnedAroundLeft = false;
            this.turnedAroundRight = true;
        }
    }

    enemyOut() {

    }
}