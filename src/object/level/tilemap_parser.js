import { SpriteKeyConstants } from './tile_creator.js';

export var TilemapConstants = {
    COIN: 'c',
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
    DOUBLE_ARROW_UP: 'double-arrow-up',
    DOUBLE_ARROW_DOWN: 'double-arrow-down',
    DOUBLE_ARROW_LEFT: 'double-arrow-left',
    DOUBLE_ARROW_RIGHT: 'double-arrow-right',
    INDUSTRIAL_START_PART: 'ind-',
    ICE_BRIDGE: 'ibr',
    BILLBOARD_RUNJUMP: 'expl-rj',
    ENEMY_START_PART: 'e-',
    HOME: '(home)'
}

export class TilemapParser {
    constructor(sector, sectorData) {
        this.level = sector.level;
        this.tileData = sectorData.data;

        this.backgroundObjects = [];
        this.lava = [];
        this.water = [];
        this.coins = [];
        this.hurtableTiles = [];
        this.collisionTiles = [];
        this.enemies = [];

        this.waterStart = false;
    }

    parse() {
        var blockStart = false;
        var iceBridgeStart = false;
        var waterStart = false;

        for (var j = 0; j < this.tileData.length; j++) {
            for (var i = 0; i < this.tileData[0].length; i++) {
                var currentTile = this.tileData[j][i];
                currentTile = currentTile.toString();
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
                    this.createPreloadedCoin(i, j);
                } else if (currentTile == TilemapConstants.CLOUD) {
                    this.createPreloadedCloud(i, j);
                } else if (currentTile == TilemapConstants.PILE_OF_SNOW) {
                    this.createPreloadedPileOfSnow(i, j);
                } else if (currentTile == TilemapConstants.GRASS1) {
                    this.createPreloadedGrass1(i, j);
                } else if (currentTile == TilemapConstants.GRASS2) {
                    this.createPreloadedGrass2(i, j);
                } else if (currentTile.startsWith(TilemapConstants.SPIKE_START_PART)) {
                    this.createPreloadedSpike(i, j, currentTile);
                } else if (currentTile.startsWith(TilemapConstants.INDUSTRIAL_START_PART)) {
                    this.createPreloadedIndustrial(i, j, currentTile);
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
                    this.createPreloadedWayArrow(i, j, "left");
                } else if (this.tileData[j][i] == this.WAY_ARROW_RIGHT) {
                    this.createPreloadedWayArrow(i, j, "right");
                } else if (this.tileData[j][i] == this.WAY_ARROW_UP) {
                    this.createPreloadedWayArrow(i, j, "up");
                } else if (this.tileData[j][i] == this.WAY_ARROW_DOWN) {
                    this.createPreloadedWayArrow(i, j, "down");
                } else if (currentTile.startsWith(TilemapConstants.ENEMY_START_PART)) {
                    this.createPreloadedEnemy(i, j, currentTile);
                } else if (currentTile == ">>") {
                    this.createPreloadedBackgroundObject(i, j, 0, 0, SpriteKeyConstants.DOUBLE_ARROW_RIGHT);
                } else if (currentTile == "<<") {
                    this.createPreloadedBackgroundObject(i, j, 0, 0, SpriteKeyConstants.DOUBLE_ARROW_LEFT);
                } else if (currentTile == "^^") {
                    this.createPreloadedBackgroundObject(i, j, 0, 0, SpriteKeyConstants.DOUBLE_ARROW_UP);
                } else if (currentTile == "vv") {
                    this.createPreloadedBackgroundObject(i, j, 0, 0, SpriteKeyConstants.DOUBLE_ARROW_DOWN);
                } else if (currentTile == TilemapConstants.HOME) {
                    this.createPreloadedHome(i, j);
                }

                if (this.tileIsString(currentTile)) {
                    this.tileData[j][i] = 0;
                }
            }
        }

