import { CollisionSystem } from '../collision/collision_system.js';
import { LavaFishJumping } from '../creatures/fish.js';
import { FlyingSnowBall } from '../creatures/flying_snowball.js';
import { Jumpy } from '../creatures/jumpy.js';
import { MrIceBlock } from '../creatures/mr_iceblock.js';
import { LeanTux, Tux } from '../creatures/player.js';
import { SnowBall } from '../creatures/snowball.js';
import { HellSpiky, Spiky } from '../creatures/spiky.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH, game, GlobalGameConfig } from '../game.js';
import { AnimationCreator } from '../helpers/animationcreator.js';
import { AnimationLoader } from '../helpers/animationloader.js';
import { AtlasLoader } from '../helpers/atlasloader.js';
import { AudioLoader } from '../helpers/audioloader.js';
import { ImageLoader } from '../helpers/imageloader.js';
import { FallingPlatform } from '../object/blocks/fallingplatform.js';
import { InvisibleWallBlock } from '../object/blocks/invisiblewallblock.js';
import { Platform } from '../object/blocks/platform.js';
import { Coin } from '../object/coin.js';
import { KeyController } from '../object/controller.js';
import { StompEffect } from '../object/effects/tremble_effect.js';
import { GameSession } from '../object/game_session.js';
import { Lava } from '../object/lava.js';
import { Level } from '../object/level/level.js';
import { Sector } from '../object/level/sector.js';
import { SectorSwapper } from '../object/level/sector_swapper.js';
import { Tile } from '../object/level/tile.js';
import { SpriteKeyConstants } from '../object/level/tile_creator.js';
import { TilemapParser } from '../object/level/tilemap_parser.js';
import { EggPowerUp } from '../object/powerup/egg.js';
import { PlusPowerUp } from '../object/powerup/plus.js';
import { Spike } from '../object/spike.js';
import { CoinsDisplay } from '../object/ui/coinsdisplay.js';
import { Cursor } from '../object/ui/cursor.js';
import { CameraButtons } from '../object/ui/debug/camerabuttons.js';
import { FontLoader } from '../object/ui/fontloader.js';
import { HealthBar } from '../object/ui/healthbar.js';
import { LivesDisplay } from '../object/ui/livesdisplay.js';

export var currentSceneKey = "";

export class SectorScene extends Phaser.Scene {
    constructor(config) {
        super({ key: config.key });
        this.key = config.key;
        this.authors = config.authors || ["Hackerslang"];
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
    
    startDestroying() {
        this.destroyingScene = true;
        this.createDarkeningOverlayAndRestartScene();
    }

    createDarkeningOverlayAndRestartScene(startAlpha, endAlpha) {
        startAlpha = startAlpha === undefined ? 0 : startAlpha;
        endAlpha = endAlpha === undefined ? 1 : endAlpha;

        var startColor = startAlpha === 0 ? 0x000000 : 0xffffff;

        try {
            if (this.deathOverlay === undefined) {
                const width = (this.sys && this.sys.game && this.sys.game.config && this.sys.game.config.width) ? this.sys.game.config.width : (this.cameras && this.cameras.main ? this.cameras.main.width : 800);
                const height = (this.sys && this.sys.game && this.sys.game.config && this.sys.game.config.height) ? this.sys.game.config.height : (this.cameras && this.cameras.main ? this.cameras.main.height : 600);

                this.deathOverlay = this.add.rectangle(0, 0, width, height, 0x000000)
                    .setOrigin(0, 0)
                    .setScrollFactor(0)
                    .setDepth(10000)
                    .setAlpha(startAlpha);
            }

            var self = this;
            this.fadeTweenComplete = true;
            this.tweens.add({
                targets: self.deathOverlay,
                alpha: endAlpha,
                duration: 1000,
                ease: 'Linear',
                onComplete: () => {
                    self.fadeTweenComplete = true;
                    if (endAlpha === 1) {
                        SectorSwapper.restartScene(self);
                    }
                }
            });
        } catch (e) {
            console.warn('Failed to start death fade tween', e);
        }
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

    setHealthBar(newHealth) {
        this.healthBar.setHealth(newHealth);
    }

    getKeyController() {
        return this.keyController;
    }

    initCursor() {
        this.cursor = new Cursor({ scene: this });

        this.cursor.setDefaultCursor();

        this.input.on('pointerdown', (pointer, gameObjects) => {
            this.cursor.setCursorDown();
        });

        this.input.on('pointerup', (pointer, gameObjects) => {
            this.cursor.setDefaultCursor();
        });
    }

    loadFonts() {
        var fontLoader = new FontLoader();

        fontLoader.loadFont(this, "SuperTuxSmallFont");
        fontLoader.loadFont(this, "SuperTuxBigColorFul");
    }

    init(data) {
        // store reference in the slot so SectorSwapper can find this scene instance
        if (data && data.slot) {
            data.slot.loadedScene = this;
        }

        // If launched with preloadOnly flag, remember it so we can sleep after create
        this._preloadOnly = data && data.preloadOnly;


    }

    createTitle() {
        this.titleText = this.add.text(CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2) + 50, this.levelTitle, {
            fontFamily: 'SuperTux-Medium',
            fontSize: '24px',
            color: '#007fb4'
        }).setOrigin(0.5, 0.5).setDepth(199999);
    }

    createAuthors() {
        var authors = this.authors.join(", ");
        var contributedBy = "Created by " + authors;

        this.authorsText =this.add.text(CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2) + 50 + 35, contributedBy , {
            fontFamily: 'SuperTux-Medium',
            fontSize: '24px',
            color: '#ffffff'
        }).setScale(0.7).setOrigin(0.5, 0.5).setDepth(199999);
    }

