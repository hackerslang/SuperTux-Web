export class HorizontalLine {
    constructor(config) {
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.totalWidth = config.width;
        this.scale = config.scale !== undefined ? config.scale : 1;
        this.originX = config.originX !== undefined ? config.originX : 0;
        this.originY = config.originY !== undefined ? config.originY : 0;
        this.MIN_WIDTH = 100;

        this.draw();
    }

    draw() {
        const tempLeft = this.scene.add.sprite(0, 0, "hl-mblur-left");
        const capWidth = tempLeft.displayWidth;
        const height = tempLeft.displayHeight;
        tempLeft.destroy();

        const tempRight = this.scene.add.sprite(0, 0, "hl-mblur-right");
        const rightCapWidth = tempRight.displayWidth;
        tempRight.destroy();

        const realX = this.x - (this.totalWidth * this.originX);
        const realY = this.y - (height * this.originY);

        this.hlLeft = this.scene.add.sprite(realX, realY, "hl-mblur-left");
            
        this.hlLeft.displayWidth = capWidth * this.scale;
        this.hlLeft.displayHeight = height * this.scale;
        this.hlLeft.setOrigin(0, 0);

        const midX = realX + this.hlLeft.displayWidth; // ok till here
        const remainderWidth = (this.totalWidth - ((capWidth + rightCapWidth) * this.scale));
        this.hlMid = this.scene.add.sprite(midX, realY, "hl-mid");

        this.hlMid.displayWidth = remainderWidth * 0.665; // why this is, I don't know!
        this.hlMid.displayHeight = height * this.scale;
        this.hlMid.setOrigin(0, 0);

        this.hlRight = this.scene.add.sprite(midX + remainderWidth, realY, "hl-mblur-right");

        this.hlRight.displayWidth = rightCapWidth * this.scale;
        this.hlRight.displayHeight = height * this.scale;
        this.hlRight.setOrigin(0, 0);
    }

    destroy() {
        this.hlLeft.destroy();
        this.hlMid.destroy();
        this.hlRight.destroy();
    }
}

export class ImageButton {
    constructor(config) {
        this.scene = config.scene;
        this.cursor = this.scene.cursor;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 150;
        this.height = config.height || 20;
        this.scale = config.scale || 1;
        this.originX = config.originX || 0,
        this.originY = config.originY || 0,
        this.texture = config.texture;
        this.hoverTexture = config.hoverTexture;
        this.focusTexture = config.focusTexture || this.hoverTexture;
        this.callBack = config.callBack;
        this.smooth = config.smooth || false;

        this.realWidth = this.width * this.scale;
        this.realHeight = this.height * this.scale;

        this.init();
    }

    init() {
        this.normalSprite = this.addSprite(this.texture);
        this.hoverSprite = this.addSprite(this.hoverTexture);
        this.focusSprite = this.addSprite(this.focusTexture);
        this.setSize();
        this.unHover();
        this.createRect();
        this.setSmooth();
    }

    createRect() {
        this.rect = new ClickableHoverableRecangle({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            originX: this.originX,
            originY: this.originY,
            clickCallBack: this.callBack,
            scene: this.scene,
            item: this
        });
    }

    setSmooth() {
        this.normalSprite.smooth = this.smooth;
        this.hoverSprite.smooth = this.smooth;
        this.focusSprite.smooth = this.smooth;
    }

    addSprite(texture) {
        var sprite = this.scene.add.sprite(this.x, this.y, texture);

        sprite.setInteractive();
        sprite.setOrigin(this.originX, this.originY);
        sprite.scale = this.scale;
        
        this.scene.add.existing(sprite);

        return sprite;
    }

    setSize() {
        if (this.width === undefined) { this.width = this.normalSprite.width; }
        if (this.height === undefined) { this.height = this.normalSprite.height; }
    }

    hover() {
        this.normalSprite.setAlpha(0);
        this.focusSprite.setAlpha(0);
        this.hoverSprite.setAlpha(1.0);
    }

