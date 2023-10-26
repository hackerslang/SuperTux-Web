class Level {
    constructor(levelData, scene) {
        this.scene = scene;
        this.levelData = levelData.level;
        this.level = levelData.level;
        this.originalLevel = levelData.level;
        this.tilemaps = levelData.tilemaps;
        this.title = levelData.title;
        this.backgroundImage = levelData.backgroundImage;
        this.additionalTiles = levelData.additionalTiles;
        this.levelEnd = levelData.levelEnd;
        this.creatures = levelData.creatures;
        this.playerPosition = levelData.playerPosition;
        this.dynamicForegrounds = levelData.dynamicForegrounds;
        this.staticForegrounds = levelData.staticForegrounds;
        this.landscape = 'snow';
        this.LAVA_ALPHA = 0.7;

        if (config.landscapeType != null) {
            this.landscape = config.landscape;
        }

        this.tilemapParser = new TilemapParser(this, this.levelData);

        this.TILE_DIMENSION = 32;
        this.TOTAL_NUMBER_OF_COINS = this.getTotalNumberofCoins();
        this.playerTotalCoinsCollected = 0;
    }

    addCollectedCoin() {
        this.playerTotalCoinsCollected++;
        this.updateTotalCoinsCollectedUI();
    }

    updateTotalCoinsCollectedUI() {
        this.scene.setCollectedCoins(this.playerTotalCoinsCollected);
    }

    pause() {
        game.scene.pause("GameScene");
        game.scene.start("PauseScene");
    }

    loadBackgroundImage(backgroundImage) {
        this.preloadImage('background', backgroundImage);
    }

    loadTilemaps(tilemaps) {
        var self = this;

        tilemaps.forEach(function (tilemap, idx) {
            self.preloadImage(tilemap.name, tilemap.value);
        });
    }

    loadCoinTiles() {
        this.preloadImage('coin-2', './assets/images/objects/coins.png');
    }

    preloadImage(name, value) {
        this.scene.load.image(name, value);
    }

    createDynamicForeGrounds() {
        if (this.dynamicForegrounds == null) { return; }
        var i = 0;
        var level = this;
        this.dynamicForegrounds.forEach(function (foreground, ids) {
            var foregroundImage = {};

            if (foreground.tile == "la") {
                for (var x = 0; x < level.levelData[0].length; x++) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        var foregroundImage = level.scene.add.sprite(x * 32, y * 32, 'lava');
                        foregroundImage.setOrigin(0, 0);
                        foregroundImage.setDepth(120);
                        foregroundImage.alpha = level.LAVA_ALPHA;
                    }
                }
            } else if (foreground.tile == "la2") {
                for (var x = 0; x < level.levelData[0].length; x+=4) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        var foregroundImage = new Lava({
                            id: i,
                            key: 'lava-' + i,
                            player: level.player,
                            scene: level.scene,
                            x: x * 32,
                            y: y * 32,
                            level: level,
                            alpha: level.LAVA_ALPHA
                        });

                        i++;
                    }
                }
            }
        });
    }

    createStaticForegrounds() {
        if (this.staticForegrounds == null) { return; }
        var i = 0;
        var level = this;
        this.staticForegrounds.forEach(function (foreground, ids) {
            var foregroundImage = {};

            if (foreground.tile == "la") {
                for (var x = foreground.x; x < foreground.x + foreground.width; x++) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        var foregroundImage = level.scene.add.sprite(x * 32, y * 32, 'lava');
                        foregroundImage.setOrigin(0, 0);
                        foregroundImage.setDepth(120);

                        foregroundImage.scrollFactorX = 0;
                        foregroundImage.scrollFactorY = 1;
                    }
                }
            } else if (foreground.tile == "la2") {
                for (var x = foreground.x; x < foreground.x + foreground.width; x += 4) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        var foregroundImage = new Lava({
                            id: i,
                            key: 'lava-' + i,
                            player: level.player,
                            scene: level.scene,
                            x: x * 32,
                            y: y * 32,
                            level: level
                        });

                        foregroundImage.scrollFactorX = 0;
                        foregroundImage.scrollFactorY = 1;

                        i++;
                    }
                }
            }

            
        });
    }

    createBackground() {
        var backgroundImage = this.scene.add.image(0, 0, 'background');
        backgroundImage.setOrigin(0, 0);
        backgroundImage.scrollFactorX = 0;
        backgroundImage.scrollFactorY = 0;
    }

    preload() {
        this.loadBackgroundImage(this.backgroundImage);
        this.loadTilemaps(this.tilemaps);
        this.loadCoinTiles();
    }

    create() {
        this.additionalTiles = this.parseTilemaps();
        this.createBackground();

        let map = this.scene.make.tilemap({ key: 'map', data: this.level, width: this.level[0].length, height: 21, tileWidth: 32, tileHeight: 32 });
        this.map = map;

        let tiles = map.addTilesetImage('tiles');

        this.parseAntracticWater();
        this.parseLava();
        this.parseBackgroundImages();

        this.createDynamicForeGrounds();
        this.createStaticForegrounds();
        
        let groundLayer = map.createLayer(0, tiles, 0, 0);
        this.groundLayer = groundLayer;

        this.setPlayer();

        this.coinGroup = this.scene.add.group();
        this.parseCoinLayer();

        this.collisionTilesGroup = this.scene.add.group();
        this.parseCollisionTilesLayer();

        this.enemyGroup = this.scene.add.group();
        this.parseEnemyLayer();

        //this.blockGroup = this.scene.add.group();
        //this.parseBlockLayer();

        this.hurtableTilesGroup = this.scene.add.group();
        this.parseHurtableTiles();

        this.powerupGroup = this.scene.add.group();

        this.scene.physics.add.collider(this.coinGroup, this.groundLayer);
        this.playerGroundCollider = this.scene.physics.add.collider(this.player, this.groundLayer);
        this.woodCollider = this.scene.physics.add.collider(this.player, this.collisionTilesGroup, this.woodHit);

        this.scene.physics.world.bounds.width = groundLayer.width;
        this.scene.physics.world.bounds.height = groundLayer.height;
        groundLayer.setCollisionByExclusion(0, true);

        this.scene.physics.world.enable(this.player);
        this.scene.physics.world.setBoundsCollision(true, true, true, true);
        this.scene.cameras.main.setBounds(0, 0, this.level[0].length * 32, (this.level.length - 3) * 32);
        this.scene.cameras.main.startFollow(this.player, true);
    }

    parseTilemaps() {
        return this.tilemapParser.parse();
    }

    createPreloadedBackGroundObject(i, j, offsetI, offsetJ, type) {
        let backgrounObject = {
            type: type,
            x: i * 32 + offsetI,
            y: j * 32 + offsetJ
        }

        this.preloadedBackgroundImages.push(backgrounObject);
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

    parseHurtableTiles() {
        for (var i = 0; i < this.additionalTiles.hurtableTiles.length; i++) {
            let hurtableTile = this.additionalTiles.hurtableTiles[i];

            if (hurtableTile.type.startsWith("spk-")) {
                hurtableTile = this.addSpike(preloadedSpike.x, preloadedSpike.y, preloadedSpike.position);
            }

            this.hurtableTiles.push(hurtableTile);
        }
    }

    parseWayArrowLayer() {
        for (var i = 0; i < this.preloadedWayArrows.length; i++) {
            let preloadedWayArrow = this.preloadedWayArrows[i];

            this.addWayArrow(preloadedWayArrow.x, preloadedWayArrow.y, preloadedWayArrow.position);
        }
    }

    parseCoinLayer() {
        var coinSprites = [];
        var self = this;

        this.additionalTiles.coins.forEach(function (preloadedCoin, idx) {
            let coin = new Coin({
                id: idx,
                key: 'coin',
                scene: self.scene,
                x: preloadedCoin.x,
                y: preloadedCoin.y,
                player: self.player,
                level: self
            });

            self.coinGroup.add(coin);
            coinSprites.push(coin);
        });

        this.coinSprites = coinSprites;
    }

    parseCollisionTilesLayer() {
        var self = this;

        this.additionalTiles.collisionTiles.forEach(function (collisionTile, idx) {
            var tile;

            if (collisionTile.type.startsWith("icebridge-")) {
                let tileIndex = 2;

                if (collisionTile.type == "icebridge-start") {
                    tileIndex = 0;
                } else if (collisionTile.type == "icebridge-mid") {
                    tileIndex = 1;
                }

                tile = self.scene.add.sprite(collisionTile.x, collisionTile.y, "icebridge", tileIndex);
            } else if (collisionTile.type == "single-wood") {
                tile = self.scene.add.sprite(collisionTile.x, collisionTile.y, "wood-single");
            } else if (collisionTile.type == "wood-start") {
                tile = self.scene.add.sprite(collisionTile.x, collisionTile.y, "wood", 0);
            } else if (collisionTile.type == "wood-mid") {
                tile = self.scene.add.sprite(collisionTile.x, collisionTile.y, "wood", 1);
            } else if (collisionTile.type == "wood-end") {
                tile = self.scene.add.sprite(collisionTile.x, collisionTile.y, "wood", 4);
            } else if (collisionTile.type.startsWith(SpriteKeyConstants.INDUSTRIAL)) {
                tile = self.scene.add.sprite(collisionTile.x, collisionTile.y, "industrial", collisionTile.type.replace(SpriteKeyConstants.INDUSTRIAL, "")); //here error!
            } else {
                return;
            }

            self.scene.physics.world.enableBody(tile, 0);
            tile.body.setAllowGravity(false);
            tile.body.setImmovable(true);
            tile.setOrigin(0, 0);

            self.collisionTilesGroup.add(tile);
        });
    }

    

    parseBackgroundImages() {
        for (var i = 0; i < this.additionalTiles.backgroundObjects.length; i++) {
            var preloadedBackgroundObject = this.additionalTiles.backgroundObjects[i];

            this.scene.add.sprite(preloadedBackgroundObject.x, preloadedBackgroundObject.y, preloadedBackgroundObject.type);
        }
    }

    parseAntracticWater() {
        for (var i = 0; i < this.additionalTiles.water.length; i++) {
            var preloadedAntarcticWater = this.additionalTiles.water[i];

            let water = {};

            if (preloadedAntarcticWater.type == 'plain') {
                water = this.scene.add.sprite(preloadedAntarcticWater.x, preloadedAntarcticWater.y, 'antarctic-water');
                water.setOrigin(0, 0);
            } else /*if (preloadedAntarcticWater.type == 'top')*/ {
                water = new Water({
                    id: i,
                    key: 'water-' + i,
                    scene: this.scene,
                    x: preloadedAntarcticWater.x,
                    y: preloadedAntarcticWater.y,
                    player: this.player,
                    level: this
                });
            }
        }
    }

    parseLava() {
        var lavaSprites = [];

        for (var i = 0; i < this.additionalTiles.lava.length; i++) {
            var preloadedLava = this.additionalTiles.lava[i];
            let lava = {};

            if (preloadedLava.type == 'plain') {
                lava = this.scene.add.sprite(preloadedLava.x, preloadedLava.y, 'lava');
                lava.setOrigin(0, 0);
                lava.setDepth(120);
                lava.alpha = this.LAVA_ALPHA;
            } else /*if (preloadedAntarcticWater.type == 'top')*/ {
                lava = new Lava({
                    id: i,
                    key: 'lava-' + i,
                    player: this.player,
                    scene: this.scene,
                    x: preloadedLava.x,
                    y: preloadedLava.y,
                    level: this,
                    alpha: this.LAVA_ALPHA
                });

                lavaSprites.push(lava);
            }
        }

        this.lavaSprites = lavaSprites;
    }

    parseBlockLayer() {
        var blockSprites = [];
        for (var i = 0; i < this.additionalTiles.collisionTiles.length; i++) {
            var preloadedBlock = this.additionalTiles.collisionTiles[i]; { };

            let block = {};

            if (preloadedBlock.type == "bonus-block") {
                block = new BonusBlock({
                    id: i,
                    key: "bonus-block-" + i,
                    scene: this.scene,
                    x: preloadedBlock.x,
                    y: preloadedBlock.y,
                    player: this.player,
                    level: this,
                    powerupType: preloadedBlock.powerupType,
                    content: preloadedBlock.content,
                    hitCounter: preloadedBlock.hitCounter
                });
            } else if (preloadedBlock.type == "brick") {
                block = new Brick({
                    id: i,
                    key: "brick" + i,
                    scene: this.scene,
                    x: preloadedBlock.x,
                    y: preloadedBlock.y,
                    brickSprite: preloadedBlock.brickSprite,
                    player: this.player,
                    level: this
                });
            }

            this.blockGroup.add(block);
            blockSprites.push(block);
        }

        this.blockSprites = blockSprites;
    }

    setPlayer() {
        this.player = new Tux({
            key: "tux",
            scene: this.scene,
            x: this.playerPosition.x * 32,
            y: this.playerPosition.y * 32,
            level: this
        });

        this.player.body.setCollideWorldBounds(true);
    }

    parseEnemyLayer() {
        var creatureSprites = [];
        for (var i = 0; i < this.creatures.length; i++) {
            var creature = this.creatures[i];
            var creatureObject;

            switch (creature.name) {
                case "snowball":
                    creatureObject = new SnowBall({
                        id: i,
                        scene: this.scene,
                        key: "snowball",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        level: this,
                        powerUps: creature.powerUps
                    });

                    break;
                case "bouncing-snowball":
                    creatureObject = new BouncingSnowBall({
                        id: i,
                        scene: this.scene,
                        key: "bouncing-snowball",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        level: this,
                        powerUps: creature.powerUps
                    });

                    break;

/*
                case "flying-snowball":
                    creatureObject = new FlyingSnowBall({
                        id: i,
                        scene: this.scene,
                        key: "flying-snowball",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        level: this
                    });

                    break;
                    */
                case "iceblock":
                    creatureObject = new MrIceBlock({
                        id: i,
                        scene: this.scene,
                        key: "mriceblock",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        level: this,
                        powerUps: creature.powerUps
                    });

                    break;

                case "jumpy":
                    creatureObject = new Jumpy({
                        id: i,
                        scene: this.scene,
                        key: "jumpy",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        level: this
                    });

                    break;

                case "plasma-gun":
                    creatureObject = new PlasmaGun({
                        id: i,
                        scene: this.scene,
                        key: "plasma-gun",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        player: this.player,
                        level: this
                    });

                    break;

                //case "krosh":
                //    creatureObject = new Krosh({
                //        id: i,
                //        scene: this.scene,
                //        key: "krosh",
                //        x: creature.position.x * 32,
                //        y: creature.position.y * 32,
                //        stopY: creature.position.stopY,
                //        realY: creature.position.realY,
                //        player: this.player,
                //        level: this
                //    });

                //    break;

                case "fish":
                    creatureObject = new Fish({
                        id: i,
                        scene: this.scene,
                        key: "fish",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        up: creature.up,
                        down: creature.down,
                        flip: creature.flip,
                        player: this.player,
                        level: this
                    });

                    break;
                /*
                case "ghoul":
                    creatureObject = new Ghoul({
                        id: i,
                        scene: this.scene,
                        key: "ghoul",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        level: this
                    });

                    break;*/
            }

            if (creatureObject != null) {
                creatureSprites.push(creatureObject);
                this.enemyGroup.add(creatureObject);
            }

        }

        this.creatureSprites = creatureSprites;
    }

    woodHit(player) {
    }

    spikeHit(player) {
        alert("");
    }


    getPlayer() {
        return this.player;
    }

    getLevelData() {
        return this.level;
    }

    getEnemyGroup() {
        return this.enemyGroup;
    }

    getEnemies() {
        return this.creatureSprites;
    }

    getTotalNumberofCoins() {
        var totalNumberofCoins = 0;
        
        for (var i = 0; i < this.level.length; i++) {
            for (var j = 0; j < this.level[i].length; j++) {
                if (this.level[i][j] == this.COIN) {
                    totalNumberofCoins++;
                }
            }
        }

        return totalNumberofCoins;
    }

    update(time, delta) {
        this.player.update(time, delta);
        this.player.draw(time, delta);

        this.forceUpdateSprites(this.creatureSprites, time, delta);
        this.forceUpdateSprites(this.coinSprites, time, delta);
        this.forceUpdateSprites(this.lavaSprites, time, delta);
        this.forceUpdateSprites(this.particleSprites, time, delta);
        this.forceUpdateSprites(this.blockSprites, time, delta);
        //this.checkBonusBlockHit();

        //Array.from(this.blockGroup.children.entries).forEach(
        //    (block) => {
        //        block.update(time, delta);
        //    });

        Array.from(this.powerupGroup.children.entries).forEach(
            (powerup) => {
                powerup.update(time, delta);
            });

        //Array.from(this.spikeGroup.children.entries).forEach(
        //    (spike) => {
        //        spike.update(time, delta);
        //    });
    }

    checkBonusBlockHit() {
        var tileX = this.player.x;
        var tileY = this.player.y;

        for (var i = 0; i < this.blockSprites.length; i++) {
            var blockSprite = this.blockSprites[i];
            var blockTileX = blockSprite.x;
            var blockTileY = blockSprite.y;

            if (tileX >= blockTileX - 40 && tileX <= blockTileX + 40 && blockTileY <= (tileY - 77) && blockTileY >= (tileY - 78)) {
                blockSprite.blockHit(blockSprite, this.player);
            }
        }
    }

    forceUpdateSprites(sprites, time, delta) {
        if (sprites != null) {
            for (var i = 0; i < sprites.length; i++) {
                var sprite = sprites[i];

                if (sprite != null) {
                    sprite.update(time, delta);
                }
            }
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
            level: this
        });

        this.spikeGroup.add(spike);
    }

    addWayArrow(x, y, direction) {
        let wayArrow = new WayArrow({
            scene: this.scene,
            key: 'wayarrow',
            x: x,
            y: y,
            direction: direction,
            level: this
        });

        this.wayArrowGroup.add(wayArrow);
    }

    addStar(x, y, direction) {
        let star = new StarPowerUp({
            scene: this.scene,
            key: "star",
            x: x,
            y: y,
            player: this.player,
            level: this,
            direction: direction
        });

        this.powerupGroup.add(star);
    }

    addBrickPiece(x, y) {

    }

    addEgg(x, y, direction, timer) {
        let egg = new EggPowerUp({
            scene: this.scene,
            key: "egg",
            x: x,
            y: y,
            player: this.player,
            level: this,
            direction: direction,
            incollectableForTimer: timer
        });

        this.powerupGroup.add(egg);
    }

    addPlus(x, y, direction, timer) {
        let plus = new PlusPowerUp({
            scene: this.scene,
            key: "plus",
            x: x,
            y: y,
            player: this.player,
            level: this,
            direction: direction,
            incollectableForTimer: timer
        });

        this.powerupGroup.add(plus);
    }

    addBouncyCoin(x, y, emerge) {
        let bouncyCoin = new BouncyCoin({
            scene: this.scene,
            key: "bouncy-coin",
            x: x,
            y: y,
            player: this.player,
            level: this,
            emerge: emerge
        });

        this.powerupGroup.add(bouncyCoin);
    }

    removeEnemy(enemy) {
        this.enemyGroup.remove(enemy);
        var index = enemy.id;
        this.creatureSprites[index] = null;
    }

    removeCoin(coin) {
        this.coinGroup.remove(coin);
        var index = coin.id;
        this.coinSprites[index] = null;
    }

    removeBlock(block) {
        this.blockGroup.remove(block);
        
    }
}

