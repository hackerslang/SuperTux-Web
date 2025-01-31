import { game, CANVAS_WIDTH, CANVAS_HEIGHT } from '../game.js';
import { FontLoader } from '../object/ui/fontloader.js';
import { KeyController } from '../object/controller.js';
import { SectorSwapper } from '../object/level/sector_swapper.js';
import { ClickableHoverableRecangle } from '../object/ui/menu.js';

export class MenuScene extends Phaser.Scene {
    constructor(config) {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.generateKeyController();
        var fontLoader = new FontLoader();

        fontLoader.loadFont(this, "SuperTuxBigFont");
        fontLoader.loadFont(this, "SuperTuxBigFontColored");
    }

    create() {
        var rect = this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0xffffff, 0);

        rect.setOrigin(0, 0);
        rect.setInteractive();

        this.initCursor();
        this.makeGameMenu();
    }

    initCursor() {
        this.currentCursor = "default";
        this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor.png), pointer');

        this.input.on('pointerdown', (pointer, gameObjects) => {
            this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor-click.png), pointer');
            this.currentCursor = "down";
        });

        this.input.on('pointerup', (pointer, gameObjects) => {
            this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor.png), pointer');
            this.currentCursor = "default";
        });
    }

    setCursorLink(bool) {
        if (bool) {
            if (this.currentCursor == "default") {
                this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor-link.png), pointer');
            }
        } else if(this.currentCursor == "default") {
            this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor.png), pointer');
        }
    }

    setCursorLinkDown() {
        this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor-click.png), pointer');
    }

    makeGameMenu() {
        var fontLoader = new FontLoader();
        var glyphWidth = 22;
        var glyphHeight = 24;

        var items = [
            {
                "text": "Resume game",
                "callBack": this.resumeGame
            },
            {
                "text": "Load game",
                "callBack": null
            },
            {
                "text": "Save game",
                "callBack": this.launchSaveGameMenu
            },
            {
                "text": "Exit to main menu",
                "callBack": null
            }
        ];

        var padding = 30;
        var menuItemPadding = 20;
        var longestText = this.getLongestMenuItemName(items);
        var longestTextWidth = fontLoader.preCalculateTextDimensions({ fontName: "SuperTuxBigFont", text: longestText }).totalWidth;
        var menuRectWidth = longestTextWidth + (padding * 2);
        var menuRectHeight = (glyphHeight * 4) + (menuItemPadding * 3) + padding;
        var menuRectX = (CANVAS_WIDTH / 2) - (menuRectWidth / 2);
        var menuRectY = (CANVAS_HEIGHT / 2) - (menuRectHeight / 2);

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var textWidth = fontLoader.preCalculateTextDimensions({ fontName: "SuperTuxBigFont", text: item.text }).totalWidth;

            item.textX1 = ((CANVAS_WIDTH / 2) - (textWidth / 2));
            item.textY1 = menuRectY + (i * menuItemPadding) + padding + (i * glyphHeight);
        }

        var rect = this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0xffffff, 0);

        rect.setOrigin(0, 0);
        rect.setInteractive();

        var graphics = this.add.graphics();

        this.menuRect = this.add.rectangle(menuRectX, menuRectY, menuRectWidth, menuRectHeight, 0x000000, 0.37);

        this.menuRect.setOrigin(0, 0);
        this.menuRect.setInteractive();

        graphics.lineStyle(0.3, 0x000000);
        graphics.strokeRectShape(this.menuRect);

        this.menuItems = [];

        var self = this;

        items.forEach(item =>
            self.menuItems.push(
                new MenuItem({
                    scene: this,
                    x: item.textX1,
                    y: item.textY1,
                    glyphWidth: glyphWidth,
                    glyphHeight: glyphHeight,
                    text: item.text,
                    callBack: item.callBack
                })));
    }


    menuItemDown(menuItem) {
        this.setCursorLink(false);
        this.setCursorLinkDown();
        this.currentMenuItemPointerDown = menuItem;
    }

    menuItemClick(menuItem) {
        menuItem.hover();
        this.setCursorLink(true);

        if (this.currentMenuItemPointerDown != null) {
            if (this.currentMenuItemPointerDown.text == menuItem.text) {
                menuItem.callBack();
            }
        }
    }

    getLongestMenuItemName(items) {
        var longestText = "";

        items.forEach((item) => {
            if (item.text.length > longestText.length) {
                longestText = item.text;
            }
        });

        return longestText;
    }

    generateKeyController() {
        this.keys = {
            'menu': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };

        this.keyController = new KeyController(this.keys, this);
    }

    update(time, delta) {
        this.keyController.update();

        if (this.keyController.pressed('menu')) {
            this.resumeGame();
        }
    }

    resumeGame() {
        game.scene.stop("MenuScene");
        game.scene.resume(SectorSwapper.getCurrentSceneKey());
    }

    launchSaveGameMenu() {
        game.scene.stop("MenuScene");
        game.scene.start("SaveGameMenuScene");
    }
}

class MenuItem {
    constructor(config) {
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.glyphWidth = config.glyphWidth;
        this.glyphHeight = config.glyphHeight;
        this.text = config.text;
        this.textLen = this.text.length;
        this.width = this.textLen * this.glyphWidth;
        this.height = this.glyphHeight;
        this.callBack = config.callBack;
        this.wasAlreadyInThis = false;

        this.init();
    }

    init() {
        this.createTexts();
        this.createRect();
    }

    createTexts() {
        var fontLoader = new FontLoader();

        this.menuHoverText = fontLoader.displayText({ scene: this.scene, fontName: "SuperTuxBigFontColored", x: this.x, y: this.y, text: this.text });
        this.menuText = fontLoader.displayText({ scene: this.scene, fontName: "SuperTuxBigFont", x: this.x, y: this.y, text: this.text });
    }

    createRect() {
        this.rect = new ClickableHoverableRecangle({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            clickCallBack: this.callBack,
            scene: this.scene,
            item: this
        });
    }

    hover() {
        this.menuText.hide();
        this.menuHoverText.show();
        this.wasAlreadyInThis = true;
        this.scene.setCursorLink(true);
    }

    unHover() {
        this.menuText.show();
        this.menuHoverText.hide();
        this.wasAlreadyInThis = false;
        this.scene.setCursorLink(false);
    }
}