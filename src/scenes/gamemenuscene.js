import { game, CANVAS_WIDTH, CANVAS_HEIGHT } from '../game.js';
import { FontLoader } from '../object/ui/fontloader.js';
import { KeyController } from '../object/controller.js';
import { SectorSwapper } from '../object/level/sector_swapper.js';
import { ImageButton, ClickableHoverableRecangle } from '../object/ui/menu.js';
import { ImageLoader } from '../helpers/imageloader.js';
import { MenuScene } from './menuscene.js';
import { Cursor } from '../object/ui/cursor.js';

export class GameMenuScene extends MenuScene {
    constructor() {
        super({ key: 'GameMenuScene' });
    }

    preload() {
        super.preload();
        this.imageLoader.loadImagesFromData("gamemenu");
    }

    create() {
        super.create();
        this.makeGameMenu();
    }

    makeGameMenu() {
        var items = [
            {
                "texture": "resume-game",
                "hoverTexture": "resume-game-hover",
                "callBack": this.resumeGame
            },
            {
                "texture": "load-game",
                "hoverTexture": "load-game-hover",
                "callBack": this.launchLoadGameMenu
            },
            {
                "texture": "save-game",
                "hoverTexture": "save-game-hover",
                "callBack": this.launchSaveGameMenu
            },
            {
                "texture": "settings",
                "hoverTexture": "settings-hover",
                "callBack": this.launchSettingsMenu
            },
            {
                "texture": "exit-to-main-menu",
                "hoverTexture": "exit-to-main-menu-hover",
                "callBack": null
            }
        ];

        this.menuItems = [];

        var scaleButtons = 0.8;
        var self = this;
        var i = 0;
        var x = CANVAS_WIDTH / 2;
        var padding = 10;
        var itemHeight = 50 * scaleButtons;

        this.add.sprite(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 8, "gamemenu-title").setOrigin(0.5, 0.5);

        items.forEach(item => {
            self.menuItems.push(
                new ImageButton({
                    scene: this,
                    x: x,
                    y: (CANVAS_HEIGHT / 2) - (CANVAS_HEIGHT / 8) - (items.length / 2) + (i * (itemHeight + padding)),
                    originX: 0.5,
                    originY: 0.5,
                    scale: scaleButtons,
                    texture: item.texture,
                    hoverTexture: item.hoverTexture,
                    callBack: item.callBack
                }));
            i++;
        });
    }

    menuItemDown(menuItem) {
        this.cursor.setCursorLink(false);
        this.cursor.setCursorLinkDown();
        this.currentMenuItemPointerDown = menuItem;
    }

    menuItemClick(menuItem) {
        menuItem.hover();
        this.cursor.setCursorLink(true);

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
        this.keyController = new KeyController(this);
    }

    update(time, delta) {
        super.update(time, delta);
        this.keyController.update();

        if (this.keyController.pressed('menu')) {
            this.resumeGame();
        }
    }

    resumeGame() {
        game.scene.stop("GameMenuScene");
        game.scene.resume(SectorSwapper.getCurrentSceneKey());
    }

    launchSaveGameMenu() {
        game.scene.stop("GameMenuScene");
        game.scene.start("GameSlotMenuScene", "savegame");
    }

    launchLoadGameMenu() {
        game.scene.stop("GameMenuScene");
        game.scene.start("GameSlotMenuScene", "loadgame");
    }

    launchSettingsMenu() {
        game.scene.stop("GameMenuScene");
        game.scene.start("SettingsMenuScene"); 
    }
}

class ImageButtonMenuItem {
    constructor(config) {
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.originX = config.originX || 0.5;
        this.originY = config.originY || 0.5;
        this.texture = config.texture;
        this.hoverTexture = config.hoverTexture;
        this.callBack = config.callBack;
        this.init();
    }

    init() {
        
    }
}

class TextMenuItem {
    constructor(config) {
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.glyphWidth = config.glyphWidth;
        this.glyphHeight = config.glyphHeight;
        this.text = config.text;
        this.textLen = this.text.length;
        this.width = config.width || this.textLen * this.glyphWidth;
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

        this.menuText = fontLoader.displayTextFromAtlas({ scene: this.scene, fontName: "SuperTuxBigColorFul", scale: 0.5, x: this.x, y: this.y, text: this.text });
        this.menuHoverText = fontLoader.displayTextFromAtlas({ scene: this.scene, fontName: "SuperTuxBigColorFulWhite", scale: 0.5, x: this.x, y: this.y, text: this.text });
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