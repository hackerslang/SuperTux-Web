const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

const config = {
    type: Phaser.Canvas,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: true
        }
    },
    scene: [
        GameScene,
        PauseScene
    ]
};

const game = new Phaser.Game(config);