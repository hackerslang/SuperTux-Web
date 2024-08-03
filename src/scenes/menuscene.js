class MenuScene extends Phaser.Scene {
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
        var text1 = 'Resume game';
        var text2 = 'Load game';
        var text3 = 'Save game';
        var text4 = 'Exit to main menu';

        var text1X1 = (CANVAS_WIDTH / 2) - (glyphWidth * text1.length / 2);
        var text2X1 = (CANVAS_WIDTH / 2) - (glyphWidth * text2.length / 2);
        var text3X1 = (CANVAS_WIDTH / 2) - (glyphWidth * text3.length / 2);
        var text4X1 = (CANVAS_WIDTH / 2) - (glyphWidth * text4.length / 2);

        var menuItemPadding = 20;
        var text2Y1 = (CANVAS_HEIGHT - glyphHeight) / 2;
        var text1Y1 = text2Y1 - ((glyphHeight + menuItemPadding) / 2) - menuItemPadding;
        var text3Y1 = text2Y1 + ((glyphHeight + menuItemPadding) / 2) + menuItemPadding;
        var text4Y1 = text3Y1 + ((glyphHeight + menuItemPadding) / 2) + menuItemPadding;

        var padding = 30;
        var menuRectX = text4X1 - padding;
        var menuRectY = text1Y1 - padding;
        var menuRectWidth = (glyphWidth * text4.length) + padding;
        var menuRectHeight = (glyphHeight * 4) + (menuItemPadding * 3) + padding;

        var rect = this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0xffffff, 0);

        rect.setOrigin(0, 0);
        rect.setInteractive();

        var menuRect = this.add.rectangle(menuRectX, menuRectY, menuRectWidth, menuRectHeight, 0x000000, 0.5);

        menuRect.setOrigin(0, 0);
        menuRect.setInteractive();

        var menuItems = [];

        menuItems.push(new MenuItem({ scene: this, x: text1X1, y: text1Y1, glyphWidth: glyphWidth, glyphHeight: glyphHeight, text: text1, callBack: this.resumeGame }));
        menuItems.push(new MenuItem({ scene: this, x: text2X1, y: text2Y1, glyphWidth: glyphWidth, glyphHeight: glyphHeight, text: text2, callBack: null }));
        menuItems.push(new MenuItem({ scene: this, x: text3X1, y: text3Y1, glyphWidth: glyphWidth, glyphHeight: glyphHeight, text: text3, callBack: null }));
        menuItems.push(new MenuItem({ scene: this, x: text4X1, y: text4Y1, glyphWidth: glyphWidth, glyphHeight: glyphHeight, text: text4, callBack: null }))

        var self = this;

        menuRect.on('pointerdown', function (pointer) {
            for (var i = 0; i < menuItems.length; i++) {
                var currentMenuItem = menuItems[i];
                if (currentMenuItem.cursorIsHover(pointer.x, pointer.y)) {
                    self.setCursorLink(false);
                    self.setCursorLinkDown();
                    currentMenuItem.callBack();
                }
            }
        });

        menuRect.on('pointerup', function (pointer) {
            for (var i = 0; i < menuItems.length; i++) {
                var currentMenuItem = menuItems[i];
                if (currentMenuItem.cursorIsHover(pointer.x, pointer.y)) {
                    currentMenuItem.hover();
                    self.setCursorLink(true);
                    break;
                } else {
                    currentMenuItem.unHover();
                    self.setCursorLink(false);
                }
            }
        });

        rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, function (pointer) {
            for (var i = 0; i < menuItems.length; i++) {
                var currentMenuItem = menuItems[i];
                if (currentMenuItem.cursorIsHover(pointer.x, pointer.y)) {
                    currentMenuItem.hover();
                    self.setCursorLink(true);
                    break;
                } else {
                    currentMenuItem.unHover();
                    self.setCursorLink(false);
                }
            }
        });        

        menuRect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, function (pointer) {
            for (var i = 0; i < menuItems.length; i++) {
                var currentMenuItem = menuItems[i];
                if (currentMenuItem.cursorIsHover(pointer.x, pointer.y)) {
                    currentMenuItem.hover();
                    self.setCursorLink(true);
                    break;
                } else {
                    currentMenuItem.unHover();
                    self.setCursorLink(false);
                }
            }
        });   
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
        game.scene.resume(currentSceneKey);
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

        var fontLoader = new FontLoader();

        this.menuHoverText = fontLoader.displayText(this.scene, "SuperTuxBigFontColored", this.x, this.y, this.text, 0xab4242);
        this.menuText = fontLoader.displayText(this.scene, "SuperTuxBigFont", this.x, this.y, this.text);
    }

    cursorIsHover(x, y) {
        return x >= this.x - this.glyphWidth / 2 && y >= this.y - this.glyphHeight / 2 && x <= this.x - this.glyphWidth / 2 + this.width && y <= this.y - this.glyphHeight / 2 + this.height;
    }

    hover() {
        //this.tint = 0x0000FF;this.tint = [0xFFFFFF, 0xFF0000, 0xFFFFFF, 0x00FF00, 0xFFFFFF, 0x0000FF][this.invincibleIndex];
        this.menuText.hide();
        this.menuHoverText.show();
        this.wasAlreadyInThis = true;
    }

    unHover() {
        this.menuText.show();
        this.menuHoverText.hide();
        this.wasAlreadyInThis = false;
    }
}
