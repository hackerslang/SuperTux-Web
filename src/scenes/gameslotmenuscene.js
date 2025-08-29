import { game, CANVAS_WIDTH, CANVAS_HEIGHT } from '../game.js';
import { FontLoader } from '../object/ui/fontloader.js';
import { KeyController } from '../object/controller.js';
import { GameSession } from '../object/game_session.js';
import { Sector } from '../object/level/sector.js';
import { SectorScene } from './sectorscene.js';
import { SectorSwapper } from '../object/level/sector_swapper.js';
import { ConfirmDialog } from '../object/ui/dialog.js';
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
                        slotTexture: "slot-" + (i + 1),
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
                        slotTexture: "slot-" + (i + 1),
                        isEmpty: true
                    });
            }

            menuItems.push(menuItem);
        }

        var backItem = new ImageButton({
            scene: this,
            x: (CANVAS_WIDTH - 598) / 2,
            y: lowerButtonsY,
            width: 187,
            height: 36,
            scale: 0.7,
            texture: 'back-button',
            hoverTexture: 'back-button-hover',
            callBack: this.resumeMainMenu
        });

        this.menuItems = menuItems;
    }

    resumeGame() {
        game.scene.stop("GameSlotMenuScene");
        game.scene.resume(SectorSwapper.getCurrentSceneKey());
    }

    resumeMainMenu() {
        game.scene.stop("GameSlotMenuScene");
        game.scene.start("GameMenuScene");
    }

    disableSlotsInteractive() {
        this.menuItems.forEach(x => x.disabled = true);
    }

    enableSlotsInteractive() {
        this.menuItems.forEach(x => x.disabled = false);
    }

    isSaveGameMenuType() {
        return this.menuType == "savegame";
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
        this.slotTexture = config.slotTexture;
        this.levelText = config.levelText;
        this.sectorText = config.sectorText;
        this.timeText = config.timeText;
        this.callBack = config.callBack;
        this.isEmpty = config.isEmpty;
        this.menuType = config.menuType;
        this.disabled = false;

        this.init();
    }

    init() {
        this.createHoverRect();
        this.initSlot();
        this.initHover();
        this.createRect();
    }

    initSlot() {
        this.removeAllText();
        this.addText(); 
    }

    refreshSlot(slot) {
        this.isEmpty = false;
        this.disabled = false;
        this.levelText = slot.levelName;
        this.sectorText = slot.sectorName;
        this.timeText = slot.timestamp;

        this.initSlot();
    }

    removeAllText() {
        if (this.slotFontText != null) {
            this.slotFontText.destroy();
        }

        if (this.isEmptyFontText != null) {
            this.isEmptyFontText.destroy();
        }

        if (this.levelFontText != null) {
            this.levelFontText.destroy();
        }

        if (this.sectorFontText != null) {
            this.sectorFontText.destroy();
        }

        if (this.timeFontText != null) {
            this.timeFontText.destroy();
        }
    }

    addText() {
        const PADDING_X = 50;
        const PADDING_Y = 20;
        var fontLoader = new FontLoader();

        if (this.slotText) {
            this.slotFontText = fontLoader.displayTextFromAtlas({ scene: this.scene, fontName: "SuperTuxBigColorFul", x: this.x + PADDING, y: this.y + 20, text: this.slotText });
        } else {
            this.slotFontText = this.scene.add.sprite(this.x + PADDING_X, this.y + 20, this.slotTexture).setScale(0.5);
        }

        if (!this.isEmpty) {
            this.isEmptyFontText = null;
            this.levelFontText = fontLoader.displayTextAlignBottom({ scene: this.scene, fontName: "SuperTuxBigFontFlashy", x: this.x + PADDING_X, y: this.y + this.height - PADDING_Y - 20, text: "Level: " + this.levelText, scale: 0.6 });
            this.sectorFontText = fontLoader.displayTextAlignBottom({ scene: this.scene, fontName: "SuperTuxBigFontFlashy", x: this.x + PADDING_X, y: this.y + this.height - 10, text: "Sector: " + this.sectorText, scale: 0.6 });
            this.timeFontText = fontLoader.displayTextAlignRight({ scene: this.scene, fontName: "SuperTuxBigFontFlashy", x: this.x + this.width, y: this.y + 20, text: this.timeText, scale: 0.6 });
        } else {
            this.isEmptyFontText = fontLoader.displayText({ scene: this.scene, fontName: "SuperTuxBigFontFlashy", x: this.x + PADDING_X, y: this.y + (this.height / 2), text: "<Empty>" });
        }
    }

    createRect() {
        this.rect = new ClickableHoverableRecangle({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            clickCallBack: (this.scene.isSaveGameMenuType() ? this.saveConfirm : this.load),
            scene: this.scene,
            item: this
        });
    }

    cursorIsHover(x, y) {
        return x >= this.x -75 && y >= this.y && x <= this.x + this.width + 75 && y <= this.y + this.height;
    }

    initHover() {
        this.polygon.setAlpha(1);
        this.polygonHover.setAlpha(0);
    }

    hover() {
        if (this.canSaveLoad()) {
            this.polygon.setAlpha(0);
            this.polygonHover.setAlpha(1);
        }
    }

    unHover() {
        if (this.canSaveLoad()) {
            this.polygon.setAlpha(1);
            this.polygonHover.setAlpha(0);
        }
    }

    focus() {
        this.hover();
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
        this.polygon.setScale(0.5);

        this.polygonHover = this.scene.add.sprite(x, y, 'save-game-slot-hover');
        this.polygonHover.setOrigin(0, 0);
        this.polygonHover.setScale(0.5);
    }

    nothing() {

    }

    load(id) {
        if (this.item.canSaveLoad()) {
            game.scene.stop("GameSlotMenuScene");
            game.scene.start("LoadGameScene", { loadSlot: "SuperTuxWeb-SaveSlot-" + id, loadGameType: "loadgame" });
        }
    }

    saveConfirm(id) {
        var slot = this.item;
        if (slot.canSaveLoad()) {
            const self = this;
            this.confirm = new ConfirmDialog(
                {
                    scene: this.scene,
                    x: CANVAS_WIDTH / 2,
                    y: CANVAS_HEIGHT / 2,
                    width: 400,
                    height: 200,
                    titleTexture: "save-dialog-title",
                    descriptionTexture: "overwrite-save-game",
                    backgroundTexture: "dialog-bg",
                    onConfirm: () => {
                        var session = GameSession.createSaveSessionDuringScene(Sector.currentSectorScene);

                        var slotData = GameSession.saveGameSlot(session, id);

                        slot.refreshSlot(slotData);

                        self.confirm.close();
                        self.scene.enableSlotsInteractive();
                    },
                    onCancel: () => {
                        self.confirm.close();
                        self.scene.enableSlotsInteractive();
                    }
                });

            this.confirm.show();

            this.scene.disableSlotsInteractive();
        }
    }

    canSaveLoad() {
        return (!this.isEmpty || this.scene.isSaveGameMenuType()) && !this.disabled && !this.scene.isDialogActive();
    }
}