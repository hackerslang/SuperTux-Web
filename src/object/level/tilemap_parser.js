import { Sector } from './sector.js';
import { SpriteKeyConstants } from './tile_creator.js';

export var TilemapConstants = {
    COIN: 'c',
    HELL_COIN: 'hc',
    CLOUD: 'cloud',
    PILE_OF_SNOW: 'pile-of-snow',
    GRASS1: 'grass1',
    GRASS2: 'grass2',
    PLAIN_WATER_TILE: 'wa',
    TOP_WATER_TILE: 'wa2',
    PLAIN_LAVA_TILE: 'la',
    TOP_LAVA_TILE: 'la2',
    SPIKE_START_PART: 'spk-',
    SPIKE_DOWN: 'spk-dwn',
    SPIKE_UP: 'spk-up',
    SPIKE_LEFT: 'spk-lft',
    SPIKE_RIGHT: 'spk-rght',
    BLOOD_SPIKE_DOWN: 'spk-b-dwn',
    BLOOD_SPIKE_UP: 'spk-b-up',
    BLOOD_SPIKE_LEFT: 'spk-b-lft',
    BLOOD_SPIKE_RIGHT: 'spk-b-rght',
    DOUBLE_ARROW_UP: 'double-arrow-up',
    DOUBLE_ARROW_DOWN: 'double-arrow-down',
    DOUBLE_ARROW_LEFT: 'double-arrow-left',
    DOUBLE_ARROW_RIGHT: 'double-arrow-right',
    INDUSTRIAL_START_PART: 'ind-',
    ICE_BRIDGE: 'ibr',
    INDUSTRIAL_LADDER: 'in-l',
    BILLBOARD_RUNJUMP: 'expl-rj',
    ENEMY_START_PART: 'e-',
    PLATFORM: 'plf-',
    HOME: '(home)'
}

export class TilemapParser {
    constructor(config) {
        this.sectorScene = config.sectorScene;
        this.sectorData = config.sectorData;
        this.level = config.sector.level;
        this.tileData = this.sectorData.data;
        this.spriteFactory = new SpriteFactory(this.sectorScene);
    }