class SnowLevel extends Level {
    constructor(levelData, scene) {
        super(levelData, scene);

        this.backgroundImage = './assets/images/level/snow/arctic-background.png';
    }

    getLevelTiles() {
        return this.level;
    }

    preload() {
        this.scene.load.image('background', this.backgroundImage);
        this.scene.load.image('tiles', './assets/tilemaps/snow.png');
        this.scene.load.image('coin-tiles', './assets/images/objects/coins.png');
    }

    create() {
        var backgroundImage = this.scene.add.image(0, 0, 'background');

        backgroundImage.setOrigin(0, 0.2);
        backgroundImage.scrollFactorX = 0;
        backgroundImage.scrollFactorY = 0;

        this.parseObjects();

        let map = this.scene.make.tilemap({ key: 'map', data: this.level, width: this.level[0].length, height: 21, tileWidth: 32, tileHeight: 32 });
        this.map = map;

        let snowTiles = map.addTilesetImage('tiles');

        this.parseBackgroundImages();
        this.parseAntracticWater();

        let groundLayer = map.createLayer(0, snowTiles, 0, 0);
        this.groundLayer = groundLayer;

        this.setPlayer();

        this.coinGroup = this.scene.add.group();
        this.parseCoinLayer();

        this.woodGroup = this.scene.add.group();
        this.parseWoodLayer();

        this.enemyGroup = this.scene.add.group();
        this.parseEnemyLayer();

        this.blockGroup = this.scene.add.group();
        this.parseBlockLayer();

        this.spikeGroup = this.scene.add.group();
        this.parseSpikeLayer();

        this.powerupGroup = this.scene.add.group();

        this.parseLevelEndLayer();

        this.wayArrowGroup = this.scene.add.group();
        this.parseWayArrowLayer();

        //this.scene.physics.add.collider(this.enemyGroup, this.groundLayer);
        this.scene.physics.add.collider(this.coinGroup, this.groundLayer);
        this.playerGroundCollider = this.scene.physics.add.collider(this.player, this.groundLayer);
        this.woodCollider = this.scene.physics.add.collider(this.player, this.woodGroup, this.woodHit);

        this.scene.physics.world.bounds.width = groundLayer.width;
        this.scene.physics.world.bounds.height = groundLayer.height;
        groundLayer.setCollisionByExclusion(0, true);

        this.scene.physics.world.enable(this.player);
        this.scene.physics.world.setBoundsCollision(true, true, true, true);
        this.scene.cameras.main.setBounds(0, 0, this.level[0].length * 32, (this.level.length - 3) * 32); 
        this.scene.cameras.main.startFollow(this.player, true);
    }




