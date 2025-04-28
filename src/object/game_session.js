import { Level } from '../object/level/level.js';
import { Sector } from '../object/level/sector.js';

export class GameSession {
    static session = {};

    static newGame() {
        GameSession.session.lives = 5; //easy
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

    static setLives(lives) {
        GameSession.session.lives = lives;
    }

    static getLives() {
        return GameSession.session.lives;
    }

    static totalCoins(totalCoins) {
        GameSession.session.totalCoins = totalCoins;
    }

    static setScore(score) {
        GameSession.session.totalScore = score;
    }

    static addScore(score) {
        GameSession.session.totalScore += score;
    }

    static setHealth(health) {
        GameSession.session.health = health;
    }

    static setLevel(level) {
        GameSession.session.levelName = level;
    }

    static setSector(sector) {
        GameSession.session.sectorKey = sector;
    }

    static quickSaveGame(gameSession) {
        GameSession.saveGame(gameSession, "SuperTuxWeb-QuickSave");
    }

    static quickLoadGame() {
        return GameSession.loadGame("SuperTuxWeb-QuickSave");
    }

    static saveGameSlot(gameSession, n) {
        GameSession.saveGame(gameSession, "SuperTuxWeb-SaveSlot-" + n);
    }

    static saveGame(gameSession, slot) {
        gameSession.timestamp = new Date().toLocaleString("en-US");

        var cookieValue = JSON.stringify(gameSession);

        CookieSave.setCookie(slot, cookieValue);
    }

    static loadGameSlot(n) {
        return GameSession.loadGame("SuperTuxWeb-SaveSlot-" + n);
    }

    static loadGame(slot) {
        var cookieValue = CookieSave.getCookie(slot);
        var gameSession = JSON.parse(cookieValue);

        GameSession.session = gameSession;

        return gameSession;
    }

    static getLoadSaveGameSlotsSessions() {
        var gameSessions = [];

        for (var i = 0; i < 3; i++) {
            var slotName = "SuperTuxWeb-SaveSlot-" + i;
            var slotCookie = CookieSave.getCookie(slotName);

            if (slotCookie != null) {
                gameSessions.push(JSON.parse(slotCookie));
            } else {
                gameSessions.push(null);
            }
        }

        return gameSessions;
    }

    static playerDied(level) {
        GameSession.session.lives--;
        GameSession.session.levelKey = level.levelDataKey;
        GameSession.session.sectorKey = Sector.getCurrentSector().sectorData.key;
        GameSession.session.playerPosition = null;
        GameSession.session.playerVelocity = null;
        GameSession.enemiesPositions = null;
    }

    //We store current game stats inside the GameSession.session, because:
    //1. Player can save between Levels
    //2. Player can be destroyed and regenerated (different char, ...)
    static updateSessionAfterLevel(player, nextLevel) {
        GameSession.session.levelName = nextLevel;
        GameSession.session.sectorKey = null;
        GameSession.session.playerPosition = null;
        GameSession.session.playerVelocity = null;
        GameSession.enemiesPositions = null;
    }

    static createSaveSessionDuringScene(scene) {
        if (GameSession.session == null) {
            GameSession.session = {};
        }

        var level = Level.getCurrentLevel();
        var sector = Sector.getCurrentSector();

        GameSession.session.levelKey = level.levelData.key;
        GameSession.session.levelName = level.levelData.title;
        GameSession.session.sectorKey = sector.sectorData.key;
        GameSession.session.sectorName = sector.sectorData.name;
        GameSession.session.playerPosition = { "x": scene.player.body.x, "y": scene.player.body.y };
        GameSession.session.playerVelocity = { "x": scene.player.body.velocity.x, "y": scene.player.body.velocity.y };
        GameSession.session.enemiesPositions = [];

        for (var i = 0; i < scene.creatureObjects.length; i++) {
            var enemy = scene.creatureObjects[i];
            var enemyPosition = {};

            if (enemy != null) {
                enemyPosition.id = enemy.id;
                enemyPosition.x = enemy.x;
                enemyPosition.y = enemy.y;
                enemyPosition.velocityX = enemy.body.velocity.x;
                enemyPosition.velocityY = enemy.body.velocity.y;
                enemyPosition.direction = enemy.direction;

                GameSession.session.enemiesPositions.push(enemyPosition);
            }
        }
        
        return GameSession.session;
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

    static cookieExists(name) {
        return CookieSave.getCookie(name) != null;
    }

    static clearSave(name) {
        setCookie(name, "");
    }
}