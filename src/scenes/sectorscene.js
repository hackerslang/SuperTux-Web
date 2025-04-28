import { game, CANVAS_WIDTH, CANVAS_HEIGHT } from '../game.js';
import { ImageLoader } from '../helpers/imageloader.js';
import { AnimationLoader } from '../helpers/animationloader.js';
import { AnimationCreator } from '../helpers/animationcreator.js';
import { FontLoader } from '../object/ui/fontloader.js';
import { KeyController } from '../object/controller.js';
import { SpriteKeyConstants } from '../object/level/tile_creator.js';
import { Level } from '../object/level/level.js';
import { Sector } from '../object/level/sector.js';
import { GameSession } from '../object/game_session.js';
import { gameSession } from './levelselectscene.js';
import { SectorSwapper } from '../object/level/sector_swapper.js';
import { Tux } from '../creatures/player.js';
import { MrIceBlock } from '../creatures/mr_iceblock.js';
import { SnowBall } from '../creatures/snowball.js';
import { BouncingSnowBall } from '../creatures/bouncing_snowball.js';
import { FlyingSnowBall } from '../creatures/flying_snowball.js';
import { Jumpy } from '../creatures/jumpy.js';
import { Spiky, HellSpiky } from '../creatures/spiky.js';
import { Fish } from '../creatures/fish.js';
import { Coin } from '../object/coin.js';
import { PlusPowerUp } from '../object/powerup/plus.js';
import { EggPowerUp } from '../object/powerup/egg.js';
import { HealthBar } from '../object/ui/healthbar.js';
import { LivesDisplay } from '../object/ui/livesdisplay.js';
import { CoinsDisplay } from '../object/ui/coinsdisplay.js';
import { FallingPlatform } from '../object/blocks/fallingplatform.js';
import { InvisibleWallBlock } from '../object/blocks/invisiblewallblock.js';
import { Lava } from '../object/lava.js';
import { GlobalGameConfig } from '../game.js';
import { CameraButtons } from '../object/ui/debug/camerabuttons.js';

export var currentSceneKey = "";

export class SectorScene extends Phaser.Scene {
    constructor(config) {
        super({ key: config.key });
        this.key = config.key;
        this.imageLoader = new ImageLoader({ scene: this });
        this.animationLoader = new AnimationLoader({ scene: this });

        this.DEFAULT_FRAMERATE = 10;
        this.REPEAT_INFINITELY = -1;

        this.canSaveOrLoad = false;
    }

    static currentSectorScene = null;
    static getCurrentSectorScene() {
        return SectorSwapper.getCurrentSectorScene();
    }

    generateKeyController() {
        this.keyController = new KeyController(this);

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
        sectorScene.stop();
    }

    addHealthBar() {
        this.healthBar = new HealthBar({
            key: 'healthbar',
            scene: this,
            x: 90,
            y: 20,
            initHealth: GameSession.session.sectorKey == this.sector.sectorData.key ? GameSession.session.health : null
        });
    }

    addCoinsDisplay() {
        this.coinsDisplay = new CoinsDisplay({
            scene: this,
            level: this.currentLevel
        });

        this.coinsDisplay.create();
    }

    addLivesDisplay() {
        this.livesDisplay = new LivesDisplay({
            scene: this,
            level: this.currentLevel
        });

        this.livesDisplay.create();
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

    initCursor() {
        this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor.png), pointer');

        this.input.on('pointerdown', (pointer, gameObjects) => {
            this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor-click.png), pointer');
        });

