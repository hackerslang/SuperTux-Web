class SectorScene extends Phaser.Scene {
    constructor() {
        super();
        this.imageLoader = new ImageLoader({ scene: this });
        this.animationLoader = new AnimationLoader({ scene: this });

        this.DEFAULT_FRAMERATE = 10;
        this.REPEAT_INFINITELY = -1;

        this.sector = Sector.getCurrentSector();
        this.creatures = this.sector.sectorData.creatures;
        this.sectorCoinsCollected = 0;

        if (this.creatures == null) {
            this.creatures = [];
        }

        this.player = {};
    }

    generateKeyController() {
        this.keys = {
            'jump': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            'fire': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL),
            'left': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            'right': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            'duck': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            'menu': this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };

        this.keyController = new KeyController(this.keys, this);
    }

    activateAndPausePrevious(sectorScene) {
        this.pausePrevious(sectorScene);
        this.activate();
    }

    activateAndDestroyPrevious(sectorScene) {
        this.destroyPrevious(sectorScene);
        this.activate();
    }

    activate() {
        this.sector.makeCurrent();
    }

    pausePrevious(sectorScene) {
        sectorScene.pause();
    }

    destroyPrevious(sectorScene) {
        sectorSCene.stop();
    }

    addHealthBar() {
        this.healthBar = new HealthBar({
            key: 'healthbar',
            scene: this,
            x: 90,
            y: 20
        });
    }

    addCoinsDisplay() {
        this.coinsDisplay = new CoinsDisplay({
            scene: this,
            level: this.currentLevel
        });

        this.coinsDisplay.create();
    }

    setCollectedCoins(coins) {
        this.coinsDisplay.setCollectedCoins(coins);
    }

    addCollectedCoin() {
        this.coinsDisplay.addCollectedCoin();
    }

    setHealthBar(newHealth) {
        this.healthBar.setHealth(newHealth);
    }

    getKeyController() {
        return this.keyController;
    }

    preload() {
        this.loadImages();
        this.loadTilemaps();
        this.loadCoinTiles();
        this.loadBackgroundImage(this.sector.getBackgroundImage());
        this.loadSounds();
        this.generateKeyController();
    }

    create() {
        this.sector.parseTilemaps();
        this.createDynamicForeGrounds();
        this.createStaticForegrounds();
        this.createBackground();
        this.parseBackgroundImages();
        this.parseLava();
        this.parseAntarcticWater();
        this.makeAnimations();
        this.makeSounds();
        this.createMap();
        this.addPlayer();

        this.addHealthBar();
        this.addCoinsDisplay();
        this.initCamera();

        this.createCoinSpritesGroup();
        this.createEnemySpritesGroup();
        this.createHurtableTilesGroup();
        this.createCollisionTilesGroup();
        this.createPowerupGroup();

        this.physics.add.collider(this.coinGroup, this.groundLayer);
        this.playerGroundCollider = this.physics.add.collider(this.player, this.groundLayer);
        this.woodCollider = this.physics.add.collider(this.player, this.collisionTilesGroup, this.woodHit);

        this.physics.world.bounds.width = this.groundLayer.width;
        this.physics.world.bounds.height = this.groundLayer.height;
        this.groundLayer.setCollisionByExclusion(0, true);

        this.physics.world.enable(this.player);
        this.physics.world.setBoundsCollision(true, true, true, true);
    }

    createMap() {
        var tileData = this.sector.getTileData();
        var map = this.make.tilemap({ key: 'map', data: tileData, width: tileData[0].length, height: 21, tileWidth: 32, tileHeight: 32 });
        var sectorTilesets = this.sector.getTilesets();
        var tilesets = [];

        for (var i = 0; i < sectorTilesets.length; i++) {
            var tilesetObject = sectorTilesets[i];
            var tileset = map.addTilesetImage(tilesetObject.name);

            tileset.firstgid = tilesetObject.firstgid;
        }

        this.groundLayer = map.createLayer(0, ['snow1', 'snow2', 'snow3'], 0, 0);
    }

    addPlayer() {
        this.player = new Tux({
            key: "tux",
            scene: this,
            x: gameSession.playerPositionX != null ? gameSession.playerPositionX : this.sector.sectorData.playerPosition.x * 32,
            y: gameSession.playerPositionY != null ? gameSession.playerPositionY : this.sector.sectorData.playerPosition.y * 32,
            health: gameSession.tuxStats.health,
            level: Level.getCurrentLevel()
        });

        this.player.body.setCollideWorldBounds(true);
    }

    createCoinSpritesGroup() {
        this.coinGroup = this.add.group();
        this.parseCoinLayer();
    }

    createEnemySpritesGroup() {
        this.enemyGroupCreated = false;
        this.enemyGroup = this.add.group();
        this.parseEnemyLayer();
        this.enemyGroupCreated = true;
    }

    createHurtableTilesGroup() {
        this.hurtableTilesGroup = this.add.group();
        this.parseHurtableTiles();
    }

    createCollisionTilesGroup() {
        this.collisionTilesGroup = this.add.group();
        this.parseCollisionTilesLayer();
    }

    createPowerupGroup() {
        this.powerupGroup = this.add.group();
    }

    parseCoinLayer() {
        var coinTiles = this.sector.getCoinTiles();
        var coinSprites = [];
        var self = this;

        coinTiles.forEach(function (preloadedCoin, idx) {
            let coin = new Coin({
                id: idx,
                key: 'coin',
                scene: self,
                x: preloadedCoin.x,
                y: preloadedCoin.y,
                player: self.player,
                level: self.level
            });

            self.coinGroup.add(coin);
            coinSprites.push(coin);
        });

        this.coinSprites = coinSprites;
    }   

    addCollectedCoin() {
        this.sectorCoinsCollected++;
        Level.getCurrentLevel().addCollectedCoin();
        this.updateTotalCoinsCollectedUI();
    }

    updateTotalCoinsCollectedUI() {
        this.setCollectedCoins(this.sectorCoinsCollected);
    }

    parseEnemyLayer() {
        var enemies = this.sector.getEnemyObjects();
        var creatureObjects = [];
        var self = this;

        enemies.forEach((enemy) => self.creatures.push(enemy));

        for (var i = 0; i < this.creatures.length; i++) {
            var creature = this.creatures[i];
            var creatureObject;

            switch (creature.name) {
                case "snowball":
                    creatureObject = new SnowBall({
                        id: i,
                        scene: this,
                        key: "snowball",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        sector: this.sector,
                        powerUps: creature.powerUps
                    });

                    break;
                case "bouncing-snowball":
                    creatureObject = new BouncingSnowBall({
                        id: i,
                        scene: this,
                        key: "bouncing-snowball",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        sector: this.sector,
                        powerUps: creature.powerUps
                    });

                    break;

                case "flying-snowball":
                    creatureObject = new FlyingSnowBall({
                        id: i,
                        scene: this,
                        key: "flying-snowball",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        sector: this.sector,
                    });

                    break;
                case "iceblock":
                    creatureObject = new MrIceBlock({
                        id: i,
                        scene: this,
                        key: "mriceblock",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        sector: this.sector,
                        powerUps: creature.powerUps
                    });

                    break;

                case "jumpy":
                    creatureObject = new Jumpy({
                        id: i,
                        scene: this,
                        key: "jumpy",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        sector: this.sector,
                    });

                    break;

                case "plasma-gun":
                    creatureObject = new PlasmaGun({
                        id: i,
                        scene: this,
                        key: "plasma-gun",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        player: this.player,
                        sector: this.sector,
                    });

                    break;

                //case "krosh":
                //    creatureObject = new Krosh({
                //        id: i,
                //        scene: this,
                //        key: "krosh",
                //        x: creature.position.x * 32,
                //        y: creature.position.y * 32,
                //        stopY: creature.position.stopY,
                //        realY: creature.position.realY,
                //        player: this.player,
                //        sector: this.sector,
                //    });

                //    break;

                case "fish":
                    creatureObject = new Fish({
                        id: i,
                        scene: this,
                        key: "fish",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        up: creature.up,
                        down: creature.down,
                        flip: creature.flip,
                        player: this.player,
                        sector: this.sector,
                    });

                    break;
                /*
                case "ghoul":
                    creatureObject = new Ghoul({
                        id: i,
                        scene: this,
                        key: "ghoul",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        sector: this.sector,
                    });

                    break;*/

                case "spiky":
                    creatureObject = new Spiky({
                        id: i,
                        scene: this,
                        key: "spiky",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        sleeping: creature.sleeping,
                        player: this.player,
                        sector: this.sector,
                    });

                    break;
            }

            if (creatureObject != null) {
                creatureObjects.push(creatureObject);
                this.enemyGroup.add(creatureObject);
            }

        }

        this.creatureObjects = creatureObjects;
    }

    parseHurtableTiles() {
        var sectorHurtableTiles = this.sector.getHurtableTiles();

        for (var i = 0; i < sectorHurtableTiles.length; i++) {
            let hurtableTile = sectorHurtableTiles[i];

            if (hurtableTile.type.startsWith("spk-")) {
                hurtableTile = this.addSpike(preloadedSpike.x, preloadedSpike.y, preloadedSpike.position);
            }

            this.hurtableTiles.push(hurtableTile);
        }
    }

    parseCollisionTilesLayer() {
        var sectorCollisionTiles = this.sector.getCollisionTiles();
        var self = this;

        sectorCollisionTiles.forEach(function (collisionTile, idx) {
            var tile;

            if (collisionTile.type.startsWith("icebridge-")) {
                let tileIndex = 2;

                if (collisionTile.type == "icebridge-start") {
                    tileIndex = 0;
                } else if (collisionTile.type == "icebridge-mid") {
                    tileIndex = 1;
                }

                tile = self.add.sprite(collisionTile.x, collisionTile.y, "icebridge", tileIndex);
            } else if (collisionTile.type == "single-wood") {
                tile = self.add.sprite(collisionTile.x, collisionTile.y, "wood-single");
            } else if (collisionTile.type == "wood-start") {
                tile = self.add.sprite(collisionTile.x, collisionTile.y, "wood", 0);
            } else if (collisionTile.type == "wood-mid") {
                tile = self.add.sprite(collisionTile.x, collisionTile.y, "wood", 1);
            } else if (collisionTile.type == "wood-end") {
                tile = self.add.sprite(collisionTile.x, collisionTile.y, "wood", 4);
            } else if (collisionTile.type.startsWith(SpriteKeyConstants.INDUSTRIAL)) {
                tile = self.add.sprite(collisionTile.x, collisionTile.y, "industrial", collisionTile.type.replace(SpriteKeyConstants.INDUSTRIAL, "")); //here error!
            } else {
                return;
            }

            self.physics.world.enableBody(tile, 0);
            tile.body.setAllowGravity(false);
            tile.body.setImmovable(true);
            tile.setOrigin(0, 0);

            self.collisionTilesGroup.add(tile);
        });
    }

    createBackground() {
        var backgroundImage = this.add.image(0, 0, 'background');
        backgroundImage.setOrigin(0, 0);
        backgroundImage.scrollFactorX = 0;
        backgroundImage.scrollFactorY = 0;
    }

    parseBackgroundImages() {
        var sectorBackgroundObjects = this.sector.getBackgroundObjects();

        for (var i = 0; i < sectorBackgroundObjects.length; i++) {
            var preloadedBackgroundObject = sectorBackgroundObjects[i];

            if (preloadedBackgroundObject.type == 'home') {
                this.addHome(preloadedBackgroundObject);
            } else {
                this.add.sprite(preloadedBackgroundObject.x, preloadedBackgroundObject.y, preloadedBackgroundObject.type);
            }        
        }
    }

    addHome(preloadedHome) {
        var foreground = this.add.sprite(preloadedHome.x + 100, preloadedHome.y - 65, 'exitfg');
        var background = this.add.sprite(preloadedHome.x + 242, preloadedHome.y - 65, 'exitbg');

        foreground.flipX = true;
        background.flipX = true;

        background.setDepth(100);
        foreground.setDepth(1000);
    }

    parseLava() {
        var lavaSprites = [];
        var lavaTiles = this.sector.getLava();

        for (var i = 0; i < lavaTiles.length; i++) {
            var preloadedLava = lavaTiles.lava[i];
            let lava = {};

            if (preloadedLava.type == 'plain') {
                lava = this.add.sprite(preloadedLava.x, preloadedLava.y, 'lava');
                lava.setOrigin(0, 0);
                lava.setDepth(120);
                lava.alpha = this.LAVA_ALPHA;
            } else /*if (preloadedAntarcticWater.type == 'top')*/ {
                lava = new Lava({
                    id: i,
                    key: 'lava-' + i,
                    player: this.sector.player,
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

    parseAntarcticWater() {
        for (var i = 0; i < this.sector.additionalTiles.water.length; i++) {
            var preloadedAntarcticWater = this.additionalTiles.water[i];

            let water = {};

            if (preloadedAntarcticWater.type == 'plain') {
                water = this.add.sprite(preloadedAntarcticWater.x, preloadedAntarcticWater.y, 'antarctic-water');
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

    loadBackgroundImage(backgroundImage) {
        this.preloadImage('background', backgroundImage);
    }

    loadCoinTiles() {
        this.preloadImage('coin-2', './assets/images/objects/coins.png');
    }

    preloadImage(name, value) {
        this.load.image(name, value);
    }

    initCamera() {
        this.cameras.main.setBounds(0, 0, this.sector.sectorData.data[0].length * 32, (this.sector.sectorData.data.length - 3) * 32);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.roundPixels = true;
    }

    loadImages() {
        this.loadNecessaryImages();
        this.loadEnemyImages();
        this.loadParticleImages();
        this.loadTileImages();
        this.loadSlopeImages();
    }

    loadTilemaps() {
        var self = this;
        var tilesets = this.sector.getTilesets();
        tilesets.forEach(function (tileset, idx) {
            self.preloadImage(tileset.name, tileset.value);//correct
        });
    }

    loadNecessaryImages() {
        var keys = ["arrow", "UI", "tux", "backgrounds", "coin", "powerup"];

        this.loadImagesForKeys(keys);
    }

    loadTileImages() {
        var keys = ["coin", "blocks", "industrial", "snow", "lava", "home-exit"];

        this.loadImagesForKeys(keys);
    }

    loadParticleImages() {
        var keys = ["sparkle", "smoke"];

        this.loadImagesForKeys(keys);
    }

    loadSounds() {
        this.load.audio('enemy-fall', './assets/sounds/fall.wav');
    }

    makeSounds() {
        this.sound.add('enemy-fall');
    }

    loadImage(caption, path) {
        this.imageLoader.loadImage(caption, path, 'png');
    }

    loadMultipleImages(caption, path, start, end) {
        this.imageLoader.loadMultipleImages(caption, path, 'png', start, end);
    }

    loadSpriteSheet(caption, path, frameWidth, frameHeight, n) {
        this.imageLoader.loadSpriteSheet(caption, path, frameWidth, frameHeight, n);
    }

    loadImagesFromData(key) {
        this.imageLoader.loadImagesFromData(key);
    }

    loadAnimationsFromData(key) {
        this.animationLoader.loadAnimationsFromData(key);
    }

    loadSlopeImages() {
        this.imageLoader.loadImagesFromData("slope-particles");
        this.imageLoader.loadImagesFromData("slopes");
    }

    loadEnemyImages() {
        var enemyImageKeys = ["snowball", "bouncing-snowball", "flying-snowball", "plasma-gun",
            "mr-iceblock", "mr-bomb", "krosh", "fish", "ghoul", "jumpy", "spiky"];

        this.loadImagesForKeys(enemyImageKeys);
    }

    loadImagesForKeys(imageKeys) {
        var self = this;

        imageKeys.forEach(imageKey => self.loadImagesFromData(imageKey));
    }

    createAnimation(key, frames, frameRate, repeat) {
        if (frameRate == null) {
            frameRate = this.DEFAULT_FRAMERATE;
        }

        if (repeat == null) {
            repeat = this.REPEAT_INFINITELY;
        }

        AnimationCreator.getInstance({ scene: this }).createAnimation(key, frames, frameRate, repeat);
    }

    makeAnimations() {
        var animationKeys = [
            "mr-bomb", "sparkle", "smoke", "tux", "ghoul",
            "bouncing-snowball", "flying-snowball", "snowball", "mr-iceblock", "spiky",
            "fish", "lava-fish", "antarctic-water", "star-moving", "plus-flickering", "coin"
        ];

        this.makeAnimationsForKeys(animationKeys);
    }

    makeAnimationsForKeys(animationKeys) {
        var self = this;

        animationKeys.forEach(animationKey => self.loadAnimationsFromData(animationKey));

        this.createAnimation(
            {
                key: 'lava',
                framesConfig: {
                    caption: 'lava-',
                    start: 1,
                    end: 8
                },
                frameRate: 5,
                repeat: -1
            }
        );
    }

    createDynamicForeGrounds() {
        var sectorDynamicForegrounds = this.sector.getDynamicForegrounds();

        if (sectorDynamicForegrounds == null) { return; }

        var i = 0;
        var level = this;
        var self = this;
        sectorDynamicForegrounds.forEach(function (foreground, ids) {
            var foregroundImage = {};

            if (foreground.startX == null) {
                foreground.startX = 0;
            }

            if (foreground.width == null) {
                foreground.width = level.levelData[0].length;
            }

            foreground.endX = foreground.startX + foreground.width;

            if (foreground.tile == "la") {
                for (var x = foreground.startX; x < foreground.endX; x++) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        if (self.sector.getTileDataValue(x, y) != -1) {
                            self.sector.level.createDynamicForeGroundStillTile(level, x, y, 'lava', level.LAVA_ALPHA, 120);
                        }
                    }
                }
            } else if (typeof foreground.tile == 'number') {
                for (var x = foreground.startX; x < foreground.endX; x++) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        if (self.sector.getTileDataValue(x, y) == 0) {
                            self.sector.setTileDataValue(x, y, foreground.tile);
                        } else if (self.sector.getTileDataValue(x, y) == -1) {
                            self.sector.setTileDataValue(x, y, 0);
                        }
                    }
                }
            } else if (foreground.tile == "la2") {
                for (var x = foreground.startX; x < foreground.endX; x += 4) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        if (self.sector.getTileDataValue(x, y) != -1) {
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
            }
        });
    }

    createDynamicForeGroundStillTile(level, x, y, key, alpha, depth) {
        var foregroundImage = level.scene.add.sprite(x * 32, y * 32, key);

        foregroundImage.setOrigin(0, 0);
        foregroundImage.alpha = level.LAVA_ALPHA;

        if (depth != null) {
            foregroundImage.setDepth(120);
        }
    }

    createStaticForegrounds() {
        var sectorStaticForegrounds = this.sector.getStaticForegrounds();

        if (sectorStaticForegrounds == null) { return; }

        var i = 0;
        var level = this;
        var self = this;
        sectorStaticForegrounds.forEach(function (foreground, ids) {
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

    update(time, delta) {
        this.getKeyController().update();
        this.player.update(time, delta);
        this.player.draw(time, delta);
        this.healthBar.update(time, delta);
        //Sector.currentSector.update(time, delta);
        this.validateCurrentSectorEnds();
        this.forceUpdateSprites(this.creatureObjects, time, delta);
        this.forceUpdateSprites(this.coinSprites, time, delta);
        this.forceUpdateSprites(this.lavaSprites, time, delta);
        this.forceUpdateSprites(this.particleSprites, time, delta);
        this.forceUpdateSprites(this.blockSprites, time, delta);
        this.updatePowerups(time, delta);
    }

    validateCurrentSectorEnds() {
        var tileX = Math.floor(this.player.x / 32);
        var tileY = Math.floor(this.player.y / 32);

        var remainderX = tileX % 32;
        var remainderY = tileY % 32;

        const remainderMarginX = 13;
        const remainderMarginY = 13;

        if (this.sector.sectorData.sectorExits != null && this.sector.sectorData.sectorExits.length > 0) {
            for (var i = 0; i < this.sector.sectorData.sectorExits.length; i++) {
                var sectorExit = this.sector.sectorData.sectorExits[i];
                var nextSector = sectorExit.sector.toLowerCase();

                if (sectorExit.x != null) {
                    //fixed end position
                    if (sectorExit.y != null) {

                    } else {
                        //endx or startx
                        if (sectorExit.x == "endx") {
                            console.log(tileX + " " + remainderX + " " + remainderMarginX);
                            if (tileX == this.sector.sectorData.data[0].length - 1 && 32 - remainderX > remainderMarginX) {
                                //load next sector endx
                                this.loadSector(sectorExit);
                            }
                        } else if (sectorExit.x == "startx") {
                            if (tileX == 0 && remainderX < 32 - remainderMarginX) {
                                //load next sector startx
                                this.loadSector(sectorExit);
                            }
                        }
                    }
                } else if (sectorExit.y != null) {
                    //endy or starty
                    if (sectorExit == "endy") {

                    } else if (sectorExit == "starty") {

                    }
                }
            }
        }
    }

    loadSector(sectorExit) {
        if (sectorExit.sector == "prev") {
            this.loadPreviousSector();
        } else if (sectorExit.sector == "next") {
            this.loadNextSector();
        } else {
            this.loadNewSector(sectorExit.sector);
        }
    }

    loadNewSector(key) {
        var sector = Level.getCurrentLevel().createSectorByKey(key);

        this.createNewSectorScene(sector);
    }

    loadPreviousSector() {
        var level = Level.getCurrentLevel();
        var sectorData = level.getPreviousSector(this.sector.sectorData.key);
        var sector = level.createSectorByData(sectorData);

        this.createNewSectorScene(sector);
    }

    loadNextSector() {
        var level = Level.getCurrentLevel();
        var sectorData = level.getNextSector(this.sector.sectorData.key);
        var sector = level.createSectorByData(sectorData);

        this.createNewSectorScene(sector);
    }

    createNewSectorScene(sector) {
        sector.makeCurrent();
        SectorSwapper.createNewSectorScene(this);
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

    updatePowerups(time, delta) {
        Array.from(this.powerupGroup.children.entries).forEach(
            (powerup) => {
                powerup.update(time, delta);
            });
    }

    addEgg(x, y, direction, timer) {
        let egg = new EggPowerUp({
            scene: this,
            key: "egg",
            x: x,
            y: y,
            player: this.player,
            sector: this.sector,
            direction: direction,
            incollectableForTimer: timer
        });

        this.powerupGroup.add(egg);
    }

    addPlus(x, y, direction, timer) {
        let plus = new PlusPowerUp({
            scene: this,
            key: "plus",
            x: x,
            y: y,
            player: this.player,
            sector: this.sector,
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
            sector: this,
            emerge: emerge
        });

        this.powerupGroup.add(bouncyCoin);
    }

    removeEnemy(enemy) {
        this.enemyGroup.remove(enemy);
        var index = enemy.id;
        this.creatureObjects[index] = null;
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

class SectorScene1 extends SectorScene {
    constructor(config) {
        super({ key: "SectorScene1" });
    }

    update(time, delta) {
        super.update(time, delta);
    }
}

class SectorScene2 extends SectorScene {
    constructor(config) {
        super({ key: "SectorScene2" });
    }

    update(time, delta) {
        super.update(time, delta);
    }
}

class SectorScene3 extends SectorScene {
    constructor(config) {
        super({ key: "SectorScene3" });
    }

    update(time, delta) {
        super.update(time, delta);
    }
}