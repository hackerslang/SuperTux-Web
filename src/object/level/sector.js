import { TilemapParser } from './tilemap_parser.js';
import { JsonFetcher } from '../json_fetcher.js';
import { Level } from './level.js';

export class Sector {
    constructor(sectorData, level) {
        this.name = sectorData.name;
        this.sectorData = sectorData;
        this.originalTileData = sectorData.data.slice();
        this.level = level;
        this.tilemapParser = new TilemapParser(this, this.sectorData);
        this.sectorWidth = this.sectorData.data[0].length * 32;
    }

    static async getSectorName(levelKey, sectorKey) {
        var sectorData = await JsonFetcher.getJsonObject("./assets/data/levels/" + levelKey + "/" + sectorKey + ".json");

        return sectorData.name;
    }

    static currentSector = null;
    static getCurrentSector() {
        return Sector.currentSector;
    }

    getOriginalTileData(x, y) {
        return this.originalTileData[y][x];
    }

    getTileData() {
        return this.sectorData.data;
    }

    getTileDataValue(x, y) {
        return this.sectorData.data[y][x];
    }

    setTileDataValue(x, y, val) {
        this.sectorData.data[y][x] = val;
    }

    getData() {
        return this.sectorData;
    }

    getInvisibleWalls() {
        return this.sectorData.invisibleBlocks;
    }

    makeCurrent() {
        Level.currentLevel = this.level;
        Sector.currentSector = this;
    }

    preload() {

    }

    create() {
        //this.setPlayer();
    }

    getLevel() {
        return this.level;
    }

    getPlayer() {
        return this.player;
    }

    getBackgroundImage() {
        return this.sectorData.backgroundImage;
    }

    getBackgroundObjects() {
        return this.additionalTiles.backgroundObjects;
    }

    getFallingPlatforms() {
        return this.sectorData.fallingPlatforms;
    }

    getEnemyObjects() {
        return this.additionalTiles.enemies;
    }

    getLava() {
        return this.additionalTiles.lava;
    }

    getCoinTiles() {
        return this.additionalTiles.coins;
    }

    getHurtableTiles() {
        return this.additionalTiles.hurtableTiles;
    }

    getCollisionTiles() {
        return this.additionalTiles.collisionTiles;
    }

    getDynamicForegrounds() {
        return this.sectorData.dynamicForegrounds;
    }

    getStaticForegrounds() {
        return this.sectorData.staticForegrounds;
    }

    getTilesets() {
        return this.sectorData.tilesets;
    }

    createPreloadedBackGroundObject(i, j, offsetI, offsetJ, type) {
        let backgroundObject = {
            type: type,
            x: i * 32 + offsetI,
            y: j * 32 + offsetJ
        }

        this.preloadedBackgroundImages.push(backgroundObject);
        this.level[j][i] = 0;
    }

    createPreloadedSpike(i, j, position) {
        let spike = {
            position: position,
            x: i * 32,
            y: j * 32
        };

        this.preloadedSpikes.push(spike);
    }




    //parseBlockLayer() {
    //    var blockSprites = [];
    //    for (var i = 0; i < this.additionalTiles.collisionTiles.length; i++) {
    //        var preloadedBlock = this.additionalTiles.collisionTiles[i]; { };

    //        let block = {};

    //        if (preloadedBlock.type == "bonus-block") {
    //            block = new BonusBlock({
    //                id: i,
    //                key: "bonus-block-" + i,
    //                scene: this.scene,
    //                x: preloadedBlock.x,
    //                y: preloadedBlock.y,
    //                player: this.player,
    //                level: this,
    //                powerupType: preloadedBlock.powerupType,
    //                content: preloadedBlock.content,
    //                hitCounter: preloadedBlock.hitCounter
    //            });
    //        } else if (preloadedBlock.type == "brick") {
    //            block = new Brick({
    //                id: i,
    //                key: "brick" + i,
    //                scene: this.scene,
    //                x: preloadedBlock.x,
    //                y: preloadedBlock.y,
    //                brickSprite: preloadedBlock.brickSprite,
    //                player: this.player,
    //                level: this
    //            });
    //        }

    //        this.blockGroup.add(block);
    //        blockSprites.push(block);
    //    }

    //    this.blockSprites = blockSprites;
    //}



    



    

    parseTilemaps() {
        this.additionalTiles = this.tilemapParser.parse();
    }


    createPreloadedPlainWater(currentTile, i, j, tile, preloadedArray) {
        if (!this.waterStart) {
            let firstWater = {
                type: 'plain',
                x: (i - 1) * 32,
                y: j * 32
            }

            this.waterStart = true;

            preloadedArray.push(firstWater);
        }

        let preloadedWater = {
            type: 'plain',
            x: i * 32,
            y: j * 32
        }

        preloadedArray.push(preloadedWater);

        if (this.level[j][i + 1] != tile) {
            let lastWater = {
                type: 'plain',
                x: (i + 1) * 32,
                y: j * 32
            }

            this.waterStart = false;

            preloadedArray.push(lastWater);
        }

        this.level[j][i] = 0;
    }

    createPreloadedPlainAntarcticWater(currentTile, i, j) {
        this.createPreloadedPlainWater(currentTile, i, j, this.PLAIN_WATER_TILE, this.preloadedAntarcticWaters);
    }

    createPrelaodedPlainLava(currentTile, i, j) {
        this.createPreloadedPlainWater(currentTile, i, j, this.PLAIN_LAVA_TILE, this.preloadedLavas);
    }

    parseWayArrowLayer() {
        for (var i = 0; i < this.preloadedWayArrows.length; i++) {
            let preloadedWayArrow = this.preloadedWayArrows[i];

            this.addWayArrow(preloadedWayArrow.x, preloadedWayArrow.y, preloadedWayArrow.position);
        }
    }

    addSpike(x, y, position) {
        let spike = new Spike({
            scene: this.scene,
            key: 'spike',
            x: x,
            y: y,
            position: position,
            player: this.player,
            landscape: this.landscape,
            sector: this
        });

        this.spikeGroup.add(spike);
    }

    addStar(x, y, direction) {
        let star = new StarPowerUp({
            scene: this.scene,
            key: "star",
            x: x,
            y: y,
            player: this.player,
            sector: this,
            direction: direction
        });

        this.powerupGroup.add(star);
    }

    addBrickPiece(x, y) {

    }




}