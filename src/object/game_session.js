class GameSession {
    constructor() {
        this.totalCoins = 0;
        this.totalScore = 0;
        this.tuxStats = {};
    }

    static newGame() {
        var gameSession = new GameSession();

        gameSession.tuxStats.health = 3;
        gameSession.tuxStats.level = 0;
        gameSession.tuxStats.sector = 0;
        gameSession.tuxStats.health = 3;

        return gameSession;
    }

    createTuxPlayer(scene,x, y) {
        this.tuxPlayer = new Tux({
            key: "tux",
            scene: scene,
            x: x,
            y: y
        });

        return this.tuxPlayer;       
    }

    addPlayerToSector(sector) {

    }

    saveGame() {
        //Save to cookie!
    }

    loadGame() {
        //load from cookie!
    }
}