    unHover() {
        this.focusSprite.setAlpha(0);
        this.hoverSprite.setAlpha(0);
        this.normalSprite.setAlpha(1.0);
    }

    focus() {
        this.normalSprite.setAlpha(0);
        this.hoverSprite.setAlpha(0);
        this.focusSprite.setAlpha(1.0);
    }

    destroy() {
        this.normalSprite.destroy();
        this.hoverSprite.destroy();
        this.focusSprite.destroy();
        this.rect.destroy();
    }
}

export class ClickableHoverableRecangle {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.scene = config.scene;
        this.cursor = this.scene.cursor;
        this.pointerDown = false;
        this.originX = config.originX || 0;
        this.originy = config.originY || 0;
        this.item = config.item;
        this.clickCallBack = config.clickCallBack;

        this.init();
    } 

    init() {
        this.rect = this.scene.add.rectangle(this.x, this.y, this.width, this.height, this.color1, 0);
        this.rect.setOrigin(this.originX, this.originY);
        this.rect.setInteractive();

        var self = this;

        this.rect.on("pointerover", function (pointer) {
            self.item.hover();
            self.cursor.setCursorLink(true);
        });
        this.rect.on("pointerout", function (pointer) {
            self.item.unHover();
            self.cursor.setCursorLink(false);
        });
        this.rect.on('pointerdown', function (pointer) {
            self.item.focus();
            self.cursor.setCursorDown();
            self.pointerDown = true;
        });
        this.rect.on('pointerup', function (pointer) {
            if (self.pointerDown) {
                self.cursor.setCursorUp();
                self.clickCallBack(self.item.id);
            }
        });
    }

    destroy() {
        this.rect.destroy();
    }
}

export class ClickableHoverablePolygon {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.scene = config.scene;
        this.cursor = this.scene.cursor;
        this.pointerDown = false;
        this.item = config.item;
        this.clickCallBack = config.clickCallBack;
        this.color = config.color || 0x97cddf; 
        this.color2 = config.color2 || this.color;
        this.hasGradient = this.color2 !== undefined;

        this.init();
    }

    init() {
        var self = this;

        if (this.color2 !== undefined) {

        }

        var x1 = this.x;
        var y1 = this.y + (this.height / 2);

        var x2 = this.x + (this.height / 2);
        var y2 = this.y;

        var x3 = this.x + this.width - (this.height / 2);
        var y3 = this.y;

        var x4 = this.x + this.width;
        var y4 = y1;

        var x5 = x3;
        var y5 = this.y + this.height;

        var x6 = x2;
        var y6 = y5;

        this.polygon = new Phaser.Geom.Polygon([
            x1, y1,
            x2, y2,
            x3, y3,
            x4, y4,
            x5, y5,
            x6, y6
        ]);

        const graphics = this.scene.add.graphics();

        graphics.lineStyle(0.3, 0xdddddd);
        graphics.beginPath();

        graphics.moveTo(x1, y1);
        for (let i = 1; i < this.polygon.points.length; i++) {
            graphics.lineTo(this.polygon.points[i].x, this.polygon.points[i].y);
        }

        graphics.closePath();
        graphics.strokePath();

        //for (let i = 8; i >= 2; i -= 2) {
        //    graphics.lineStyle(i, 0xeeeeeee, 0.08 * (i / 2)); // blue glow, adjust color/alpha as needed
        //    graphics.strokePoints(this.polygon.points, true);
        //}

        this.rect = this.scene.add.rectangle(this.x, this.y, this.width, this.height, this.color1, 0);
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

    createGradientFill() {
        const color1 = Phaser.Display.Color.ValueToColor(this.color1);
        const color2 = Phaser.Display.Color.ValueToColor(this.color2);
        const interpolatedColor = Phaser.Display.Color.Interpolate.ColorWithColor(color1, color2, 100, 100);
        return Phaser.Display.Color.GetColor(interpolatedColor.r, interpolatedColor.g, interpolatedColor.b);
    }
}
