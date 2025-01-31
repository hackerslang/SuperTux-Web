import { LoadGameScene } from './scenes/loadgamescene.js';
import { LevelSelectScene } from './scenes/levelselectscene.js'
import { SectorScene1, SectorScene2, SectorScene3 } from './scenes/sectorscene.js';
import { PauseScene } from './scenes/pausescene.js';
import { MenuScene } from './scenes/menuscene.js';
import { SaveGameMenuScene } from './scenes/savegamemenuscene.js';

export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;

const config = {
    type: Phaser.CANVAS,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 750 }, //600
            debug: false
            //,fixedStep: false
        }
    },
    scene: [
        LevelSelectScene,
        SectorScene1,
        SectorScene2,
        SectorScene3,
        LoadGameScene,
        PauseScene,
        MenuScene,
        SaveGameMenuScene
    ],
    powerPreference: "high-performance"
};

export const game = new Phaser.Game(config);