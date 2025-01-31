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

    init(config) {
        this.loadSlot = config.loadSlot;
        this.loadGameType = config.loadGameType;
    }

    preload() {

    }

    create(config) {
        this.loadSlot = config.loadSlot;
        this.loadGameType = config.loadGameType;

        if (this.loadGameType == "newgame") {
            this.newGame();
        } else if (this.loadGameType == "loadgame" && this.loadSlot != null) {
            this.loadGame();
        } else if (this.loadGameType == "resetsector") {
            this.reloadLastSector();
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

    reloadLastSector() {
        this.initLevelAndSector(Level.currentLevel, GameSession.session);
    }

    async initLevelAndSector(level, gameSession) {
        SectorSwapper.clearAllSectors();
        await level.initialize(gameSession);
        this.scene.stop("LoadGameScene");

        console.log(Sector.getCurrentSector());
        SectorSwapper.newSector(Sector.getCurrentSector(), this);
    }
}