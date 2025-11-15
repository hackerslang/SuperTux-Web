export class Cursor {
    constructor(config) {
        this.scene = config.scene;
        this.currentCursor = "default";

        this.defaultCursorTexture = "./assets/images/ui/cursor/mousecursor.png";
        this.linkCursorTexture = "./assets/images/ui/cursor/mousecursor-link.png";
        this.downCursorTexture = "./assets/images/ui/cursor/mousecursor-click.png";

        this.idleTimeout = 3000;
        this.idleTimer = this.idleTimeout;

        this.scene.input.on('pointermove', this.onMove, this);

        this.setDefaultCursor();
    }

    setDefaultCursor() {
        this.scene.input.setDefaultCursor(`url(${this.defaultCursorTexture}), pointer`);
        this.currentCursor = "default";
    }

    setCursorLink(bool) {
        if (this.currentCussor !== "hidden") {
            if (bool) {
                if (this.currentCursor == "default") {
                    this.scene.input.setDefaultCursor(`url(${this.linkCursorTexture}), pointer`);
                    this.currentCursor = "link-hover";
                }
            } else {
                this.setDefaultCursor();
            }
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

    showCursorAgain() {
        this.setDefaultCursor();
        this.idleTimer = this.idleTimeout;
    }

    hideCursor() {
        if (this.currentCursor !== "link-down") {
            this.scene.input.setDefaultCursor('none');
            this.currentCursor = "hidden";
        }
    }

    onMove() {
        if (this.currentCursor === "hidden") {
            this.showCursorAgain();
        }
    }

    update(time, delta) {
        if (this.idleTimer > 0) {
            this.idleTimer -= delta;
        }

        if (this.currentCursor === "link-down") {
            this.idleTimer = this.idleTimeout;
        }

        if (this.idleTimer <= 0) {
            this.hideCursor();
        }
    }
}