    parseLevelEndLayer() {
        var iglooBg = this.scene.add.sprite(this.preloadedLevelEnd.x - 145, this.preloadedLevelEnd.y - 60, "igloo-bg");
        var iglooFg = this.scene.add.sprite(this.preloadedLevelEnd.x, this.preloadedLevelEnd.y - 60, "igloo-fg");

        iglooFg.setDepth(1000);
    }


}

class CastleLevel  extends Level {
    constructor(levelData, scene, tiles = "castle1") {
        super(levelData, scene);

        this.tiles = tiles;
        this.backgroundImage = './assets/images/level/castle/castle-lava.png';
    }

    preload() {
        this.scene.load.image('background', this.backgroundImage);

        if (this.tiles == "castle1") {
            this.scene.load.image('tiles', './assets/tilemaps/castle.png');
        } else {
            this.scene.load.image('tiles', './assets/tilemaps/castle2.png');
        }
        
        this.scene.load.image('coin-tiles', './assets/images/objects/coins.png');
    }

    create() {
        var backgroundImage = this.scene.add.image(0, 0, 'background');

        backgroundImage.setOrigin(0, 0.2);
        backgroundImage.scrollFactorX = 0;
        backgroundImage.scrollFactorY = 0;

        this.setPlayer();
        this.parseObjects();

        let map = this.scene.make.tilemap({ key: 'map', data: this.level, width: this.level[0].length, height: 21, tileWidth: 32, tileHeight: 32 });
        this.map = map;

        let snowTiles = map.addTilesetImage('tiles');

        this.parseLava();

        let groundLayer = map.createStaticLayer(0, snowTiles, 0, 0);
        this.groundLayer = groundLayer;

        this.coinGroup = this.scene.add.group();
        this.parseCoinLayer();

        this.woodGroup = this.scene.add.group();
        this.parseWoodLayer();
        this.parseIceBridgeLayer();

        this.enemyGroup = this.scene.add.group();
        this.parseEnemyLayer();

        this.blockGroup = this.scene.add.group();
        this.parseBlockLayer();

        this.powerupGroup = this.scene.add.group();

        this.spikeGroup = this.scene.add.group();
        this.parseSpikeLayer();

        this.wayArrowGroup = this.scene.add.group();
        this.parseWayArrowLayer();

        this.parseLevelEndLayer();

        //this.scene.physics.add.collider(this.enemyGroup, this.groundLayer);
        this.scene.physics.add.collider(this.coinGroup, this.groundLayer);

        this.spikeCollider = this.scene.physics.add.collider(this.player, this.spikeGroup, this.spikeHit);
        this.playerGroundCollider = this.scene.physics.add.collider(this.player, this.groundLayer);
        this.woodCollider = this.scene.physics.add.collider(this.player, this.woodGroup, this.woodHit);

        this.scene.physics.world.bounds.width = groundLayer.width;
        this.scene.physics.world.bounds.height = groundLayer.height;
        groundLayer.setCollisionByExclusion(0, true);

        this.scene.physics.world.enable(this.player);
        this.scene.physics.world.setBoundsCollision(true, true, true, true);
        this.scene.cameras.main.setBounds(0, 0, this.level[0].length * 32, this.level.length * 32); 
        this.scene.cameras.main.startFollow(this.player, true);
    }

