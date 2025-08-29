import { LevelSelectScene } from './scenes/levelselectscene.js'
import { LoadGameScene } from './scenes/loadgamescene.js';
import { SectorScene1, SectorScene2, SectorScene3 } from './scenes/sectorscene.js';
import { PauseScene } from './scenes/pausescene.js';
import { GameMenuScene } from './scenes/gamemenuscene.js';
import { GameSlotMenuScene } from './scenes/gameslotmenuscene.js';
import { SettingsMenuScene } from './scenes/settingsmenu.js';

export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;
export const GAME_GRAVITY = 750;

export const GlobalGameConfig = {
    type: Phaser.CANVAS,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_GRAVITY }, //600
            debug: true
            //,fixedStep: false
        }
    },
    scene: [
        LevelSelectScene,
        LoadGameScene,
        SectorScene1,
        SectorScene2,
        SectorScene3,
        PauseScene,
        GameMenuScene,
        GameSlotMenuScene,
        SettingsMenuScene
    ],
    scale: {
        CANVAS_HEIGHT,
        CANVAS_WIDTH,
        parent: 'canvas',
        mode: Phaser.Scale.NONE,
        autoRound: true,
    },
    render: {
        pixelArt: false,
        roundPixels: true,
        antialias: true,
    },
    powerPreference: "high-performance"
};

export const game = new Phaser.Game(GlobalGameConfig);