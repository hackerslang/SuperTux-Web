export class Rect {
    constructor(config) {
        if (config == undefined) {
            this.left = 0;
            this.right = 0;
            this.top = 0;
            this.bottom = 0;
        } else {
            this.left = config.left || 0;
            this.top = config.top || 0;

            if (config.width !== undefined && config.height !== undefined) {
                this.width = config.width;
                this.height = config.height;
            } else {
                this.width = config.right - config.left;
                this.height = config.bottom - config.top;
            }
        }
    }

    setWidth(width) {
        this.width = width;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getRight() {
        return this.right !== undefined ? this.right : this.left + this.width;
    }

    getBottom() {
        return this.bottom !== undefined ? this.bottom : this.top + this.height;
    }

    grown(border) {
        return new Rect({
            left: this.left - border,
            top: this.top - border,
            right: this.getRight() + border,
            bottom: this.getBottom() + border
        });
    }

    move(v) {
        this.left += v.x;
        this.top += v.y;
    }

    overlaps(other) {
        if (this.getRight() < other.left || this.left > other.getRight())
            return false;
        if (this.getBottom() < other.top || this.top > other.getBottom())
            return false;

        return true;
    }

    static fromSprite(sprite) {
        return new Rect({ left: sprite.x, top: sprite.y, width: sprite.width, height: sprite.height });
    }
}