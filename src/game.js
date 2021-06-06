const config = {
    type: Phaser.WEBGL,
    width: 1024,
    height: 768,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 550 },
            debug: false
        }
    },
    scene: [
        GameScene
    ]
};

const game = new Phaser.Game(config);