class PauseScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'PauseScene'
        });
    }

    preload() {
        const MENU_PATH = "./assets/images/ui/menu/";

        var menuItemNames = ['resume-game', 'load-game', 'exit-game'];

        for (var i = 0; i < menuItemNames.length; i++) {
            var currentName = menuItemNames[i];

            this.load.image(currentName, MENU_PATH + currentName + '.png');
            this.load.image(currentName + '-hover', MENU_PATH + currentName + '-hover.png');
        }
    }

    create() {
        var rect = this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0xffffff, 0);

        rect.setOrigin(0, 0);
        rect.setInteractive();

        const ANCHOR = 0.75;
        const WIDTH = 600 * ANCHOR;
        const HEIGHT = 84 * ANCHOR;

        const MENU_X = (CANVAS_WIDTH - WIDTH) / 2;
        const START_MENU_Y = (CANVAS_HEIGHT - (HEIGHT * 3) - 200) / 2;

        var menuItems = [];

        menuItems.push(new MenuItem({ scene: this, caption: 'resume', x: MENU_X, y: 300, width: WIDTH, height: START_MENU_Y, img: 'resume-game', hoverImg: 'resume-game-hover', callBack: this.resume }));
        menuItems.push(new MenuItem({ scene: this, caption: 'loadgame', x: MENU_X, y: 400, width: WIDTH, height: START_MENU_Y + 100, img: 'load-game', hoverImg: 'load-game-hover', callBack: null }));
        menuItems.push(new MenuItem({ scene: this, caption: 'exit', x: MENU_X, y: 500, width: WIDTH, height: START_MENU_Y + 200, img: 'exit-game', hoverImg: 'exit-game-hover', callBack: null }));

        for (var i = 0; i < menuItems.length; i++) {
            this.add.sprite(menuItems[i]);
        }

        rect.on('pointerdown', function (pointer) {
            for (var i = 0; i < menuItems.length; i++) {
                var currentMenuItem = menuItems[i];
                if (currentMenuItem.cursorIsHover(pointer.x, pointer.y)) {
                    currentMenuItem.callBack();
                }
            }
        });

        rect.on(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, function (pointer) {
            for (var i = 0; i < menuItems.length; i++) {
                var currentMenuItem = menuItems[i];
                if (currentMenuItem.cursorIsHover(pointer.x, pointer.y)) {
                    currentMenuItem.hover();

                    break;
                } else {
                    currentMenuItem.unHover();
                }
            }
        });
    }

    update(delta) {

    }

    resume() {
        game.scene.stop("PauseScene");
        game.scene.resume("GameScene");
    }
}

class MenuItem extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);

        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.img = config.img;
        this.hoverImg = config.hoverImg;
        this.callBack = config.callBack;

        this.setTexture(this.img);
        this.setScale(0.75);
        this.setOrigin(0, 0);
        this.wasAlreadyInThis = false;

        config.scene.add.existing(this);
    }

    cursorIsHover(x, y) {
        return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height;
    }

    hover() {
        this.setTexture(this.hoverImg);
        this.wasAlreadyInThis = true;
    }

    unHover() {
        this.setTexture(this.img);
        this.wasAlreadyInThis = false;
    }
}
