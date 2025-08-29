import { HorizontalLine, ImageButton } from "./menu.js";

export class Dialog {
    constructor(config) {
        this.init(config);
    }

    init(config) {
        this.scene = config.scene;

        this.originX = config.originX || 0.5;
        this.originY = config.originY || 0.5;
        this.width = config.width;
        this.height = config.height;
        this.x = config.x - (this.originX * this.width);
        this.y = config.y - (this.originY * this.height);

        this.borderColor = config.borderColor || 0x000000; // 0x9cc1ca;
        this.color1 = config.color1 || 0x445961;
        this.color2 = config.color2 || 0x323c41;

        this.titleTexture = config.titleTexture || null;
        this.descriptionTexture = config.descriptionTexture || null;
        this.descriptionText = config.descriptionText || "";
        this.backgroundTexture = config.backgroundTexture || "dialog-bg";

        this.buttons = [];
    }

    show() {
        this.createGradientRectangle();
        this.addTitle();
        this.addHorizontalLine();
        this.addDescription();
        this.drawButtons();
        this.scene.setDialogActive(true);
    }

    addTitle() {
        this.title = this.scene.add.sprite(this.x + 20, this.y + 10, this.titleTexture).setOrigin(0, 0);
        this.title.setScale(0.7);
        this.title.setOrigin(0, 0);
    }

    addHorizontalLine() {
        this.line = new HorizontalLine({
            scene: this.scene,
            x: this.x + 20,
            y: this.y + 38,
            width: this.width - 40,
            scale: 0.7,
            originX: 0,
            originY: 0
        });
    }

    addDescription() {
        if (this.descriptionText !== "") {
            // add text
        } else if (this.descriptionTexture !== null) {
            // add image
            this.description = this.scene.add.sprite(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.descriptionTexture);
            this.description.setScale(0.7);
        }
    }
    
    createGradientRectangle() {
        this.dialogBackground = this.scene.add.sprite(this.x, this.y, this.backgroundTexture);
        
        this.dialogBackground.displayHeight = this.height;
        this.dialogBackground.displayWidth = this.width * 0.665; //why this is, I don't know!
        //this.dialogBackground.body.setOffset(0, 0);
        this.dialogBackground.setOrigin(0, 0);
        //this.dialogBackground.setOrigin(this.originX, this.originY);

        this.graphics = this.scene.add.graphics();

        // this.graphics.setShadow(4, 4, '#000', 8, false, false);
        
        this.graphics.lineStyle(0.5, this.borderColor, 1);
        this.graphics.strokeRect(this.x, this.y, this.width, this.height);
        this.graphics.postFX.addShadow(3, 3, 0x000000, 1, 3);
    }

    setPositionX(x) {
        var positionX = x + (this.width * this.originX);

        return positionX;
    }

    setPositionY(y) {
        var positionY = y + (this.height * this.originY);

        return positionY;
    }

    drawButtons() {

    }

    close() {
        this.title.destroy();
        this.line.destroy();
        this.dialogBackground.destroy();
        this.description.destroy();
        this.graphics.destroy(true);
        this.destroyButtons();
        this.scene.setDialogActive(false);
    }

    destroyButtons() {
        this.buttons.forEach(button => button.destroy());
    }
}

export class ConfirmDialog extends Dialog {
    constructor(config) {
        super(config);
        this.init(config);
    }

    init(config) {
        super.init(config);
        this.onConfirm = config.onConfirm || function () { };
        this.onCancel = config.onCancel || this.close;
    }

    show() {
        super.show();
        this.addButtons();
    }

    addButtons() {
        const buttonWidth = 100;
        const buttonHeight = 40;
        const padding = 20;
        const buttonScale = 0.5;
        const confirmButtonWidth = 108;
        const cancelButtonWidth = 122;
        const confirmButtonRealWidth = confirmButtonWidth * buttonScale;
        const cancelButtonRealWidth = cancelButtonWidth * buttonScale;

        const confirmButtonX = this.x + (this.width / 2) - confirmButtonRealWidth - padding;

        var confirmButton = new ImageButton(
            {
                scene: this.scene,
                x: this.x + this.width / 4,
                y: this.y + this.height - padding,
                width: buttonWidth,
                height: buttonHeight,
                originX: 0.5,
                originY: 0.5,
                scale: 0.7,
                texture: 'yes',
                hoverTexture: 'yes-hover',
                callBack: this.onConfirm
            });

        var cancelButton = new ImageButton(
            {
                scene: this.scene,
                x: this.x + this.width * 3 / 4,
                y: this.y + this.height - padding,
                width: buttonWidth,
                height: buttonHeight,
                originX: 0.5,
                originY: 0.5,
                scale: 0.7,
                texture: 'no',
                hoverTexture: 'no-hover',
                callBack: this.onCancel
            });

        this.buttons.push(confirmButton);
        this.buttons.push(cancelButton);
    }

    close() {
        super.close();
    }
}