        return {
            backgroundObjects: this.backgroundObjects,
            water: this.water,
            lava: this.lava,
            coins: this.coins,
            hurtableTiles: this.hurtableTiles,
            collisionTiles: this.collisionTiles,
            enemies: this.enemies
        };
    }

    tileIsString(tile) {
        return tile.match(/^[a-z]+$/);
    }

    createIceBridge(i, j, iceBridgeStart, nextTile) {
        let preloadedIceBridge = {};
        if (!iceBridgeStart) {
            preloadedIceBridge = this.createPreloadedIceBridgeStart(i, j);

            iceBridgeStart = true;
        } else if (nextTile != TilemapConstants.ICE_BRIDGE) {
            preloadedIceBridge = this.createPreloadedIceBridgeEnd(i, j);

            iceBridgeStart = false;
        } else {
            preloadedIceBridge = this.createPreloadedIceBridgeMid(i, j);
        }

        this.collisionTiles.push(preloadedIceBridge);

        return iceBridgeStart;
    }

    createPreloadedWater(i, j) {
        this.createPreloadedLiquid(i, j, TilemapConstants.TOP_WATER_TILE, SpriteKeyConstants.WATER_TOP, this.water);
    }

    createPreloadedLava(i, j) {
        this.createPreloadedLiquid(i, j, TilemapConstants.TOP_LAVA_TILE, SpriteKeyConstants.LAVA_TOP, this.lava);
    }

    createPreloadedLiquid(i, j, tileType, spriteKey, layer) {
        var waterI = i;

        while (this.tileData[j][waterI] == tileType) {
            waterI++;
        }

        for (var n = i-1; n < waterI + 1; n += 4) {
            let water = this.createPreloadedObject(n, j, spriteKey);

            layer.push(water);
        }

        i = waterI - 1;

        return i;
    }

    createPreloadedplainWater(i, j, nextTile) {
        this.createPreloadedPlainLiquid(i, j, TilemapConstants.PLAIN_WATER_TILE, this.water, nextTile);
    }

    createPreloadedPlainLava(i, j, nextTile) {
        this.createPreloadedPlainLiquid(i, j, TilemapConstants.PLAIN_LAVA_TILE, this.lava, nextTile);
    }

    createPreloadedPlainLiquid(i, j, tile, layer, nextTile) {
        if (!this.waterStart) {
            let firstWater = this.createPreloadedObject(i - 1, j, 'plain');

            this.waterStart = true;

            layer.push(firstWater);
        }

        let midWater = this.createPreloadedObject(i, j, 'plain');

        layer.push(midWater);

        if (nextTile != tile) {
            let lastWater = this.createPreloadedObject(i + 1, j, 'plain');

            this.waterStart = false;

            layer.push(lastWater);
        }
    }

    createPreloadedWoodPieces(blockStart, i, j, nextTile) {
        let preloadedWood = {};
        if (!blockStart) {
            if (nextTile != 'w') {
                preloadedWood = this.createPreloadedSingleWood(i, j);
            } else {
                preloadedWood = this.createPreloadeWoodStart(i, j);
                blockStart = true;
            }
        } else if (nextTile != 'w') {
            preloadedWood = this.createPreloadeWoodEnd(i, j);
            blockStart = false;
        } else {
            preloadedWood = this.createPreloadeWoodMid(i, j);
        }

        this.collisionTiles.push(preloadedWood);

        return blockStart;
    }

    createPreloadedSpike(i, j, type) {
        let spike = this.createPreloadedObject(i, j, type);

        this.hurtableTiles.push(spike);
    }

    createPreloadedWayArrow(i, j, position) {
        let wayArrow = this.createPreloadedObject(i, j, position);

        this.backgroundObjects.push(wayArrow);
    }

    createPreloadedHome(i, j) {
        let home = this.createPreloadedObject(i, j, 'home');

        this.backgroundObjects.push(home);
    }

    createPreloadedBackgroundObject(i, j, offsetI, offsetJ, type) {
        var backgroundObject = this.createPreloadedBackWithOffset(i, j, offsetI, offsetJ, type);

        this.backgroundObjects.push(backgroundObject);
    }

    createPreloadedCoin(i, j) {
        let preloadedCoin = this.createPreloadedObject(i, j, SpriteKeyConstants.COIN);

        this.coins.push(preloadedCoin);
    }

    createPreloadedBigBlock(i, j) {
        let preloadedBlock = this.createPreloadedBigBlock(i, j);

        this.collisionTiles.push(preloadedBlock);
    }

    createPreloadedObjectWithOffset(i, j, offsetI, offsetJ, type) {
        let backgroundObject = {
            type: type,
            x: i * 32 + offsetI,
            y: j * 32 + offsetJ
        };

        return backgroundObject;
    }

    createPreloadedIndustrial(i, j, type) {
        let industrialObject = this.createPreloadedObject(i, j, type.replace(TilemapConstants.INDUSTRIAL_START_PART, SpriteKeyConstants.INDUSTRIAL));

        this.collisionTiles.push(industrialObject);
    }

    createPreloadedCloud(i, j) {
        return this.createPreloadedBackgroundObject(i, j, 0, 0, SpriteKeyConstants.CLOUD);
    }

    createPreloadedGrass1(i, j) {
        return this.createPreloadedBackgroundObject(i, j, 0, 24, SpriteKeyConstants.GRASS1);
    }

    createPreloadedGrass2(i, j) {
        return this.createPreloadedBackgroundObject(i, j, 0, 24, SpriteKeyConstants.GRASS2);
    }

    createPreloadedPileOfSnow(i, j) {
        return this.createPreloadedBackgroundObject(i, j, 0, -10, SpriteKeyConstants.PILE_OF_SNOW);
    }

    createPreloadedBigBlock(i, j) {
        return this.createPreloadedObject(i, j, SpriteKeyConstants.BIG_BLOCK);
    }

    createPreloadedSingleWood(i, j) {
        return this.createPreloadedObject(i, j, SpriteKeyConstants.SINGLE_WOOD);
    }

    createPreloadeWoodStart(i, j) {
        return this.createPreloadedObject(i, j, SpriteKeyConstants.WOOD_START);
    }

    createPreloadeWoodMid(i, j) {
        return this.createPreloadedObject(i, j, SpriteKeyConstants.WOOD_MID);
    }

    createPreloadeWoodEnd(i, j) {
        return this.createPreloadedObject(i, j, SpriteKeyConstants.WOOD_END);
    }

    createPreloadedIceBridgeStart(i, j) {
        return this.createPreloadedObject(i, j, SpriteKeyConstants.ICE_BRIDGE_START);
    }

    createPreloadedIceBridgeMid(i, j) {
        return this.createPreloadedObject(i, j, SpriteKeyConstants.ICE_BRIDGE_MID);
    }

    createPreloadedIceBridgeEnd(i, j) {
        return this.createPreloadedObject(i, j, SpriteKeyConstants.ICE_BRIDGE_END);
    }

    createPreloadedEnemy(i, j, currentTile) {
        let enemyNumber = currentTile.replace("e-", "");

        switch (enemyNumber) {
            case '1':
                this.addSnowball(i, j);
                break;
            case '6':
                this.addFlyingSnowball(i, j);
                break;
            case '8':
                this.addSpiky(i, j);
                break;
            case '9':
                this.addSpleepingSpiky(i, j);
            default:
                break;
        }
    }

    addSnowball(i, j) {
        var snowball =
        {
            name: "snowball",
            direction: "left",
            position: {
                x: i,
                y: j,
                realY: 20
            }
        };

        this.enemies.push(snowball);
    }

    addFlyingSnowball(i, j) {
        var flyingSnowball =
        {
            name: "flying-snowball",
            direction: "left",
            position: {
                x: i,
                y: j
            }
        };

        this.enemies.push(flyingSnowball);
    }

    addSpiky(i, j) {
        this.createSpiky(i, j, false);
    }

    addSpleepingSpiky(i, j) {
        this.createSpiky(i, j, true);
    }

    createSpiky(i, j, sleeping) {
        var spiky =
        {
            name: "spiky",
            direction: "left",
            position: {
                x: i,
                y: j
            },
            sleeping: sleeping
        };

        this.enemies.push(spiky);
    }

    createPreloadedObject(i, j, spriteType) {
        let preloadedObject = {
            type: spriteType,
            x: i * 32,
            y: j * 32
        };

        return preloadedObject;
    }

    createPreloadedBackWithOffset(i, j, offsetI, offsetJ, type) {
        let preloadedObject = {
            type: type,
            x: i * 32 + offsetI,
            y: j * 32 + offsetJ
        };

        return preloadedObject;
    }
}

