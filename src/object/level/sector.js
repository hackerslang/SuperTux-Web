import { TilemapParser } from './tilemap_parser.js';
import { JsonFetcher } from '../json_fetcher.js';
import { Level } from './level.js';
import { SectorSwapper } from './sector_swapper.js';
import { SectorScene } from '../../scenes/sectorscene.js';
import { Tilemap } from './tilemap.js';

export class Sector {
    constructor(sectorData, level) {
        this.name = sectorData.name;
        this.sectorData = sectorData;
        this.originalTileData = sectorData.tilemaps[0].data.slice();
        this.level = level;
        this.sectorWidth = this.sectorData.tilemaps[0].data[0].length * 32;
        this.sectorHeight = this.sectorData.tilemaps[0].data.length * 32;
    }

    static async getSectorName(levelKey, sectorKey) {
        var sectorData = await JsonFetcher.getJsonObject("./assets/data/levels/" + levelKey + "/" + sectorKey + ".json");

        return sectorData.name;
    }

    static currentSector = null;
    static getCurrentSector() {
        return Sector.currentSector;
    }

    static getCurrentSectorWidth() {
        return Sector.currentSector.sectorWidth;
    }

    static getCurrentSectorHeight() {
        return Sector.currentSector.sectorHeight;
    }

    getOriginalTileData(x, y) {
        if (y < 0 || y >= this.originalTileData.length || x < 0 || x >= this.originalTileData[0].length) {
            return null;
        }

        return this.originalTileData[y][x];
    }

    getTileData() {
        return this.sectorData.tilemaps[0].data;
    }

    getTileDataValue(x, y) {
        return this.sectorData.tilemaps[0].data[y][x];
    }

    setTileDataValue(x, y, val) {
        this.sectorData.tilemaps[0].data[y][x] = val;
    }

    getSolidTilemaps() {
        var w = Sector.getCurrentSectorWidth();
        var h = Sector.getCurrentSectorHeight();

        return this.sectorData.tilemaps.filter((tilemap) => tilemap.solid).map((tilemap) => new Tilemap({ width: w * 32, height: h * 32 }));
    }

    getData() {
        return this.sectorData;
    }

    getInvisibleWalls() {
        return this.sectorData.invisibleBlocks;
    }

    getCustomGravity() {
        return this.sectorData.gravity;
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

    getFirstLineIntersection(lineStart, lineEnd, ignore, ignoreObject) {
        return SectorSwapper.getCurrentSectorSceneObject().collisionSystem.getFirstLineIntersection(lineStart, lineEnd, ignore, ignoreObject);
    }

    getBackgroundImage() {
        return this.sectorData.backgroundImage;
    }

    getBackgroundImageScale() {
        return this.sectorData.backgroundScale;
    }

    getBackgroundObjects() {
        return this.additionalTiles.backgroundObjects;
    }

    getFallingPlatforms() {
        return this.sectorData.fallingPlatforms;
    }

    getMovablePlatforms() {
        return this.sectorData.movablePlatforms;
    }

    getEvents() {
        return this.sectorData.events;
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

    getMovablePlatforms() {
        return this.additionalTiles.movablePlatforms;
    }

    getDynamicForegrounds() {
        return this.sectorData.dynamicForegrounds;
    }

    getFillTilesForegrounds() {
        return this.sectorData.fillTilesForegrounds;
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

    parseAdditionalTilemaps() {
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