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
                this.bottom = config.bottom - config.top;
            }
        }
    }

    width() {
        return this.width;
    }

    height() {
        return this.height;
    }

    right() {
        return this.left + this.width;
    }

    bottom() {
        return this.top + this.height;
    }

    grown(border) {
        return new Rect(
            this.left - border,
            this.top - border,
            this.right + border,
            this.bottom + border);
    }

    move(v) {
        this.left += v.x;
        this.top += v.y;
        console.log(v.x);
        console.log(v.y);
    }

    overlaps(other) {
        if (this.right < other.left || this.left > other.right)
            return false;
        if (this.bottom < other.top || this.top > other.bottom)
            return false;

        return true;
    }

    static fromSprite(sprite) {
        return new Rect(sprite.x, sprite.y, sprite.width, sprite.height);
    }
}