    parseLevelEndLayer() {
        //var iglooBg = this.scene.add.sprite(this.preloadedLevelEnd.x - 145, this.preloadedLevelEnd.y - 60, "igloo-bg");
        //var iglooFg = this.scene.add.sprite(this.preloadedLevelEnd.x, this.preloadedLevelEnd.y - 60, "igloo-fg");

        //iglooFg.setDepth(1000);
    }

    spikeHit(player) {
        if (!player.invincible) {
            player.hurtBy(null);
        }
    }
}



//MAKE ARROW TO GUIDE THE WAY OUT!!

class LevelTheDescentData {
    constructor() {
        this.title = 'The Descent';
        this.landscape = 'castle2';
        this.level = [
            [16, 17, 17, 18, 18, 17, 17, 18, 18, 18, 17, 18, 18, 17, 17, 18, 18, 18, 18, 17, 17, 18, 10, 6, 8, 8, 9, 8, 9, 8, 8, 9, 10, 6, 7, 8, 9, 9, 8, 8, 8, 7, 8, 9, 8, 7, 8, 8, 8, 9, 8, 8, 8, 7, 8, 9, 10, 16, 17, 16, 17, 17, 18, 6, 7, 7, 8, 9, 8, 8, 8, 8, 8, 8, 9, 9, 8, 7, 8, 8, 8, 8, 10, 6, 7, 9, 10, 16, 17, 17, 18, 6, 7, 9, 10, 6, 7, 9, 10, 16], 
            [7, 8, 9, 9, 8, 8, 8, 9, 8, 9, 8, 9, 10, 16, 17, 18, 19, 20, 16, 17, 18, 17, 17, 19, 20, 6, 8, 7, 8, 9, 10, 16, 17, 18, 19, 20, 11, 12, 13, 14, 15, 6, 7, 8, 7, 9, 10, 16, 17, 18, 20, 16, 17, 18, 19, 20, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 6, 7, 8, 10, 16, 17, 18, 19, 20, 11, 12, 13, 14, 13, 14, 15, 6, 7, 8, 9, 10, 16, 17, 18, 19, 20, 6, 7, 8, 9, 10, 6, 7, 8, 10],
            [19, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 7],
            [19, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 7],
            [14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12],
            [9, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 17],
            [14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 7],
            [14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12],
            [9, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12],
            [14, 15, 0, 'c', 'c', 'c', 'c', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'arrow-right', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 17],
            [9, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 8], 
            [14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'w', 'w', 'w', 'w', 'bb-s', 'bb-e', 'w', 0, 0, 0, 'w', 'w', 'bb-s', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 17],
            [14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12],
            [19, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 7],
            [19, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 17],
            [19, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 7],
            [14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 5, 0, 0, 0, 0, 0, 0, 0, 0,                                                                  1, 3, 5,  0, 0, 0, 0, 0, 0, 0, 0,                                  1, 3, 2, 3, 4, 4, 3, 4, 5, 0, 0, 0, 0, 0, 0, 0, 'arrow-down', 0, 0, 0, 0, 0, 0, 0, 11, 12],
            [14,24,2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5,                               0, 0, 0, 0, 1, 3, 5, 0, 0, 0, 0, 6, 7, 7, 8, 10, 0, 0, 0, 0, 0, 0, 0, 0,                                                                      6, 9, 10, 0, 0, 0, 0, 0, 0, 0, 0,11,14,15, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12, 13, 12, 13, 12, 13, 14, 14, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 17],
            [7, 8, 8, 9, 9, 9, 8, 9, 8, 8, 8, 9, 8, 9, 8, 8, 9, 8, 9, 8, 8, 8, 8, 9, 8, 8, 9, 8, 8, 10,                              0, 0, 0, 0, 6, 8, 10, 0, 0, 0, 0, 11, 12, 13, 14, 15, 0, 0, 0, 0, 0, 0, 0, 0,                                                                 11, 14, 15,0, 0, 0, 0, 0, 0, 0, 0,6, 9, 10, 0, 0, 0, 0, 0, 0, 0, 0, 16, 17, 18, 17, 18, 19, 18, 19, 18, 19, 20, 0, 0, 0, 0, 0, 11, 12, 13, 12, 14, 14, 15],
            [12, 13, 13, 14, 16, 17, 17, 18, 17, 18, 19, 20, 7, 8, 8, 8, 9, 8, 9, 8, 9, 9, 8, 8, 8, 8, 9, 9, 8, 10,                  'la2', 'la2', 'la2', 'la2', 6, 8, 10, 'la2', 'la2', 'la2', 'la2', 16, 17, 18, 19, 20, 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 16, 17, 20, 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2',6, 9, 10, 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 6, 7, 8, 7, 8, 9, 8, 7, 8, 9, 8, 10, 0, 0, 0, 0, 0, 0, 16, 18, 17, 18, 19, 20],
            [16, 17, 17, 18, 17, 18, 18, 17, 17, 17, 18, 17, 17, 17, 18, 17, 17, 17, 17, 18, 17, 17, 17, 18, 17, 17, 18, 18, 19, 20, 'la', 'la', 'la', 'la', 11, 14, 15, 'la', 'la', 'la', 'la', 11, 13, 13, 14, 15, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 6, 9, 10, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la',16, 17, 20, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 16, 17, 18, 17, 18, 19, 18, 17, 18, 19, 18, 20, 0, 0, 0, 0, 0, 0, 6, 7, 8, 9, 10],
            [13, 14, 15, 11, 12, 13, 14, 15, 6, 8, 9, 10, 6, 7, 8, 9, 9, 10, 11, 12, 13, 14, 16, 20, 6, 7, 8, 9, 8, 10,              'la', 'la', 'la', 'la', 16, 17, 20, 'la', 'la', 'la', 'la', 11, 12, 13, 14, 15,       'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 16,17,20,'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la',11, 14, 15, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 11, 12, 13, 12, 14, 13, 14, 14, 14, 13, 14, 15, 0, 0, 0, 0, 0, 0, 11, 12, 13, 12, 13, 14, 15],
            [11, 12, 14, 13, 15, 17, 17, 18, 19, 20, 13, 15, 16, 17, 12, 12, 13, 13, 12, 13, 12, 12, 12, 14, 13, 14, 13, 13, 14, 15, 'la', 'la', 'la', 'la', 6, 8, 10, 'la', 'la', 'la', 'la', 6, 7, 8, 8, 10, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 16, 17, 20, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 16, 17, 20, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 11, 12, 13, 14, 14, 14, 13, 12, 13, 12, 14, 15, 0, 0, 0, 0, 0, 0, 16, 17, 18, 18, 19, 20],
            [13, 14, 16, 17, 16, 17, 17, 20, 6, 7, 8, 8, 9, 8, 8, 8, 9, 8, 10, 11, 12, 13, 14, 14, 15, 20, 6, 7, 8, 10, 'la', 'la', 'la', 'la', 11, 14, 15, 'la', 'la', 'la', 'la', 16, 17, 18, 19, 20, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 11, 14, 15, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 6, 8, 10, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 11, 12, 12, 13, 12, 12, 12, 13, 14, 14, 14, 15, 0, 0, 0, 0, 0, 0, 6, 7, 8, 7, 10],
            [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 6, 7, 8, 9, 10, 6, 7, 7, 8, 7, 8, 7, 8, 9, 10, 'la', 'la', 'la', 'la', 11, 14, 15, 'la', 'la', 'la', 'la', 6, 7, 7, 8, 10, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 6, 8, 10, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 11, 14, 15, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 16, 17, 18, 17, 18, 19, 18, 17, 18, 19, 18, 20, 0, 0, 0, 0, 0, 0, 0, 11, 12, 13, 13, 14, 15],
            [11, 12, 13, 14, 15, 6, 7, 8, 9, 8, 9, 10, 11, 13, 14, 15, 16, 17, 17, 20, 16, 17, 18, 19, 20, 13, 14, 16, 17, 16, 17, 17, 20, 7, 8, 9, 9, 8, 8, 8, 9, 8, 9, 8, 9, 10, 6, 7, 8, 8, 10, 6, 7, 8, 8, 10, 6, 7, 7, 8, 10, 16, 17, 20, 11, 14, 15, 11, 12, 13, 14, 15, 11, 12, 14, 13, 15, 17, 17, 18, 19, 20, 6, 7, 8, 10, 0, 0, 0, 0, 0, 0, 0, 6, 7, 8, 7, 7, 7, 10],

            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'spk-dwn', 'spk-dwn', 'spk-dwn', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 18, 17, 18, 19, 20],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12, 13, 12, 13, 14, 15], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 7, 8, 7, 8, 9, 10],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12, 13, 12, 14, 14, 15],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 17, 18, 19, 18, 19, 20],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12, 13, 12, 14, 14, 15],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 12, 13, 12, 14, 14, 15],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 14, 15, 16, 17, 18, 20],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 3, 4, 4, 4, 4, 4, 23, 12, 13, 14, 15, 11, 15],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 9, 10, 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 11, 13, 14, 15, 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 11, 12, 12, 13, 14, 15, 16, 17, 18, 19, 20, 6, 9, 10, 6, 7, 9, 10],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 14, 15, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 16, 17, 18, 20, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 6, 7, 8, 8, 9, 8, 8, 8, 9, 8, 10, 11, 12, 13, 12, 14, 14, 15],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16, 17, 20, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 6, 8, 9, 10, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 11, 12, 13, 14, 15, 16, 17, 17, 20, 6, 7, 8, 8, 9, 8, 10],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 9, 10, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 11, 13, 14, 15, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 6, 7, 8, 9, 10, 0, 11, 14, 15, 16, 17, 18, 17, 18, 19, 20],
            [7, 8, 9, 9, 8, 8, 8, 9, 8, 9, 8, 9, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 7, 8, 8, 8, 9, 8, 9, 10, 16, 17, 18, 17, 18, 17, 18, 19, 20, 6, 7, 8, 8, 10, 11, 12, 13, 14, 15, 6, 7, 7, 8, 10, 16, 17, 18, 17, 18, 17, 18, 19, 20, 6, 7, 8, 7, 8, 9, 10]
        ];
        
        this.playerPosition = {
            x: 4,
            y: 16
        };

        this.creatures = [
            {
                name: "ghoul",
                direction: "left",
                position: {
                    x: 15,
                    y: 16,
                    realY: 17
                }
            },
            {
                name: "iceblock",
                direction: "left",
                position: {
                    x: 20,
                    y: 17,
                    realY: 17
                }
            },

            {
                name: "snowball",
                direction: "left",
                position: {
                    x: 25,
                    y: 17,
                    realY: 17
                }
            },
        ];
    }
}

