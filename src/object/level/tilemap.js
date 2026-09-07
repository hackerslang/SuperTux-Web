import { Tile } from './tile.js';

export class Tilemap {
    constructor(config) {
        this.width = config.width;
        this.height = config.height;
        this.solid = config.solid !== undefined ? config.solid : false;
    }

    isOutsideBounds(pos) {
        var pos_ = (pos /*- this.getOffset()*/) / 32;
        var width = parseFloat(this.width);
        var height = parseFloat(this.height);

        return pos_.x < 0 || pos_.x >= width || pos_.y < 0 || pos_.y >= height;
    }

    getTileAtInside(x, y) {
        return Tile.getTileAtInside(x, y);
    }

    getTileAt(x, y) {
        return Tile.getTileAt(x, y);
    }
}