    addLeanPlayer() {
        this.leanPlayer = new LeanTux({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 + 200, key: "tux-strtlvl", scene: this }).setDepth(10005);
    }

    createLevelScreen() {
        //this.load.plugin('rexlineprogressplugin', '../../plugins/rexlineprogressplugin.min.js', true);
        //var self = this;
        this.progressBar = this.add.rexLineProgress(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50, CANVAS_WIDTH * 0.8, 20, 0x366237).setDepth(199999);
        this.progressBar.setScrollFactor(0);
        this.progressBar.setValue(0.05);

        // this.load.on('filecomplete', (fileKey /*, fileType, data */) => {
        //     // Plugin should now be registered; try common factory locations
        //     if (this.add && typeof this.add.rexLineProgress === 'function') {
        //         // factory registered on scene add

        //     } else {
        //         // fallback: try the plugin manager (depends on how plugin registers itself)
        //         const plugin = this.plugins.get && this.plugins.get('rexlineprogressplugin');
        //         if (plugin && typeof plugin.add === 'function') {
        //             this.progressBar = self.add.rexLineProgress({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, color: 0x366237, width: CANVAS_WIDTH * 0.8, height: 20 }).setDepth(199999);

        //             this.progressBar.setValue(0, 1, 100);
        //         }
        //     }
        // });

        // progress update
        this.load.on('progress', (value) => {
            if (this.progressBar) {
                this.progressBar.setValue(value);
            }
        });

        var self = this;

        // queue font
        this.levelTitle = "Antarctica, the beginning";
        this.load.font('SuperTux-Medium', '../../assets/fonts/SuperTux-Medium.ttf', 'truetype');
        this.load.once('complete', () => {
            self.createTitle();
            self.createAuthors();
        });

        // Background should be behind UI -> give it a low depth
        const background = this.add.rectangle(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT * 2, 0x000000)
            .setOrigin(0, 0)
            .setDepth(0)          // low depth so UI is above it
            .setScrollFactor(0);

        // key handlers...
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.createHasEnded) {
                this.clearLevelScreen();
                this.presentByOverlay();
                this.physics.resume();
                this.levelIntroHasEnded = true;
            }
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.createHasEnded) {
                this.clearLevelScreen();
                this.presentByOverlay();
                this.physics.resume();
                this.levelIntroHasEnded = true;
            }
        });

        this.load.start();
    }

    clearLevelScreen() {
        if (this.titleText) {
            this.titleText.destroy();
            this.titleText = null;
        }

        if (this.authorsText) {
            this.authorsText.destroy();
            this.authorsText = null;
        }

        if (this.progressBar) {
            this.progressBar.destroy();
            this.progressBar = null;
        }

        if (this.leanPlayer) {
            this.leanPlayer.destroy();
            this.leanPlayer = null;
        }
    }

    createTitle() {
        // create text and push it above overlays; lock to camera with setScrollFactor(0)
        this.titleText = this.add.text(CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2) + 50, this.levelTitle, {
            fontFamily: 'SuperTux-Medium',
            fontSize: '24px',
            color: '#007fb4'
        }).setOrigin(0.5, 0.5)
            .setDepth(20000)
            .setScrollFactor(0);
    }

    createAuthors() {
        var authors = this.authors ? this.authors.join(", ") : "";
        var contributedBy = "Created by " + authors;

        this.authorsText = this.add.text(CANVAS_WIDTH / 2, (CANVAS_HEIGHT / 2) + 85, contributedBy, {
            fontFamily: 'SuperTux-Medium',
            fontSize: '24px',
            color: '#ffffff'
        }).setScale(0.7).setOrigin(0.5, 0.5)
            .setDepth(20000)
            .setScrollFactor(0);
    }

    loadTexturesLeanTux() {
        var keys = ["tux-lean-startlvlscreen"];
        for (const key of keys) {
            this.imageLoader.loadImagesFromData(key, this);
        }
    }

    loadAnimationsLeanTux() {
        var keys = ["tux-lean-startlvlscreen"];
        for (const key of keys) {
            this.animationLoader.loadAnimationsFromData(key, this);
        }
    }
    
    preload() {
        this.leanTuxLoaded = false;
        this.levelIntroHasEnded = false;
        this.readyToPlay = false;

        this.createHasEnded = false;

        this.imageLoader = new ImageLoader({ scene: this });
        this.atlasLoader = new AtlasLoader({ scene: this });
        this.animationLoader = new AnimationLoader({ scene: this });
        this.audioLoader = new AudioLoader({ scene: this });

        // Create the level screen UI (title, authors, progress bar). It is safe if createLevelScreen
        // also tries to queue the tux assets again because Phaser will ignore duplicate keys.
        this.loadTexturesLeanTux();
        this.createLevelScreen();

        this.physics.pause();

        this.DEFAULT_FRAMERATE = 10;
        this.REPEAT_INFINITELY = -1;

        this.canSaveOrLoad = false;
        this.destroyingScene = false;

        this.readyToPlay = false;

        this.canSaveOrLoad = false;
        this.sector = Sector.getCurrentSector();

        this.progressBar.setValue(0, 10, 100);

        if (this.sector != null) {
            this.creatures = this.sector.sectorData.creatures;
            this.sectorCoinsCollected = 0;

            this.collisionObjects = [];

            this.hasPaused = false;
            this.player = {};

            this.loadFonts();
            this.loadImages();
            this.loadSounds();

            this.progressBar.setValue(20);

            this.fillTilesForeground();
            this.preloadTilesets();
            this.loadCoinTiles();
            this.loadBackgroundImage(this.sector.getBackgroundImage());
            this.generateKeyController();

            this.collisionSystem = new CollisionSystem({ sectorScene: this });
        }
        
        this.progressBar.setValue(0.35);
    }

    preloadTilesets() {
        var sectorTilesets = this.sector.getTilesets();

        sectorTilesets.forEach(ts => {
            if (!this.textures.exists(ts.name)) {
                this.load.image(ts.name, ts.value);
            }
        });
    }

    create() {
        this.canSaveOrLoad = false;

        this.loadAnimationsLeanTux();
        this.addLeanPlayer();

        this.createDarkOverlay();
        if (this.sector != null) {
            this.staticObjects = [];
            this.textsToUpdate = [];

            this.creatureObjects = [];

            if (this.creatures == null) {
                this.creatures = [];
            }

            if (this.collisionObjects === undefined) {
                this.collisionObjects = [];
            }

            if (this.climbableTiles === undefined) {
                this.climbableTiles = [];
            }
            
            this.createBackground();
            this.makeAnimations();

            this.parseAntarcticWater();
            
            this.addSounds();
            this.createMap();

            this.progressBar.setValue(0.45);

            // Create collision groups (Phaser)
            this.addPlayer();

            this.createCoinGroup();

            this.tilemapParser = new TilemapParser({ sectorScene: this, sector: this.sector, sectorData: this.sector.sectorData });
            this.tilemapParser.parse();

            this.progressBar.setValue(0.65);

            this.createEnemySpritesGroup();

            this.parseInvisibleWallBlocks();
            this.createFallingPlatforms();

            this.progressBar.setValue(0.75);

            this.addHealthBar();
            this.addLivesDisplay();
            this.addCoinsDisplay();
            this.initCamera();

            this.progressBar.setValue(0.87);

            this.initCursor();
            
            this.createPowerupGroup();

            this.groundLayer.setDepth(3);

            this.physics.world.enable(this.player);

            this.createDynamicForeGrounds();
            this.parseLava();

            this.initEffects();

            this.cameraDebugButtons = null;

            if (this.isDebug()) {
                this.cameraDebugButtons = new CameraButtons({ scene: this });
            }

            this.tilesets = Tile.getTileDataAndAttributes(this);
        }

        this.events.emit('loadProgress', { loaded: 100, total: 100 });

        this.createHasEnded = true;
        this.progressBar.setValue(1);
        this.pressAnyKey();
    }

    pressAnyKey() {

    }

    async createDarkOverlay() {
        if (this.deathOverlay !== undefined) {
            this.deathOverlay.destroy();
        }

        const width = (this.sys && this.sys.game && this.sys.game.config && this.sys.game.config.width) ? this.sys.game.config.width : (this.cameras && this.cameras.main ? this.cameras.main.width : 800);
        const height = (this.sys && this.sys.game && this.sys.game.config && this.sys.game.config.height) ? this.sys.game.config.height : (this.cameras && this.cameras.main ? this.cameras.main.height : 600);

        this.overlay = this.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(10000)
            .setAlpha(1);
    }

    presentByOverlay() {
        var self = this;
        this.fadeTweenComplete = false;
        try {
            var alpha = 1;
            var self = this;
            this.tweens.add({
                targets: self.overlay,
                alpha: 0,
                duration: 1500,
                ease: 'Linear',
                onComplete: () => {
                    self.fadeTweenComplete = true;
                }
            });
        } catch (e) {
            console.warn('Failed to start life again fade tween', e);
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

        //['tilesetKey1', 'tilesetKey2', ...].forEach(key => {
        //    if (this.textures.exists(key)) {
        //        this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
        //    }
        //});

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
            health: GameSession.session.sectorKey == this.sector.sectorData.key ? GameSession.session.health : 3,
            level: Level.getCurrentLevel()
        });

        if (GameSession.session.sectorKey == this.sector.sectorData.key) {
            if (GameSession.session.playerVelocity != null) {
                this.player.body.velocity.x = GameSession.session.playerVelocity.x;
                this.player.body.velocity.y = GameSession.session.playerVelocity.y;
            }
        }

        //this.player.body.setCollideWorldBounds(true);
        this.collisionObjects.push(this.player.getCollisionObject());
    }

    createEnemySpritesGroup() {
        this.enemyGroupCreated = false;
        this.parseEnemyLayer();
        this.enemyGroupCreated = true;
    }

    createHurtableTilesGroup() {
        this.hurtableTilesGroup = this.add.group();
        this.hurtableTiles = [];
    }

    createPowerupGroup() {
        if (this.powerUps === undefined) {
            this.powerUps = [];
        }
    }

    createCoinGroup() {
        this.coinSprites = [];
    }

    parseCoinLayer() {
        var coinTiles = this.sector.getCoinTiles();
        var coinSprites = [];
        var self = this;

        coinTiles.forEach(function (preloadedCoin, idx) {
            let coin = new Coin({
                id: "coin-" + idx,
                key: 'coin',
                scene: self,
                x: preloadedCoin.x,
                y: preloadedCoin.y,
                player: self.player,
                level: self.level
            });

            coinSprites.push(coin);
            self.collisionObjects.push(coin.getCollisionObject());
        });
    }

    addCoinSprite(i, j, coinType) {
        if (coinType === undefined) {
            coinType = "coin";
        }

        let coin = new Coin({
            id: this.getCoinId(),
            key: 'coin',
            scene: this,
            x: i * 32,
            y: j * 32,
            player: this.player,
            level: this.level,
            coinType: coinType
        });

        this.coinSprites.push(coin);
        this.collisionObjects.push(coin.getCollisionObject());
    }

    addCollectedCoin(coinValue) {
        this.sectorCoinsCollected += coinValue;
        Level.getCurrentLevel().addCollectedCoin();
        this.updateTotalCoinsCollectedUI();
    }

    updateTotalCoinsCollectedUI() {
        this.setCollectedCoins(this.sectorCoinsCollected);
    }

    addSnowBallEnemyFromTile(i, j) {
        var snowBall = new SnowBall({
            id: this.getEnemyId(),
            scene: this,
            key: "snowball",
            direction: "left",
            x: i * 32,
            y: j * 32,
            realY: 20,
            player: this.player,
            sector: this.sector
        });

        this.addCreature(snowBall);
    }

    addSpikyFromTile(i, j, sleeping) {
        let spiky = new Spiky({
            id: this.getEnemyId(),
            scene: this,
            key: "spiky",
            x: i * 32,
            y: j * 32,
            sleeping: false,
            player: this.player,
            sector: this.sector
        });

        this.addCreature(spiky);
    }

    addFlyingSnowBallEnemyFromTile(i, j) {
        let flyingSnowBall = new FlyingSnowBall({
            id: this.getEnemyId(),
            scene: this,
            key: "flying-snowball",
            x: i * 32,
            y: j * 32,
            realY: j * 32,
            player: this.player,
            sector: this.sector
        });

        this.addCreature(flyingSnowBall);
    }

    getEnemyId() {
        if (this.enemyId === undefined) {
            this.enemyId = 0;
        } else {
            this.enemyId++;
        }

        return this.enemyId;
    }

    getPowerUpId() {
        if (this.powerupCounter === undefined) {
            this.powerupCounter = 0;
        } else {
            this.powerupCounter++;
        }

        return "powerup-" + this.powerupCounter;
    }

    pushPreCreaturesList(enemy) {
        if (this.preCreatures === undefined) {
            this.preCreatures = [];
        }

        this.preCreatures.push(enemy);
    }

    getMovableObjectId() {
        if (this.movableObjectId === undefined) {
            this.movableObjectId = 0;
        } else {
            this.movableObjectId++;
        }

        return this.movableObjectId;
    }

    getCoinId() {
        if (this.coinId === undefined) {
            this.coinId = 0;
        } else {
            this.coinId++;
        }

        return this.coinId;
    }

    parseEnemyLayer() {
        //var enemies = this.sector.getEnemyObjects();
        var creatureObjects = [];
        var self = this;

        //enemies.forEach((enemy) => self.creatures.push(enemy));



        if (this.sector.sectorData.key == GameSession.session.sectorKey) {
            if (GameSession.session.enemiesPositions != null && GameSession.session.enemiesPositions.length > 0) {
                this.creatures = this.creatures.filter((creature) =>
                    GameSession.session.enemiesPositions.findIndex((ep) => ep.id == creature.id) > -1);
            }
        }

        if (this.preCreatures !== undefined) {
            for (var i = 0; i < this.preCreatures.length; i++) {
                var preCreature = this.preCreatures[i];

                this.addCreature(preCreature);
            }
        }

        for (var i = 0; i < this.creatures.length; i++) {
            var creature = this.creatures[i];
            var creatureObject;
            var enemyId = this.getEnemyId();

            switch (creature.name) {
                case "snowball":
                    creatureObject = new SnowBall({
                        id: enemyId,
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

                case "flying-snowball":
                    creatureObject = new FlyingSnowBall({
                        id: enemyId,
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
                        id: enemyId,
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
                        id: enemyId,
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
                        id: enemyId,
                        scene: this,
                        key: "plasma-gun",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        player: this.player,
                        sector: this.sector,
                    });

                    break;
                    
                case "lava-fish-jumping":
                    creatureObject = new LavaFishJumping({
                        id: enemyId,
                        scene: this,    
                        key: "lava-fish-jumping",
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

                case "hellspiky":
                    creatureObject = new HellSpiky({
                        iid: enemyId,
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
                        id: enemyId,
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

            this.addCreature(creatureObject);
        }

        if (this.sector.sectorData.key == GameSession.session.sectorKey) {
            if (GameSession.session.enemiesPositions != null && GameSession.session.enemiesPositions.length > 0) {
                this.creatureObjects.forEach((creature) =>
                    creature.initWithGameSession(GameSession.session.enemiesPositions.find((ep) => ep.id == creature.id)));
            }
        }


    }

    addCreature(creatureObject) {
        if (creatureObject != null) {
            this.creatureObjects.push(creatureObject);
            this.collisionObjects.push(creatureObject.getCollisionObject());
        }
    }

    parseHurtableTiles() {
        var sectorHurtableTiles = this.sector.getHurtableTiles();

        this.hurtableTiles = [];

        for (var i = 0; i < sectorHurtableTiles.length; i++) {
            let hurtableTile = sectorHurtableTiles[i];
            var hurtableTileSprite = {};

            if (hurtableTile.type.startsWith("spk-")) {
                hurtableTileSprite = new Spike({ scene: this, x: hurtableTile.x, y: hurtableTile.y, type: hurtableTile.type, player: this.player });
            }

            this.hurtableTiles.push(hurtableTileSprite);
        }
    }

    createHurtableTile(i, j, type) {
        var hurtableTileSprite = {};

        if (type.startsWith("spk-")) {
            hurtableTileSprite = new Spike({ scene: this, x: i * 32, y: j * 32, type: type, player: this.player });
        }

        this.hurtableTiles.push(hurtableTileSprite);
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
           } else if (collisionTile.type == "ind-ladder") {
               alert("ladder");
               tile = self.add.sprite(collisionTile.x, collisionTile.y, "ind-ladder");
           } else if (collisionTile.type.startsWith(SpriteKeyConstants.INDUSTRIAL)) {
               tile = self.add.sprite(collisionTile.x, collisionTile.y, "industrial", collisionTile.type.replace(SpriteKeyConstants.INDUSTRIAL, ""));
           } else {
               return;
           }

           self.physics.world.enableBody(tile, 0);
           tile.body.setAllowGravity(false);
           tile.body.setImmovable(true);
           tile.setOrigin(0, 0);

           if (collisionTile.climbable !== undefined && collisionTile.climbable === true) {
               tile.body.setCollideWorldBounds(false);
               self.climbableTiles.push(tile);
           } else {
               self.collisionTiles.push(tile);
           }
        });
    }

    addSprite(i, j, type, index) {
        let sprite;

        if (index !== undefined) {
            sprite = this.add.sprite(i * 32, j * 32, type, index);
        } else {
            sprite = this.add.sprite(i * 32, j * 32, type);
        }

        return sprite;
    }

    //createCollisionTile(i, j, collisionTileType) {
    //    var sectorCollisionTiles = this.sector.getCollisionTiles();
    //    var self = this;
    //    var x = i * 32;
    //    var y = j * 32;
    //    var tile = {};

    //    if (collisionTileType.startsWith("icebridge-")) {
    //        let tileIndex = 2;

    //        if (collisionTileType == "icebridge-start") {
    //            tileIndex = 0;
    //        } else if (collisionTileType == "icebridge-mid") {
    //            tileIndex = 1;
    //        }

    //        tile = self.add.sprite(x, y, "icebridge", tileIndex);
    //    } else if (collisionTileType == "single-wood") {
    //        tile = self.add.sprite(x, y, "wood-single");
    //    } else if (collisionTileType == "wood-start") {
    //        tile = self.add.sprite(x, y, "wood", 0);
    //    } else if (collisionTileType == "wood-mid") {
    //        tile = self.add.sprite(x, y, "wood", 1);
    //    } else if (collisionTileType == "wood-end") {
    //        tile = self.add.sprite(x, y, "wood", 4);
    //    } else if (collisionTileType == "ind-ladder") {
    //        tile = self.add.sprite(x, y, "ind-ladder");
    //    } else if (collisionTileType.startsWith(SpriteKeyConstants.INDUSTRIAL)) {
    //        tile = self.add.sprite(x, y, "industrial", collisionTileType.replace(SpriteKeyConstants.INDUSTRIAL, ""));
    //    } else {
    //        return;
    //    }

    //    self.physics.world.enableBody(tile, 0);
    //    tile.body.setAllowGravity(false);
    //    tile.body.setImmovable(true);
    //    tile.setOrigin(0, 0);

    //    if (collisionTile.climbable !== undefined && collisionTile.climbable === true) {
    //        tile.body.setCollideWorldBounds(false);
    //        self.climbableTilesGroup.add(tile);
    //    } else {
    //        self.collisionTilesGroup.add(tile);
    //    }
    //}

    addCollisionTile(collisionTileSprite, originalKey) {
        // let sectorData = Sector.getCurrentSector().sectorData;
        // let climbable = originalKey && sectorData.climbableTiles && sectorData.climbableTiles.includes(originalKey);

        // this.physics.world.enableBody(collisionTileSprite, 0);
        // collisionTileSprite.body.setAllowGravity(false);
        // collisionTileSprite.body.setImmovable(true);
        // collisionTileSprite.setOrigin(0, 0);

        // collisionTileSprite.climbable = climbable;

        // if (collisionTileSprite.climbable !== undefined && collisionTileSprite.climbable === true) {
        //     collisionTileSprite.body.setCollideWorldBounds(false);
        //     this.climbableTilesGroup.add(collisionTileSprite);
        // } else {
        //     this.collisionTilesGroup.add(collisionTileSprite);
        // }
    }

    createMovablePlatform(i, j, movablePlatformType) {
        if (this.movablePlatformsSprites === undefined) {
            this.movablePlatformsSprites = [];
        }

        var platform = new Platform({
            id: this.getMovableObjectId(),
            scene: this,
            key: 'platforms',
            x: i * 32,
            y: j * 32,
            player: this.player,
            sector: this.sector,
            level: Level.getCurrentLevel(),
            type: movablePlatformType,
        });

        this.movablePlatformsGroup.add(platform);
        this.movablePlatformsSprites.push(platform);
        this.staticObjects.push(platform);
    }

    createBackground() {
        var scale = this.sector.getBackgroundImageScale();
        var backgroundImage = this.add.image(0, 0, this.makeBackgroundImageKey());

        scale = scale !== undefined ? scale : 1;

        backgroundImage.setOrigin(0, 0);
        backgroundImage.scrollFactorX = 0;
        backgroundImage.scrollFactorY = 0;
        backgroundImage.setScale(scale);
    }

    createBackgroundObject(i, j, offsetX, offsetY, objectType) {
        let bg = this.add.sprite(i * 32 + offsetX, j * 32 + offsetY, objectType);
    }

    addHome(i, j) {
        var foreground = this.add.sprite(i * 32 + 100, j * 32 - 65, 'igloo_fg');
        var background = this.add.sprite(i * 32 + 100, j * 32 - 65, 'igloo_bg');

        foreground.flipX = true;
        background.flipX = true;

        background.setDepth(100);
        foreground.setDepth(1000);
    }

    parseLava() {
        //var lavaTiles = this.sector.getLava();

        //if (this.lavaSprites == null) {
        //    this.lavaSprites = [];
        //}

        //for (var i = 0; i < lavaTiles.length; i++) {
        //    var preloadedLava = lavaTiles.lava[i];
        //    let lava = {};
            
        //    if (preloadedLava.type == 'plain') {
        //        lava = this.add.sprite(preloadedLava.x, preloadedLava.y, 'lava');
        //        lava.setOrigin(0, 0);
        //        lava.setDepth(120);
        //        lava.alpha = this.LAVA_ALPHA;
        //    } else /*if (preloadedAntarcticWater.type == 'top')*/ {
        //        lava = new Lava({
        //            id: i,
        //            key: 'lava-' + i,
        //            player: this.player,
        //            scene: this,
        //            x: preloadedLava.x,
        //            y: preloadedLava.y,
        //            level: Level.currentLevel,
        //            alpha: this.LAVA_ALPHA
        //        });

        //        this.lavaSprites.push(lava);
        //    }
        //}
    }

    initEffects() {
        var events = this.sector.getEvents();

        if (events !== undefined) {
            for (var i = 0; i < events.length; i++) {
                var event = events[i];

                if (event.type == "stomp") {
                    var trembleIntensity = 0;

                    switch (event.intensity) {
                        case "low":
                            trembleIntensity = 5;
                            break;
                        case "medium":
                            trembleIntensity = 15;
                            break;
                        case "high":
                            trembleIntensity = 25;
                            break;
                        default:
                            break;
                    }

                    var stompEffect = new StompEffect({
                        scene: this,
                        player: this.player,
                        intensity: trembleIntensity,
                        targets: event.targets,
                        waitBetween: event.waitBetween
                    });
                }
            }
        }
    }

    parseAntarcticWater() {
        //for (var i = 0; i < this.sector.additionalTiles.water.length; i++) {
        //    var preloadedAntarcticWater = this.additionalTiles.water[i];

        //    let water = {};

        //    if (preloadedAntarcticWater.type == 'plain') {
        //        water = this.add.sprite(preloadedAntarcticWater.x, preloadedAntarcticWater.y, 'antarctic-water');
        //        water.setOrigin(0, 0);
        //    } else /*if (preloadedAntarcticWater.type == 'top')*/ {
        //        water = new Water({
        //            id: i,
        //            key: 'water-' + i,
        //            scene: this.scene,
        //            x: preloadedAntarcticWater.x,
        //            y: preloadedAntarcticWater.y,
        //            player: this.player,
        //            level: this
        //        });
        //    }
        //}
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

    loadBackgroundImage(backgroundImage,) {
        var background = this.preloadImage(this.makeBackgroundImageKey(), backgroundImage);
    }

    makeBackgroundImageKey() {
        return Level.getCurrentLevel().levelData.key + '-' + Sector.getCurrentSector().sectorData.key + '-background';
    }

    loadCoinTiles() {
        this.preloadImage('coin-2', './assets/images/objects/coins.png');
    }

    preloadImage(name, value) {
        return this.load.image(name, value);
    }

    initCamera() {
        this.cameras.main.setBounds(0, 0, this.sector.sectorData.tilemaps[0].data[0].length * 32, (this.sector.sectorData.tilemaps[0].data.length - 3) * 32);
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.roundPixels = true;
    }

    loadImages() {
        var keys =
            ["arrow", "invisible-wall", "UI", "debug-camera", "tux", "backgrounds", "coin", "hell-coin", "powerup",
                "sparkle", "smoke",

                "coin", "blocks", "industrial", "snow", "lava", "home-exit", "acid-rain", "spike",

                "snowball", "bouncing-snowball", "flying-snowball", "plasma-gun", "platforms",
                "mr-iceblock", "mr-bomb", "hell-crusher", "krosh", "fish", "ghoul", "jumpy", "spiky", "creature-thinking",

                "level-misc"];

        this.loadImagesForKeys(keys);
    }

    loadNecessaryAtlas() {
        var keys = ["ice-spikes"];

        this.loadAtlasForKeys(keys);
    }

    loadSounds() {
        var keys = ["tux", "common", "enemy"];

        this.loadSoundsForKeys(keys);
    }

    loadSoundsForKeys(keys) {
        var self = this;

        keys.forEach(key => self.audioLoader.loadAudioFromData(key));
    }

    addSounds() {
        var keys = ["tux", "common", "enemy"];

        this.addSoundsForKeys(keys);
    }

    addSoundsForKeys(keys) {
        var self = this;

        keys.forEach(key => self.audioLoader.addSoundsFromData(key));
    }

    loadAtlasFromData(caption) {
        this.atlasLoader.loadAtlasFromData(caption);
    }

    loadImage(caption, path) {
        this.imageLoader.loadImage(caption, path, 'png', scene);
    }

    loadMultipleImages(caption, path, start, end) {
        this.imageLoader.loadMultipleImages(caption, path, 'png', start, end, scene);
    }

    loadSpriteSheet(caption, path, frameWidth, frameHeight, n) {
        this.imageLoader.loadSpriteSheet(caption, path, frameWidth, frameHeight, n, scene);
    }

    animationIsLoaded(key) {
        return this.anims.anims.entries != null && this.anims.anims.entries.length > 0 && this.anims.exists(key) != null;
    }

    loadAtlasForKeys(atlasKeys) {
        var self = this;

        atlasKeys.forEach(atlasKey => self.loadAtlasFromData(atlasKey));
    }

    loadImagesForKeys(imageKeys) {
        var imageLoader = new ImageLoader({ scene: this });
        var self = this;

        imageKeys.forEach(imageKey => imageLoader.loadImagesFromData(imageKey, self));
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
            "fish", "lava-fish", "antarctic-water", "star-moving", "plus-flickering", "coin", "hell-coin"
        ];

        this.makeAnimationsForKeys(animationKeys);
    }

        isFreeOfTiles(rect, ignoreUnisolid, tiletype) {
            return this.collisionSystem.isFreeOfTiles(rect, ignoreUnisolid, tiletype);
        }

    static loadedAnimations = [];

    makeAnimationsForKeys(animationKeys) {
        var animationLoader = this.animationLoader;
        var self = this;

        animationKeys.forEach(animationKey => {
            if (SectorScene.loadedAnimations.indexOf(animationKey) === -1) {
                animationLoader.loadAnimationsFromData(animationKey, this);
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
                foreground.width = self.sector.sectorData.tilemaps[0].data[0].length;
            }

            foreground.endX = foreground.startX + foreground.width;

            if (foreground.tile == "la") {
                for (var x = foreground.startX; x < foreground.endX; x++) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        if (self.sector.getTileDataValue(x, y) != -1) {
                            self.createDynamicForeGroundStillTile(level, x, y, 'lava', level.LAVA_ALPHA, 120, 33);
                        }
                    }
                }
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

    createDynamicForeGroundStillTile(level, x, y, key, alpha, depth, otherTileSize) {
        var tileSize = otherTileSize !== undefined ? otherTileSize : 32;

        var foregroundImage = this.add.sprite(x * 32, y * 32, key);

        if (key == "lava") {
            foregroundImage.setSize(33, 33);
        }

        foregroundImage.setOrigin(0, 0);
        foregroundImage.alpha = Level.currentLevel.LAVA_ALPHA;
        foregroundImage.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        if (depth != null) {
            foregroundImage.setDepth(120);
        }
    }


    fillTilesForeground() {
        var sectorStaticForegrounds = this.sector.getFillTilesForegrounds();

        if (sectorStaticForegrounds == null) { return; }

        var i = 0;
        var level = this;
        var self = this;

        sectorStaticForegrounds.forEach(function (foreground, ids) {
            var foregroundImage = {};
            if (typeof foreground.tile == 'number') {
                foreground.endX = foreground.startX + foreground.width;

                for (var x = foreground.startX; x < foreground.endX; x++) {
                    for (var y = foreground.y; y < foreground.y + foreground.height; y++) {
                        if (self.sector.getTileDataValue(x, y) == 0) {
                            self.sector.setTileDataValue(x, y, foreground.tile);
                        } else if (self.sector.getTileDataValue(x, y) == -1) {
                            self.sector.setTileDataValue(x, y, 0);
                        }
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

            self.collisionObjects.push()
            self.fallingPlatformSprites.push(platformImage.getCollisionObject());
            self.staticObjects.push(platformImage);
        });
    }

    pauseWithBlurredImage(callBack) {
        this.time.delayedCall(0, () => {
            this.game.renderer.snapshot((image) => {
                const blurRadius = 8;
                const w = image.width;
                const h = image.height;

                // Step 1: Create a canvas with extended borders filled with edge pixels
                const canvas = document.createElement('canvas');
                canvas.width = w + blurRadius * 2;
                canvas.height = h + blurRadius * 2;
                const ctx = canvas.getContext('2d');

                // Fill top and bottom borders
                for (let y = 0; y < blurRadius; y++) {
                    ctx.drawImage(image, 0, 0, w, 1, blurRadius, y, w, 1); // top
                    ctx.drawImage(image, 0, h - 1, w, 1, blurRadius, h + blurRadius + y, w, 1); // bottom
                }
                // Fill left and right borders
                for (let x = 0; x < blurRadius; x++) {
                    ctx.drawImage(image, 0, 0, 1, h, x, blurRadius, 1, h); // left
                    ctx.drawImage(image, w - 1, 0, 1, h, w + blurRadius + x, blurRadius, 1, h); // right
                }
                // Fill corners
                ctx.drawImage(image, 0, 0, 1, 1, 0, 0, blurRadius, blurRadius); // top-left
                ctx.drawImage(image, w - 1, 0, 1, 1, w + blurRadius, 0, blurRadius, blurRadius); // top-right
                ctx.drawImage(image, 0, h - 1, 1, 1, 0, h + blurRadius, blurRadius, blurRadius); // bottom-left
                ctx.drawImage(image, w - 1, h - 1, 1, 1, w + blurRadius, h + blurRadius, blurRadius, blurRadius); // bottom-right

                // Draw the center image
                ctx.drawImage(image, blurRadius, blurRadius);

                // Step 2: Blur the entire extended canvas
                const blurredCanvas = document.createElement('canvas');
                blurredCanvas.width = canvas.width;
                blurredCanvas.height = canvas.height;
                const blurredCtx = blurredCanvas.getContext('2d');
                blurredCtx.filter = `blur(${blurRadius}px)`;
                blurredCtx.drawImage(canvas, 0, 0);

                // Step 3: Crop the blurred center to the original size
                const cropped = document.createElement('canvas');
                cropped.width = w;
                cropped.height = h;
                const croppedCtx = cropped.getContext('2d');
                croppedCtx.drawImage(
                    blurredCanvas,
                    blurRadius, blurRadius, w, h,
                    0, 0, w, h
                );

                const blurredBase64 = cropped.toDataURL('image/png');

                if (this.textures.exists('blurred-bg')) {
                    this.textures.remove('blurred-bg');
                }

                this.textures.once('addtexture', (key) => {
                    if (key === 'blurred-bg') {
                        this.pausedBlurredImage = this.add.image(
                            this.sys.game.config.width / 2,
                            this.sys.game.config.height / 2,
                            'blurred-bg'
                        ).setOrigin(0.5).setDepth(10001).setScrollFactor(0);

                        callBack.call(this);
                    }
                });
                this.textures.addBase64('blurred-bg', blurredBase64);
                this.backgroundReady = true;
            });
        });
    }

    resumeGame() {
        if (this.pausedBlurredImage != null) {
            this.pausedBlurredImage.destroy();
            this.pausedBlurredImage = null;
        }
    }

    updateReadyToPlay(time, delta) {

    }

    update(time, delta) {

        if (!this.levelIntroHasEnded) {
            if (this.leanPlayer) {
                this.leanPlayer.update(time, delta);
            } else {
            }
        }
        
        if(!this.readyToPlay) {
            this.updateReadyToPlay(time, delta);
            return;
        }

        if (this.destroyingScene) { return; }   
        if (this.sector == null) { return; }

        this.canSaveOrLoad = true;

        if (this.quickSaveGameText != null) { this.quickSaveGameText.update(time, delta); }

        this.getKeyController().update();
        this.handleOptionsKeys();

        if (this.interruptUpdate) { return; }

        this.player.update(time, delta);
        this.player.draw(time, delta);
        this.healthBar.update(time, delta);
        
        this.validateCurrentSectorEnds();
        this.cursor.update(time, delta);
        this.forceUpdateSprites(this.creatureObjects, time, delta);
        this.forceUpdateSprites(this.coinSprites, time, delta);
        this.forceUpdateSprites(this.lavaSprites, time, delta);
        this.forceUpdateSprites(this.particleSprites, time, delta);
        this.forceUpdateSprites(this.blockSprites, time, delta);
        this.forceUpdateSprites(this.fallingPlatformSprites, time, delta);
        this.forceUpdateSprites(this.hurtableTiles, time, delta);
        this.forceUpdateSprites(this.movablePlatformsSprites, time, delta);

        this.collisionSystem.update(time, delta);

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

        this.quickSaveGameText = fontLoader.displayTextFromAtlas({ scene: this, fontName: "SuperTuxBigColorFul", x: CANVAS_WIDTH - 30 - (saved.length * 18), y: 70, text: saved, fade: true, fadeFactor: 1 });
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
        this.pauseWithBlurredImage(this.pauseGame);
    }

    pauseGame() {
        var sceneKey = SectorSwapper.getCurrentSceneKey();

        game.scene.pause(sceneKey);
        game.scene.start("PauseScene");
    }

    launchMenu() {
        Sector.currentSectorScene = this;
        this.pauseWithBlurredImage(this.pauseAndLaunchMenu);
    }

    pauseAndLaunchMenu() {
        var sceneKey = SectorSwapper.getCurrentSceneKey();

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
        if (this.powerUps === undefined) {
            return;
        }
        this.powerUps.forEach(
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

        this.addPowerUp(egg);
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

        this.addPowerUp(plus);
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

        this.addPowerUp(bouncyCoin);
    }

    addPowerUp(powerup) {
        if (this.powerUps === undefined) {
            this.powerUps = [];
        }

        this.powerUps.push(powerup);
        this.collisionObjects.push(powerup.getCollisionObject());
    }   

    removeEnemy(enemy) {
        var collisionObject = this.collisionObjects.find(obj => obj.getId() == enemy.id);

        if (collisionObject !== undefined || (collisionObject.parent !== undefined && collisionObject.parent.isScheduledForRemoval)) {
            collisionObject.isScheduledForRemoval = true;

            this.collisionObjects = this.collisionObjects.filter(collisionObject => collisionObject.getId() != enemy.id);
        }

        if (enemy !== undefined || enemy.isScheduledForRemoval) {
            enemy.isScheduledForRemoval = true;

            this.creatureObjects = this.creatureObjects.filter(creature => creature.id != enemy.id);
        }
    }

    removeCoin(coin) {
        var collisionObject = this.collisionObjects.find(obj => obj.id == coin.id);

        if (collisionObject !== undefined) {
            collisionObject.isScheduledForRemoval = true;

            this.collisionObjects = this.collisionObjects.filter(collisionObject => collisionObject.getId() != coin.id);
        }

        coin.isScheduledForRemoval = true;

        this.coinSprites = this.coinSprites.filter(c => c.id != coin.id);
    }

    removePowerUp(powerup) {
        var collisionObject = this.collisionObjects.find(obj => obj.id == powerup.id);

        if (collisionObject !== undefined) {
            collisionObject.isScheduledForRemoval = true;

            this.collisionObjects = this.collisionObjects.filter(collisionObject => collisionObject.getId() != powerup.id);
        }

        powerup.isScheduledForRemoval = true;

    this.powerUps = this.powerUps.filter(p => p.id != powerup.id);
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