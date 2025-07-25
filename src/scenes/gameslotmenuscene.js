﻿import { game, CANVAS_WIDTH, CANVAS_HEIGHT } from '../game.js';
import { FontLoader } from '../object/ui/fontloader.js';
import { KeyController } from '../object/controller.js';
import { GameSession } from '../object/game_session.js';
import { SectorScene } from './sectorscene.js';
import { SectorSwapper } from '../object/level/sector_swapper.js';
import { ImageButton } from '../object/ui/menu.js';
import { ImageLoader } from '../helpers/imageloader.js';
import { ClickableHoverableRecangle } from '../object/ui/menu.js';
import { MenuScene } from './menuscene.js';

export class GameSlotMenuScene extends MenuScene
{
    constructor() {
        super({ key: 'GameSlotMenuScene' });
    }

    initMenuType(menuType) {
        this.menuType = menuType;
    }

    preload() {
        super.preload();
        this.preloadImages();
    }

    preloadImages() {
        var imageLoader = new ImageLoader({ scene: this });

        imageLoader.loadImagesFromData("menu");
    }

    create(menuType) {
        super.create();
        this.initMenuType(menuType);
        this.makeSaveMenu();
    }

    update(time, delta) {
        this.keyController.update();

        if (this.keyController.pressed('menu')) {
            this.resumeGame();
        }
    }

    setCursorLink(bool) {
        if (bool) {
            if (this.currentCursor == "default") {
                this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor-link.png), pointer');
            }
        } else if (this.currentCursor == "default") {
            this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor.png), pointer');
        }
    }

    setCursorLinkDown() {
        this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor-click.png), pointer');
    }

    makeSaveMenu() {
        var gameSessions = GameSession.getLoadSaveGameSlotsSessions();
        var graphics = this.add.graphics();
        var menuItems = [];
        const saveGameMenuItemHeight = 106;
        const saveGameMenuItemPadding = 20;
        const saveGameSlotsCount = 3;
        var startY = (CANVAS_HEIGHT - ((saveGameMenuItemHeight * saveGameSlotsCount) + (saveGameMenuItemPadding * (saveGameSlotsCount - 1)))) / 2;
        var lowerButtonsY = startY + (saveGameSlotsCount * (saveGameMenuItemHeight + saveGameMenuItemPadding));

        this.title = this.add.sprite((CANVAS_WIDTH - 599) / 2, 60, this.menuType == 'savegame' ? 'save-game' : 'load-game');
        this.title.setOrigin(0, 0);

        for (var i = 0; i < gameSessions.length; i++) {
            var gameSession = gameSessions[i];
            var menuItem = {};
            
            if (gameSession != null) {
                menuItem = new SaveGameSlotItem(
                    {
                        id: i,
                        scene: this,
                        graphics: graphics,
                        x: (CANVAS_WIDTH - 598) / 2,
                        y: startY + (i * (saveGameMenuItemHeight + saveGameMenuItemPadding)),
                        width: 598,
                        height: 106,
                        slotText: "Slot " + (i + 1),
                        levelText: gameSession.levelName,
                        sectorText: gameSession.sectorName,
                        timeText: gameSession.timestamp,
                        isEmpty: false,
                        menuType: this.menuType
                    });
            } else {
                menuItem = new SaveGameSlotItem(
                    {
                        id: i,
                        scene: this,
                        graphics: graphics,
                        x: (CANVAS_WIDTH - 598) / 2,
                        y: startY + (i * (saveGameMenuItemHeight + saveGameMenuItemPadding)),
                        width: 598,
                        height: 106,
                        slotText: "Slot " + (i + 1),
                        isEmpty: true
                    });
            }

            menuItems.push(menuItem);
        }

        var backItem = new ImageButton({
            scene: this,
            x: (CANVAS_WIDTH - 598) / 2,
            y: lowerButtonsY,
            width: 105,
            height: 107,
            texture: 'back-button',
            hoverTexture: 'back-button-hover',
            callBack: this.resumeMainMenu
        });
    }

    resumeGame() {
        game.scene.stop("GameSlotMenuScene");
        game.scene.resume(SectorSwapper.getCurrentSceneKey());
    }

    resumeMainMenu() {
        game.scene.stop("GameSlotMenuScene");
        game.scene.start("GameMenuScene");
    }
}

class SaveGameSlotItem {
    constructor(config) {
        this.id = config.id;
        this.scene = config.scene;
        this.graphics = config.graphics;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.slotText = config.slotText;
        this.levelText = config.levelText;
        this.sectorText = config.sectorText;
        this.timeText = config.timeText;
        this.callBack = config.callBack;
        this.isEmpty = config.isEmpty;
        this.menuType = config.menuType;

        this.init();
    }

    init() {
        this.initTexts();
        this.createRect();
    }

    initTexts() {
        const PADDING = 10;
        var fontLoader = new FontLoader();

        this.createHoverRect();
        this.slotText = fontLoader.displayTextFromAtlas({ scene: this.scene, fontName: "SuperTuxBigColorFul", x: this.x + PADDING, y: this.y + 20, text: this.slotText });

        if (!this.isEmpty) {
            this.isEmptyText = null;
            this.levelText = fontLoader.displayTextAlignBottom({ scene: this.scene, fontName: "SuperTuxBigFont", x: this.x + PADDING, y: this.y + this.height - PADDING - 20, text: "Level: " + this.levelText, scale: 0.6 });
            this.sectorText = fontLoader.displayTextAlignBottom({ scene: this.scene, fontName: "SuperTuxBigFont", x: this.x + PADDING, y: this.y + this.height - PADDING, text: "Sector: " + this.sectorText, scale: 0.6 });
            this.timeText = fontLoader.displayTextAlignRight({ scene: this.scene, fontName: "SuperTuxBigFont", x: this.x + this.width, y: this.y + 20, text: this.timeText, scale: 0.6 });
        } else {
            this.isEmptyText = fontLoader.displayText({ scene: this.scene, fontName: "SuperTuxBigFont", x: this.x + PADDING, y: this.y + (this.height / 2), text: "<Empty>" });
        }
    }

    createRect() {
        this.rect = new ClickableHoverableRecangle({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            clickCallBack: (this.isEmpty ? this.nothing : (this.menuType == "savegame" ? this.save : this.load)),
            scene: this.scene,
            item: this
        });
    }

    cursorIsHover(x, y) {
        return x >= this.x -75 && y >= this.y && x <= this.x + this.width + 75 && y <= this.y + this.height;
    }

    hover() {
        this.polygon.setAlpha(1.0);
    }

    unHover() {
        this.polygon.setAlpha(0.5);
    }

    hideText() {
        this.slotText.hide();
        this.levelText.hide();
        this.sectorText.hide();
        this.timeText.hide();
    }

    showText() {
        this.slotText.show();
        this.levelText.show();
        this.sectorText.show();
        this.timeText.show();
    }

    createHoverRect() {
        var x = this.x;
        var y = this.y;

        this.polygon = this.scene.add.sprite(x, y, 'save-game-slot');
        this.polygon.setOrigin(0, 0);
    }

    nothing() {

    }

    load(id) {
        game.scene.stop("GameSlotMenuScene");
        game.scene.start("LoadGameScene", { loadSlot: "SuperTuxWeb-SaveSlot-" + id, loadGameType: "loadgame" });
    }

    save(id) {
        var session = GameSession.createSaveSessionDuringScene(SectorScene.getCurrentSectorScene());

        GameSession.saveGameSlot(session, id);
        this.scene.resumeGame();
    }
}