        this.input.on('pointerup', (pointer, gameObjects) => {
            this.input.setDefaultCursor('url(./assets/images/ui/cursor/mousecursor.png), pointer');
        });
    }

    loadFonts() {
        var fontLoader = new FontLoader();

        fontLoader.loadFont(this, "SuperTuxSmallFont");
    }

    async preload() {
        this.canSaveOrLoad = false;
        this.sector = Sector.getCurrentSector();
        
;        if (this.sector != null) {
            this.creatures = this.sector.sectorData.creatures;
            this.sectorCoinsCollected = 0;

            if (this.creatures == null) {
                this.creatures = [];
            }

            this.enemyCollisionExtraTilesGroup = this.add.group();

            this.hasPaused = false;
            this.player = {};

            this.loadFonts();
            this.loadImages();
            await this.loadTilemaps();
            this.loadCoinTiles();
            this.loadBackgroundImage(this.sector.getBackgroundImage());
            this.loadSounds();
            this.generateKeyController();
            this.initCursor();
        }
    }

    create() {
        this.canSaveOrLoad = false;
        if (this.sector != null || !levelsLoaded) {
            this.staticObjects = [];
            this.textsToUpdate = [];
            this.sector.parseTilemaps();
            this.createBackground();
            this.parseBackgroundImages();
            this.makeAnimations();

            this.addPlayer();
            
            this.parseAntarcticWater();
            
            this.makeSounds();
            this.createMap();
            
            this.parseInvisibleWallBlocks();
            this.createFallingPlatforms();

            this.addHealthBar();
            this.addLivesDisplay();
            this.addCoinsDisplay();
            this.initCamera();

            this.createCoinSpritesGroup();
            this.createEnemySpritesGroup();
            this.createHurtableTilesGroup();
            this.createCollisionTilesGroup();
            this.createPowerupGroup();

            this.createPlayerCollisionObjectsGroup();

            this.physics.add.collider(this.coinGroup, this.groundLayer);
            this.playerGroundCollider = this.physics.add.collider(this.player, this.groundLayer);
            this.woodCollider = this.physics.add.collider(this.player, this.collisionTilesGroup, this.woodHit);
            this.enemyCollisionTilesCollider = this.physics.add.collider(this.enemyCollisionExtraTilesGroup, this.collisionTilesGroup, this.woodHit);

            this.physics.world.bounds.width = this.groundLayer.width;
            this.physics.world.bounds.height = this.groundLayer.height;
            this.groundLayer.setCollisionByExclusion(0, true);

            this.physics.world.enable(this.player);
            this.physics.world.setBoundsCollision(true, true, true, true);
            
            this.createDynamicForeGrounds();
            this.createStaticForegrounds();
            this.parseLava();

            this.cameraDebugButtons = null;

            if (this.isDebug()) {
                this.cameraDebugButtons = new CameraButtons({ scene: this });
            }
        }
    }

    isDebug() {
        return GlobalGameConfig.physics.arcade.debug;
    }

    createMap() {
        var tileData = this.sector.getTileData();
        var map = this.make.tilemap({ key: 'map', data: tileData, width: tileData[0].length, height: 21, tileWidth: 32, tileHeight: 32 });
        var sectorTilesets = this.sector.getTilesets();
        var tilesetNames = sectorTilesets.map(tileset => tileset.name);

        for (var i = 0; i < sectorTilesets.length; i++) {
            var tilesetObject = sectorTilesets[i];
            var tileset = map.addTilesetImage(tilesetObject.name);

            tileset.firstgid = tilesetObject.firstgid;
        }

        this.groundLayer = map.createLayer(0, tilesetNames, 0, 0);
    }

    addPlayer() {
        var playerPositionX = this.sector.sectorData.playerPosition.x * 32;
        var playerPositionY = this.sector.sectorData.playerPosition.y * 32;

        if (GameSession.session.sectorKey == this.sector.sectorData.key) {
            if (GameSession.session.playerPosition != null) {
                playerPositionX = GameSession.session.playerPosition.x;
                playerPositionY = GameSession.session.playerPosition.y;
            }
        }
        
        this.player = new Tux({
            key: "tux",
            scene: this,
            x: playerPositionX,
            y: playerPositionY,
            health: GameSession.session.sectorKey == this.sector.sectorData.key ? GameSession.session.health : null,
            level: Level.getCurrentLevel()
        });

        if (GameSession.session.sectorKey == this.sector.sectorData.key) {
            if (GameSession.session.playerVelocity != null) {
                this.player.body.velocity.x = GameSession.session.playerVelocity.x;
                this.player.body.velocity.y = GameSession.session.playerVelocity.y;
            }
        }

        this.player.body.setCollideWorldBounds(true);
    }

    createCoinSpritesGroup() {
        this.coinGroup = this.add.group();
        this.parseCoinLayer();
    }

    createEnemySpritesGroup() {
        this.enemyGroupCreated = false;
        this.enemyGroup = this.add.group();
        this.enemyCollisionGroup = this.add.group();
        
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

    createPlayerCollisionObjectsGroup() {
        var self = this;
        this.playerCollisionObjectsGroup = this.add.group();

        for (var i = 0; i < this.enemyGroup.children.length; i++) {
            var enemy = this.enemyGroup.children[i];
            if (enemy.playerCollides) {
                this.playerCollisionObjectsGroup.add(enemy);
            }
        }

        for (var i = 0; i < this.hurtableTilesGroup.children.length; i++) {
            var hurtableTile = this.hurtableTilesGroup.children[i];

            this.playerCollisionObjectsGroup.add(hurtableTile);
        }

        //for (var i = 0; i < this.staticObjects.children.length; i++) {
        //    var staticObject = this.staticObjects.children[i];

        //    this.playerCollisionObjectsGroup.add(staticObject);
        //}
    }

    getPlayerCollisionObjectsGroup() {
        return this.playerCollisionObjectsGroup;
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
            this.creatures[i].id = i;
        }

        if (this.sector.sectorData.key == GameSession.session.sectorKey) {
            if (GameSession.session.enemiesPositions != null && GameSession.session.enemiesPositions.length > 0) {
                this.creatures = this.creatures.filter((creature) =>
                    GameSession.session.enemiesPositions.findIndex((ep) => ep.id == creature.id) > -1);
            }
        }

        for (var i = 0; i < this.creatures.length; i++) {
            var creature = this.creatures[i];
            var creatureObject;

            switch (creature.name) {
                case "snowball":
                    creatureObject = new SnowBall({
                        id: creature.id,
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
                //case "bouncing-snowball":
                //    creatureObject = new BouncingSnowBall({
                //        id: creature.id,
                //        scene: this,
                //        key: "bouncing-snowball",
                //        x: creature.position.x * 32,
                //        y: creature.position.y * 32,
                //        realY: creature.position.realY,
                //        player: this.player,
                //        sector: this.sector,
                //        powerUps: creature.powerUps
                //    });

                //    break;

                case "flying-snowball":
                    creatureObject = new FlyingSnowBall({
                        id: creature.id,
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
                        id: creature.id,
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
                        id: creature.id,
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
                        id: creature.id,
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
                //        id: creature.id,
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
                        id: creature.id,
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
                        id: creature.id,
                        scene: this,
                        key: "ghoul",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        realY: creature.position.realY,
                        player: this.player,
                        sector: this.sector,
                    });

                    break;*/

                case "hellspiky":
                    creatureObject = new HellSpiky({
                        id: creature.id,
                        scene: this,
                        key: "hellspiky",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        angry: creature.angry,
                        player: this.player,
                        sector: this.sector,
                    });

                    break;

                case "spiky":
                    creatureObject = new Spiky({
                        id: creature.id,
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

                if (creatureObject.collidesWithExtraTiles) {
                    this.enemyCollisionExtraTilesGroup.add(creatureObject);
                }

                if (creatureObject.collidesWithOtherEnemies) {
                    this.enemyCollisionGroup.add(creatureObject);
                }
            }
        }

        this.creatureObjects = creatureObjects;

        if (this.sector.sectorData.key == GameSession.session.sectorKey) {
            if (GameSession.session.enemiesPositions != null && GameSession.session.enemiesPositions.length > 0) {
                this.creatureObjects.forEach((creature) =>
                    creature.initWithGameSession(GameSession.session.enemiesPositions.find((ep) => ep.id == creature.id)));
            }
        }
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
        var lavaTiles = this.sector.getLava();

        if (this.lavaSprites == null) {
            this.lavaSprites = [];
        }

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
                    player: this.player,
                    scene: this,
                    x: preloadedLava.x,
                    y: preloadedLava.y,
                    level: Level.currentLevel,
                    alpha: this.LAVA_ALPHA
                });

                this.lavaSprites.push(lava);
            }
        }
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

    parseInvisibleWallBlocks() {
        this.invisibleWalls = [];

        var sectorInvisibleWalls = this.sector.getInvisibleWalls();

        if (sectorInvisibleWalls != null) {
            for (var i = 0; i < sectorInvisibleWalls.length; i++) {
                var invisibleBlockPoint = sectorInvisibleWalls[i];
                var invisibleBlock = new InvisibleWallBlock({
                    scene: this,
                    player: this.player,
                    x: invisibleBlockPoint.x,
                    y: invisibleBlockPoint.y
                });

                this.invisibleWalls.push(invisibleBlock);
                this.staticObjects.push(invisibleBlock);
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
        this.loadWeatherImages();
    }

    async loadTilemaps() {
        var self = this;
        var tilesets = this.sector.getTilesets();

        tilesets.forEach(function (tileset, idx) {
            self.preloadImage(tileset.name, tileset.value);//correct
        });
    }

    loadNecessaryImages() {
        var keys = ["arrow", "invisible-wall", "UI", "debug-camera", "tux", "backgrounds", "coin", "powerup"];

        this.loadImagesForKeys(keys);
    }

    loadTileImages() {
        var keys = ["coin", "blocks", "industrial", "snow", "lava", "home-exit", "acid-rain"];

        this.loadImagesForKeys(keys);
    }

    loadWeatherImages() {
        var keys = ["acid-rain"];

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

    animationIsLoaded(key) {
        return this.anims.anims.entries != null && this.anims.anims.entries.length > 0 && this.anims.exists(key) != null;
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
            "mr-bomb", "sparkle", "smoke", "tux", "ghoul", "lava",
            "bouncing-snowball", "flying-snowball", "snowball", "mr-iceblock", "spiky",
            "fish", "lava-fish", "antarctic-water", "star-moving", "plus-flickering", "coin"
        ];

        this.makeAnimationsForKeys(animationKeys);
    }

    static loadedAnimations = [];

    makeAnimationsForKeys(animationKeys) {
        var self = this;

        animationKeys.forEach(animationKey => {
            if (SectorScene.loadedAnimations.indexOf(animationKey) === -1) {
                self.loadAnimationsFromData(animationKey);
                SectorScene.loadedAnimations.push(animationKey);
            }
        });

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
        var player = self.player;

        if (this.lavaSprites == null) {
            this.lavaSprites = [];
        }

        for (var i = 0; i < sectorDynamicForegrounds.length; i++) {
            var foreground = sectorDynamicForegrounds[i];
            var foregroundImage = {};

            if (foreground.startX == null) {
                foreground.startX = 0;
            }

            if (foreground.width == null) {
                foreground.width = self.sector.sectorData.data[0].length;
            }

            foreground.endX = foreground.startX + foreground.width;

            if (foreground.tile == "la") {
                for (var x = foreground.startX; x < foreground.endX; x++) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        if (self.sector.getTileDataValue(x, y) != -1) {
                            self.createDynamicForeGroundStillTile(level, x, y, 'lava', level.LAVA_ALPHA, 120);
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
                /*
                lava = new Lava({
                    id: i,
                    key: 'lava-' + i,
                    player: this.player,
                    scene: this,
                    x: preloadedLava.x,
                    y: preloadedLava.y,
                    level: Level.currentLevel,
                    alpha: this.LAVA_ALPHA
                });
                */
            } else if (foreground.tile == "la2") {
                for (var x = foreground.startX; x < foreground.endX; x += 4) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        if (self.sector.getTileDataValue(x, y) != -1) {
                            var lavaForeground = new Lava({
                                id: i,
                                key: 'lava-' + i,
                                player: this.player,
                                scene: this,
                                x: x * 32,
                                y: y * 32,
                                alpha: Level.currentLevel.LAVA_ALPHA
                            });

                            this.lavaSprites.push(lavaForeground);

                            i++;
                        }
                    }
                }
            }
        }
    }

    createDynamicForeGroundStillTile(level, x, y, key, alpha, depth) {
        var foregroundImage = this.add.sprite(x * 32, y * 32, key);

        foregroundImage.setOrigin(0, 0);
        foregroundImage.alpha = Level.currentLevel.LAVA_ALPHA;

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

    createFallingPlatforms() {
        this.fallingPlatformSprites = [];

        var fallingPlatforms = this.sector.getFallingPlatforms();

        if (fallingPlatforms == null) { return; }

        var level = this;
        var self = this;

        fallingPlatforms.forEach(function (platform, idx) {
            var platformImage = new FallingPlatform({
                id: idx + 10000,
                key: "falling-platform-" + idx,
                player: self.player,
                scene: self,
                texture: platform.texture,
                x: platform.x * 32,
                y: platform.y * 32,
                width: platform.width,
                height: platform.height
            });

            self.fallingPlatformSprites.push(platformImage);
            self.staticObjects.push(platformImage);
        });
    }

    update(time, delta) {
        if (this.sector == null) { return; }
        
        this.canSaveOrLoad = true;

        if (this.quickSaveGameText != null) { this.quickSaveGameText.update(time, delta); }

        this.getKeyController().update();
        this.handleOptionsKeys();

        if (this.interruptUpdate) { return; }

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
        this.forceUpdateSprites(this.fallingPlatformSprites, time, delta);
        this.updateCameraButtonsIfNeeded(time, delta);
        this.updatePowerups(time, delta);
    }

    updateCameraButtonsIfNeeded(time, delta) {
        if (this.cameraDebugButtons !== null) {
            this.cameraDebugButtons.update(time, delta);
        }
    }

    handleOptionsKeys() {
        this.interruptUpdate = false;

        if (this.getKeyController().pressed('menu') && !this.player.killed) {
            this.launchMenu();
        }

        if (this.getKeyController().pressed('quicksave') && !this.player.killed) {
            this.quickSave();
        }

        if (this.getKeyController().pressed('quickload')) {
            this.quickLoad();
            this.interruptUpdate = true;
        }

        if (this.getKeyController().pressed('pause')) {
            this.pause();
        }
    }

    quickSave() {
        if (!this.canSaveOrLoad) { return; }

        var fontLoader = new FontLoader();
        var session = GameSession.createSaveSessionDuringScene(this);
        var saved = "Saved ...";

        GameSession.quickSaveGame(session);

        this.quickSaveGameText = fontLoader.displayText({ scene: this, fontName: "SuperTuxSmallFont", x: CANVAS_WIDTH - 30 - (saved.length * 18), y: 70, text: saved, fade: true, fadeFactor: 1 });
    }

    createSaveSession() {

    }

    quickLoad() {
        if (!this.canSaveOrLoad) { return; }
        
        var session = GameSession.quickLoadGame();

        this.scene.start("LoadGameScene", { loadSlot: "SuperTuxWeb-QuickSave", loadGameType: "loadgame" });
    }

    restartCurrentSector() {
        var sceneKey = SectorSwapper.getCurrentSceneKey();

        this.scene.stop(sceneKey);
        this.scene.start("LoadGameScene", { loadGameType: "resetsector" });
    }
    
    pause() {
        var sceneKey = SectorSwapper.getCurrentSceneKey();

        game.scene.pause(sceneKey);
        game.scene.start("PauseScene");
    }

    launchMenu() {
        var sceneKey = SectorSwapper.getCurrentSceneKey();

        Sector.currentSectorScene = this;

        game.scene.pause(sceneKey);
        game.scene.start("GameMenuScene");
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

    async loadNextSector() {
        var level = Level.getCurrentLevel();
        var sectorData = await level.getNextSector(this.sector.sectorData.key);
        var sector = level.createSectorByData(sectorData);

        this.createNewSectorScene(sector);
    }

    createNewSectorScene(sector) {
        sector.makeCurrent();
        SectorSwapper.createNewSectorScene(this);
    }

    isFreeOfMovingStatics(x, y) {
        for (var staticObject in this.staticObjects) {
            if (staticObject.left <= x && staticObject.right >= x &&
                staticObject.top <= y && staticObject.bottom >= y) {
                return false;
            }
        }

        return true;
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

export class SectorScene1 extends SectorScene {
    constructor(config) {
        super({ key: "SectorScene1" });
    }

    update(time, delta) {
        super.update(time, delta);
    }
}

export class SectorScene2 extends SectorScene {
    constructor(config) {
        super({ key: "SectorScene2" });
    }

    update(time, delta) {
        super.update(time, delta);
    }
}

export class SectorScene3 extends SectorScene {
    constructor(config) {
        super({ key: "SectorScene3" });
    }

    update(time, delta) {
        super.update(time, delta);
    }
}