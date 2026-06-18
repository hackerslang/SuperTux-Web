import { Sector } from './sector.js';
import { Rect } from '../../math/rect.js';

// solid tile that is indestructible by Tux
export const SOLID = 0x0001;
// uni-directional solid tile
export const UNISOLID = 0x0002;
// slope tile
export const SLOPE = 0x0010;
// interesting flags (the following are passed to gameobjects)
export const FIRST_INTERESTING_FLAG = 0x0100;
// an ice brick that makes tux sliding more than usual
export const ICE = 0x0100;
// a water tile in which tux starts to swim
export const WATER = 0x0200;
// a tile that hurts Tux if he touches it
// to be used for spikes?? I think not, because spikes are sprites!
export const HURTS = 0x0400;
// for lava: WATER, HURTS, FIRE, for lava?? I think not!
export const FIRE = 0x0800;
// a walljumping trigger tile, to be used?? I think not, we use sprites & classes for that!
export const WALLJUMP = 0x1000;

export class SlopeTiles {
    constructor(config) {

    }
}

export class Tile {
    constructor(config) {
        this.index = config.index;
        this.attributes = config.attributes;
        this.data = config.data;

        this.isTile = true;
    }

    isSlope() {
        return this.attributes & SLOPE;
    }

    getTileBbox() {
        return new Rect({ left: this.x * 32, top: this.y * 32, right: (this.x + 1) * 32, bottom: (this.y + 1) + 32 });
    }

    static getTilesOverlapping(rect) {
        var left = Math.max(0, Math.floor(rect.left / 32));
        var right = Math.min(Sector.getCurrentSector().sectorData.width - 1, Math.ceil(rect.right / 32));
        var top = Math.max(0, Math.floor(rect.top / 32));
        var bottom = Math.min(Sector.getCurrentSector().sectorData.height - 1, Math.ceil(rect.bottom / 32));

        return new Rect({ left: left, top: top, right: right, bottom: bottom });
    }

    static getTileAtInside(x, y) {
        const tileX = Math.floor(x / 32);
        const tileY = Math.floor(y / 32);

        return getTileAt(tileX, tileY);
    }

    static getTileAt(x, y) {
        var sectorData = Sector.getCurrentSector().sectorData;
        var data = sectorData.data;
        var tilesets = sectorData.tilesets;
        
        var tileIndex = data[y][x];

        for (var i = 0; i < tilesets.length; i++) {
            var tileset = tilesets[i];
            
            if (tileIndex >= tileset.firstgid && tileIndex < tileset.lastgid) {
                var tile = new Tile({
                    attributes: tileset.attributes[tileIndex - tileset.firstgid],
                    data: tileset.datas[tileIndex - tileset.firstgid]
                });

                return tile;  
            }
        }

        return null;
    }

    static async getTileDataAndAttributes() {
        var currentSector = Sector.getCurrentSector();
        var sectorData = currentSector.sectorData;
        var tilesets = sectorData.tilesets;
        var newTilesets = [];

        for (var i = 0; i < tilesets.length; i++) {
            var tileset = tilesets[i];
            var tileJsonUrl = tileset.jsonUrl;

            if (tileJsonUrl === undefined) {
                tileJsonUrl = tileset.value.substring(0, tileset.value.lastIndexOf('.')) + '.json';
            }

            if (tileJsonUrl !== null) {
                try {
                    const response = await fetch(tileJsonUrl);

                    if (!response.ok) {
                        continue;
                    }

                    const json = await response.json();

                    tileset.attributes = json.attributes;
                    tileset.datas = json.datas;
                } catch (error) {
                    continue;
                }
            }

            newTilesets.push(tileset);
        }

        return newTilesets;
    }

    static async getSlopeTiles() {
        var tilesetsWithAttributes = await this.getTileDataAndAttributes();
        var slopeTiles = [];

        for (var i = 0; i < tilesetsWithAttributes.length; i++) {
            var tileset = tilesetsWithAttributes[i];

            if (tileset.attributes === undefined || tileset.datas === undefined) { continue; }

            var attributes = tileset.attributes;
            var datas = tileset.datas;
            var start = 0;
            var end = tileset.lastgid - tileset.firstgid;

            for (var j = start; j < end && j < attributes.length && j < datas.length; j++) {
                var attribute = attributes[j];
                var slopeData = datas[j];

                if (attribute & SLOPE) {
                    var slopeTile = new Tile({
                        index: tileset.firstgid + j,
                        attributes: attribute,
                        data: slopeData
                    });

                    slopeTiles.push(slopeTile);
                }
            }
        }

        return slopeTiles;
    }
}