import { Level } from '../object/level/level.js';
import { Sector } from '../object/level/sector.js';
import { worldLevels } from '../../assets/data/campaign_levels.js';
import { GameSession } from '../object/game_session.js';
import { SectorSwapper } from '../object/level/sector_swapper.js';

export class RandomLevelFactory {
    constructor(scene) {
        this.levels = [];
        this.index = 0;
        this.scene = scene;

        this.levels.push(new LevelTheBeginningData());
        this.levels.push(new LevelTheDescentData());
        this.levels.push(new LevelCastle1Data());
    }

    getLevel(index) {
        return this.makeLevel(this.levels[index]);
    }

    getNexLevel() {
        this.index++;

        return getLevel(this.index);
    }

    makeLevel(levelData) {
        return new Level(levelData, this.scene);
    }
}

export var gameSession = {};

export class LevelSelectScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'LevelSelectScene'
        });

        this.levels = [];

        var self = this;

        var arr = [];

        //for (var i = 0; i < world1LevelKeys.length; i++) {
        //    fetch("./assets/data/levels/" + world1LevelKeys[i] + ".js")
        //        .then(function (response) {
        //            if (response.ok) {
        //                return response.json();
        //            }
        //        })
        //        .then(function (json) {
        //            self.levels.pushnew Level({ levelData: json, scene: this });
        //        });

        
        
    }

    async preload() {

    }

    async create() {
        this.levels = [
            new Level({ levelDataKey: worldLevels[0], scene: this })/*,
            new Level({ levelDataKey: worldLevels[1], scene: this })*/
        ];

        gameSession = GameSession.newGame();

        await this.levels[0].initialize(gameSession);
        this.scene.stop("LevelSelectScene");
        SectorSwapper.newSector(Sector.getCurrentSector(), this);
    }

    changeSector() {
        SectorSwapper.swapSector();
    }

    stop() {
        game.scene.stop("LevelSelectScene");
    }

    launchLevel() {
        game.scene.stop("LevelSelectScene");
        game.scene.launch("SectorScene");
    }

    update(time, delta) {

    }
}