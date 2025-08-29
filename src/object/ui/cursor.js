export class Cursor {
    constructor(config) {
        this.scene = config.scene;
        this.currentCursor = "default";

        this.defaultCursorTexture = "./assets/images/ui/cursor/mousecursor.png";
        this.linkCursorTexture = "./assets/images/ui/cursor/mousecursor-link.png";
        this.downCursorTexture = "./assets/images/ui/cursor/mousecursor-click.png";

        this.setDefaultCursor();
    }

    setDefaultCursor() {
        this.scene.input.setDefaultCursor(`url(${this.defaultCursorTexture}), pointer`);
        this.currentCursor = "default";
    }

    setCursorLink(bool) {
        if (bool) {
            if (this.currentCursor == "default") {
                this.scene.input.setDefaultCursor(`url(${this.linkCursorTexture}), pointer`);
                this.currentCursor = "link-hover";
            }
        } else {
            this.setDefaultCursor();
        }
    }

    setCursorDown() {
        if (this.currentCursor !== "link-down") {
            this.scene.input.setDefaultCursor(`url(${this.downCursorTexture}), pointer`);
            this.currentCursor = "link-down";
        }
    }

    setCursorUp() {
        if (this.currentCursor == "link-hover") {
            this.setCursorLink(true);
        } else {
            this.setDefaultCursor();
        }
    }
}