    parse() {
        var blockStart = false;
        var iceBridgeStart = false;
        var waterStart = false;
        var spriteFactory = this.spriteFactory;

        for (var j = 0; j < this.tileData.length; j++) {
            for (var i = 0; i < this.tileData[0].length; i++) {
                var currentTile = this.tileData[j][i];
                currentTile = currentTile.toString();

                if (!this.tileIsString(currentTile)) {
                    continue;
                }

                var nextTile = '';
                if (i + 1 < this.tileData[0].length) {
                    nextTile = this.tileData[j][i + 1];
                }

                if (currentTile == 'end') {
                    this.preloadedLevelEnd = {
                        x: i * 32,
                        y: j * 32
                    }
                } else if (currentTile == TilemapConstants.COIN) {
                    spriteFactory.addCoinSprite(i, j);
                } else if (currentTile == TilemapConstants.HELL_COIN) {
                    spriteFactory.addCoinSprite(i, j, 'hell-coin');
                } else if (currentTile == TilemapConstants.CLOUD) {
                    spriteFactory.addSprite(i * 32, j * 32, 'cloud');
                } else if (currentTile == TilemapConstants.PILE_OF_SNOW) {
                    spriteFactory.createPileOfSnow(i, j);
                } else if (currentTile == TilemapConstants.GRASS1) {
                    spriteFactory.createGrass1(i, j);
                } else if (currentTile == TilemapConstants.GRASS2) {
                    spriteFactory.createGrass1(i, j);
                } else if (currentTile == TilemapConstants.INDUSTRIAL_LADDER) {
                    spriteFactory.createCollisionTile(i, j, "ind-ladder");
                } else if (currentTile.startsWith(TilemapConstants.SPIKE_START_PART)) {
                    spriteFactory.createHurtableTile(i, j, currentTile);
                } else if (currentTile.startsWith(TilemapConstants.INDUSTRIAL_START_PART)) {
                    spriteFactory.createCollisionTile(i, j, currentTile);
                } else if (currentTile == TilemapConstants.PLAIN_WATER_TILE) {
                    this.createPreloadedplainWater(i, j, nextTile);
                } else if (currentTile == TilemapConstants.TOP_WATER_TILE) {
                    i = this.createPreloadedWater(i, j);
                } else if (currentTile == TilemapConstants.PLAIN_LAVA_TILE) {
                    this.createPreloadedPlainLava(i, j, nextTile);
                } else if (currentTile == TilemapConstants.TOP_LAVA_TILE) {
                    i = this.createPreloadedLava(i, j);
                } else if (currentTile == TilemapConstants.ICE_BRIDGE) {
                    iceBridgeStart = this.createIceBridge(i, j, iceBridgeStart, nextTile);
                } else if (this.tileData[j][i] == 'bigb') {
                    this.createPreloadedBigBlock(i, j);
                } else if (this.tileData[j][i] == 'w') {
                    blockStart = this.createPreloadedWoodPieces(blockStart, i, j, nextTile);
                } else if (this.tileData[j][i] == this.WAY_ARROW_LEFT) {
                    spriteFactory.createBackgroundObject(i, j, "left");
                } else if (this.tileData[j][i] == this.WAY_ARROW_RIGHT) {
                    spriteFactory.createBackgroundObject(i, j, "right");
                } else if (this.tileData[j][i] == this.WAY_ARROW_UP) {
                    spriteFactory.createBackgroundObject(i, j, "up");
                } else if (this.tileData[j][i] == this.WAY_ARROW_DOWN) {
                    spriteFactory.createBackgroundObject(i, j, "down");
                } else if (currentTile.startsWith(TilemapConstants.ENEMY_START_PART)) {
                    this.addEnemy(i, j, currentTile);
                } else if (currentTile == ">>") {
                    spriteFactory.createBackgroundObject(i, j, SpriteKeyConstants.DOUBLE_ARROW_RIGHT);
                } else if (currentTile == "<<") {
                    spriteFactory.createBackgroundObject(i, j, SpriteKeyConstants.DOUBLE_ARROW_LEFT);
                } else if (currentTile == "^^") {
                    spriteFactory.createBackgroundObject(i, j, SpriteKeyConstants.DOUBLE_ARROW_UP);
                } else if (currentTile == "vv") {
                    spriteFactory.createBackgroundObject(i, j, SpriteKeyConstants.DOUBLE_ARROW_DOWN);
                } else if (currentTile.startsWith(TilemapConstants.PLATFORM)) {
                    spriteFactory.createMovablePlatform(i, j, currentTile);
                } else if (currentTile == TilemapConstants.HOME) {
                    spriteFactory.addHome(i, j);
                }
            }
        }
    }

    addEnemy(i, j, currentTile) {
        let enemyNumber = currentTile.replace("e-", "");

        switch (enemyNumber) {
            case '1':
                this.sectorScene.addSnowBallEnemyFromTile(i, j);
                break;
            case '6':
                this.sectorScene.addFlyingSnowBallEnemyFromTile(i, j);
                break;
            case '8':
                this.sectorScene.addSpikyFromTile(i, j);
                break;
            case '9':
                this.sectorScene.addSpleepingSpikyFromTile(i, j);
                break;
            case '10':
                this.sectorScene.addHellSpikyFromTile(i, j, false);
                break;
            case '11':
                this.sectorScene.addHellSpikyFromTile(i, j, true);
                break;
            default:
                break;
        }
    }

    createPreloadedWater(i, j) {
        this.createPreloadedLiquid(i, j, TilemapConstants.TOP_WATER_TILE, SpriteKeyConstants.WATER_TOP, this.water);
    }

    createPreloadedLava(i, j) {
        this.createPreloadedLiquid(i, j, TilemapConstants.TOP_LAVA_TILE, SpriteKeyConstants.LAVA_TOP, this.lava);
    }