class LevelCastle1Data {
    constructor() {
        this.title = 'Castle';
        this.landscape = 'castle';
        this.level = [
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 'c', 'c', 'c', 'c', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'w', 'w', 'w', 'w', 'bb-s', 'bb-e', 'w', 0, 0, 0, 'w', 'w', 'bb-s', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'spk-up', 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
            [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 0, 0, 0, 0, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

        ];

        this.playerPosition = {
            x: 4,
            y: 16
        };

        this.creatures = [
            {
                name: "ghoul",
                direction: "left",
                position: {
                    x: 15,
                    y: 16,
                    realY: 17
                }
            },
            {
                name: "iceblock",
                direction: "left",
                position: {
                    x: 15,
                    y: 17,
                    realY: 17
                }
            },

            {
                name: "snowball",
                direction: "left",
                position: {
                    x: 25,
                    y: 17,
                    realY: 17
                }
            },
        ];
    }
};

class LevelAntarctica2Data {
    constructor() {
        this.title = 'Antarctica, 2';
        this.landscape = 'snow';
        this.level = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 'c', 'c', 'c', 'c', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'w', 'w', 'w', 'w', 'bb-s', 'bb-e', 'w', 0, 0, 0, 'w', 'w', 'bb-s', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                                  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                                  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 11, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                                  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                                  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 11, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                                  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 11, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,5,10, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 11, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 'ibr', 'ibr', 'ibr', 'ibr', 'ibr', 'ibr', 'ibr', 'ibr',  4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0,                                  4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 11, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa2', 'wa2', 'wa2', 'wa2', 'wa2', 'wa2', 'wa2', 'wa2',  4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10,2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 11, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa',          4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa',          4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'end', 0, 0, 0, 0],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa',          4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 10, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa',          4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
            [7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa',          7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]
        ];

        this.playerPosition = {
            x: 4,
            y: 16
        };

        this.creatures = [
            {
                name: "iceblock",
                direction: "left",
                position: {
                    x: 15,
                    y: 17,
                    realY: 17
                }
            },

            {
                name: "snowball",
                direction: "left",
                position: {
                    x: 25,
                    y: 17,
                    realY: 17
                }
            },

            {
                name: "krosh",
                position: {
                    x: 48,
                    y: 8,
                    stopY: 17,
                    realY: 17
                }
            },

            {
                name: "fish",
                position: {
                    x: 61,
                    y: 25
                }
            }
        ];
    }
}

