import { Sector } from './sector.js';

export const SLOPE = 0x0010;

export class SlopeTiles {
    constructor(config) {

    }
}

export class Tile {
    constructor(config) {
        this.index = config.index;
        this.attributes = config.attributes;
        this.data = config.data;
    }

    isSlope() {
        return this.attributes & SLOPE;
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