class GameSession {
    constructor() {
        this.saveSlots = 3;
    }

    static newGame() {
        var gameSession = {};

        gameSession.totalCoins = 0;
        gameSession.totalScore = 0;
        gameSession.health = 3;
        gameSession.levelName = "";
        gameSession.sectorName = "";
        gameSession.playerPosition = { };

        return gameSession;
    }

    static loadGame(gameSession) {

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

    static quickSaveGame(session) {
        var cookieValue = JSON.stringify(session);

        CookieSave.setCookie("SuperTuxWeb-QuickSave", cookieValue);
    }

    static saveGame(slot) {
        //Save to cookie!
        //CookieSave.setCookie("SuperTuxWeb-QuickSave", )
    }

    static loadGame(slot) {
        var cookieValue = CookieSave.getCookie("SuperTuxWeb-QuickSave");
        var session = JSON.parse(cookieValue);

        GameSession.loadGame(session);
    }
}

class CookieSave {

    static setCookie(name, value) {
        var expires = "";
        var date = new Date();

        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));

        document.cookie = name + "=" + (value || "") + "; expires =" + date.toUTCString() + "; path=/";
    }

    static getCookie(name) {
        var cookie = null;
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var currentCookie = cookies[i];

            currentCookie = currentCookie.trim(' ');

            if (c.startsWith(name + "=")) {
                cookie = currentCookie.substring(name.length + 1, currentCookie.length);
            }
        }

        return cookie;
    }

    static clearSave(name) {
        setCookie(name, "");
    }
}

