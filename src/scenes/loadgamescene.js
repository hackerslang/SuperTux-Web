import { worldLevels } from '../../assets/data/campaign_levels.js';
import { GameSession } from '../object/game_session.js';
import { Level } from '../object/level/level.js';
import { Sector } from '../object/level/sector.js';
import { SectorSwapper } from '../object/level/sector_swapper.js';

export class LoadGameScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'LoadGameScene'
        });
    }

    init(loadSlot, isNewGame) {
        this.loadSlot = loadSlot;
        this.isNewGame = isNewGame;
    }

    preload() {

    }

    create() {
        if (this.isNewGame) {
            this.newGame();
        } else if (this.loadSlot != null) {
            this.loadGame();
        }
    }

    loadGame() {
        var gameSession = GameSession.loadGame(this.loadSlot);
        var level = new Level({ levelDataKey: gameSession.levelKey, scene: this });
        
        this.initLevelAndSector(level, gameSession);
    }

    newGame() {
        var gameSession = GameSession.newGame();
        var level = new Level({ levelDataKey: worldLevels[0], scene: this });

        this.initLevelAndSector(level);
    }

    async initLevelAndSector(level, gameSession) {
        await level.initialize(gameSession);
        this.scene.stop("LoadGameScene");
        SectorSwapper.newSector(Sector.getCurrentSector(), this);
    }


    
}