const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

const config = {
    type: Phaser.CANVAS,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
            //,fixedStep: false
        }
    },
    scene: [
        LevelSelectScene,
        //SectorScene,
        PauseScene
    ],
    powerPreference: "high-performance"
};

const game = new Phaser.Game(config);