    createPreloadedLiquid(i, j, tileType, spriteKey, layer) {
        if (this.liquidTopIndex == undefined) {
            this.liquidTopIndex = 0;
        }

        var waterI = i;

        while (this.tileData[j][waterI] == tileType) {
            waterI++;
        }

        for (var n = i - 1; n < waterI + 1; n += 4) {
            let water = (tileType == TilemapConstants.TOP_WATER_TILE ? this.spriteFactory.createAntarcticWaterTop(n, j, this.liquidTopIndex++) :
                this.spriteFactory.createLavaTop(n, j, this.liquidTopIndex++));

            layer.push(water);
        }
 
        i = waterI - 1;

        return i;
    }

    createPreloadedplainWater(i, j, nextTile) {
        this.createPlainLiquid(i, j, TilemapConstants.PLAIN_WATER_TILE, this.water, nextTile, "antarctic-water");
    }

    createPreloadedPlainLava(i, j, nextTile) {
        this.createPlainLiquid(i, j, TilemapConstants.PLAIN_LAVA_TILE, this.lava, nextTile, "lava");
    }

    createPlainLiquid(i, j, tile, layer, nextTile, spriteKey) {
        if (!this.waterStart) {
            let firstWater = this.spriteFactory.createPreloadedObject(i - 1, j, spriteKey);

            this.waterStart = true;

            layer.push(firstWater);
        }

        let midWater = this.spriteFactory.createPreloadedObject(i, j, spriteKey);

        layer.push(midWater);

        if (nextTile != tile) {
            let lastWater = this.spriteFactory.createPreloadedObject(i + 1, j, spriteKey);

            this.waterStart = false;

            layer.push(lastWater);
        }
    }

    tileIsString(tile) {
        return tile.match(/[\(\)a-zA-Z]/);
    }
}

class SpriteFactory {
    constructor(sectorScene) {
        this.sectorScene = sectorScene;
    }

    addCoinSprite(x, y, coinType) {
        this.sectorScene.addCoinSprite(x, y, coinType);
    }

    addSprite(i, j, key) {
        this.sectorScene.addSprite(i, j, key);
    }

    createCollisionTile(i, j, key) {
        let sectorData = Sector.getCurrentSector().sectorData;
        let collisionTile = {};

        if (key == "ind-ladder" || !key.startsWith(TilemapConstants.INDUSTRIAL_START_PART)) {
            collisionTile = this.sectorScene.addSprite(i, j, key);
        } else {
            collisionTile = this.sectorScene.addSprite(i, j, "industrial", key.replace(TilemapConstants.INDUSTRIAL_START_PART, ""));
        }

        this.sectorScene.addCollisionTile(collisionTile, key);
    }

    createPreloadedCloud(i, j) {
        this.createBackgroundObject(i, j, 0, 0, SpriteKeyConstants.CLOUD);
    }

    createGrass1(i, j) {
        this.createBackgroundObject(i, j, "grass1", 0, 24);
    }

    createGrass2(i, j) {
        this.createBackgroundObject(i, j, "grass2", 0, 24);
    }

    createPileOfSnow(i, j) {
        this.createBackgroundObject(i, j, "pile-of-snow", 0, -10);
    }

    createHurtableTile(i, j, key) {
        this.sectorScene.createHurtableTile(i, j, key);
    }

    createMovablePlatform(i, j, key) {
        this.sectorScene.createMovablePlatform(i, j, key);
    }

    createAntarcticWaterTop(i, j, index) {
        new Water({
            id: index,
            key: 'water-' + index,
            scene: this.scene,
            x: i,
            y: j,
            player: this.player,
            level: this
        });
    }

    createBackgroundObject(x, y, key, offsetX = 0, offsetY = 0) {
        this.sectorScene.createBackgroundObject(x, y, offsetX, offsetY, key);
    }

    addHome(i, j) {
        this.sectorScene.addHome(i, j);
    }
}