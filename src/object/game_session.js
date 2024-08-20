export class GameSession {
    static session = {};

    static newGame() {
        GameSession.session.totalCoins = 0;
        GameSession.session.totalScore = 0;
        GameSession.session.health = 3;
        GameSession.session.levelName = "";
        GameSession.session.sectorKey = "";
        GameSession.session.playerPosition = {};
        GameSession.session.timestamp = new Date().toLocaleString("en-US");

        return GameSession.session;
    }

    static getCurrent() {
        return GameSession.session;
    }

    static quickSaveGame(gameSession) {
        GameSession.saveGame(gameSession, "SuperTuxWeb-QuickSave");
    }

    static quickLoadGame() {
        return GameSession.loadGame("SuperTuxWeb-QuickSave");
    }

    static saveGame(gameSession, slot) {
        gameSession.timestamp = new Date().toLocaleString("en-US");

        var cookieValue = JSON.stringify(gameSession);

        CookieSave.setCookie(slot, cookieValue);
    }

    static loadGame(slot) {
        var cookieValue = CookieSave.getCookie(slot);
        var gameSession = JSON.parse(cookieValue);

        GameSession.session = gameSession;

        return gameSession;
    }
}

export class CookieSave {

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

            if (currentCookie.startsWith(name + "=")) {
                cookie = currentCookie.substring(name.length + 1, currentCookie.length);
            }
        }

        return cookie;
    }

    static clearSave(name) {
        setCookie(name, "");
    }
}

