export class ImageButton {
    constructor(config) {
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.texture = config.texture;
        this.hoverTexture = config.hoverTexture;
        this.callBack = config.callBack;

        this.init();
    }

    init() {
        this.normalSprite = this.addSprite(this.texture);
/*        this.hoverSprite = this.addSprite(this.hoverTexture);*/
        this.unHover();
        this.createRect();
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

    addSprite(texture) {
        var sprite = this.scene.add.sprite(this.x, this.y, texture);

        sprite.setInteractive();
        sprite.setOrigin(0, 0);
        sprite.setSize(this.width, this.height);
        
        this.scene.add.existing(sprite);

        return sprite;
    }

    hover() {
        this.normalSprite.setAlpha(1.0);
    }

    unHover() {
        this.normalSprite.setAlpha(0.5);
    }

    //unHover() {
    //    this.normalSprite.visible = true;
    //    this.hoverSprite.visible = false;
    //}

    //hover() {
    //    this.hoverSprite.visible = true;
    //    this.normalSprite.visible = false;
    //}
}

export class ClickableHoverableRecangle {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.scene = config.scene;
        this.pointerDown = false;
        this.item = config.item;
        this.clickCallBack = config.clickCallBack;

        this.init();
    }

    init() {
        var self = this;
        //Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE
        this.rect = this.scene.add.rectangle(this.x, this.y, this.width, this.height, 0xffffff, 0);
        this.rect.setOrigin(0, 0);
        this.rect.setInteractive();
        this.rect.on("pointerover", function (pointer) {
            self.item.hover();
        });
        this.rect.on("pointerout", function (pointer) {
            self.item.unHover();
        });
        this.rect.on('pointerdown', function (pointer) {
            self.pointerDown = true;
        });
        this.rect.on('pointerup', function (pointer) {
            if (self.pointerDown) {
                self.clickCallBack(self.item.id);
                self.pointerDown = false;
            }
        });
    }
}