export class ControlField {
    constructor(config) {
        this.scene = config.scene;

        this.keyCaption = config.keyCaption;
        this.defaultKeyBinding = config.defaultKeyBinding;
        this.keyBinding = this.defaultKeyBinding;

        config.callBack = this.focus();

        this.textButton = new TextButton(config);
        this.textButton.updateText(this.defaultKeyBinding);
        this.flicker = false;
    }

    update(time, delta) {
        if (this.isFocused) {
            for (var i = 0; i < KeyCaptions.length; i++) {
                if (this.scene.keys[KeyCaptions[i].key].isDown) {
                    this.keyBinding = KeyCaptions[i].caption;
                    this.textButton.updateText(this.keyBinding);
                    this.isFocused = false;
                    break;
                }
            }

            this.flickerUnderscore(delta);
        }
    }

    flickerUnderscore(delta) {
        if (delta < 100) { return; }

        this.flicker = !this.flicker;

        if (this.flicker) {
            this.textButton.updateText("_");
        } else {
            this.textButton.updateText("");
        }
    }

    focus() {
        if (!this.isFocused) {
            this.isFocused = true;
        } else {
            this.isFocused = false;
            this.updateText(this.defaultKeyBinding);
        }
    }

    unFocus() {

    }

    restoreDefault() {
        this.keyBinding = this.defaultKeyBinding;
        this.textButton.updateText()
        this.unFocus();
    }
}