class RandomLevelFactory {
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

var gameSession = {};

class LevelSelectScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'LevelSelectScene'
        });

        this.world1Levels = [
            new Level({ levelData: levelNTheLavaWorld, scene: this }),
            new Level({ levelData: levelTheBeginningData, scene: this })
        ];


    }

    preload() {

    }

    create() {
        gameSession = GameSession.newGame();

        this.world1Levels[1].initialize();
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
