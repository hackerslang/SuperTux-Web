////import './lib/phaser.js';
////import GameScene from './scenes/gamescene.js';
////import PauseScene from './scenes/pausescene.js';

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
        }
    },
    scene: [
        GameScene,
        PauseScene
    ]
};

const game = new Phaser.Game(config);