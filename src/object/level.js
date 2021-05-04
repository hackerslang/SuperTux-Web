

class Level {
    constructor(levelData, scene) {
        this.scene = scene;
        this.level = levelData.level;
        this.originalLevel = levelData.level;
        this.creatures = levelData.creatures;
    }

    parseObjects() {
        this.preloadedCoins = [];
        this.preloadedWoods = [];
        this.preloadedBlocks = [];
        this.preloadedIceBridge = [];
        this.preloadedAntarcticWaters = [];

        var blockStart = false;
        var iceBridgeStart = false;
        var waterStart = false;

        for (var j = 0; j < this.level.length; j++) {
            for (var i = 0; i < this.level[0].length; i++) {
                var currentTile = this.level[j][i];

                if (currentTile == 'end') {
                    this.level[j][i] = 0;

                    this.preloadedLevelEnd = {
                        x: i * 32,
                        y: j * 32
                    }
                } else if (currentTile == 'c') {
                    this.level[j][i] = 0;

                    let preloadedCoin = {
                        x: i * 32,
                        y: j * 32
                    }

                    this.preloadedCoins.push(preloadedCoin);
                }
                else if (currentTile == 'wa') {

                    if (!waterStart) {
                        let firstWater = {
                            type: 'plain',
                            x: (i - 1) * 32,
                            y: j * 32
                        }

                        waterStart = true;

                        this.preloadedAntarcticWaters.push(firstWater);
                    }

                    let preloadedAntarcticWater = {
                        type: 'plain',
                        x: i * 32,
                        y: j * 32
                    }

                    this.preloadedAntarcticWaters.push(preloadedAntarcticWater);

                    if (this.level[j][i + 1] != 'wa') {
                        let lastWater = {
                            type: 'plain',
                            x: (i + 1) * 32,
                            y: j * 32
                        }

                        waterStart = false;

                        this.preloadedAntarcticWaters.push(lastWater);
                    }
                }
                else if (currentTile == 'wa2') {
                    var waterI = i;

                    while (this.level[j][waterI] == 'wa2') {
                        waterI++;
                    }

                    for (var n = i - 1; n < waterI + 1; n += 4) {
                        let water = {
                            type: 'top',
                            x: n * 32,
                            y: j * 32
                        }

                        this.preloadedAntarcticWaters.push(water);
                    }

                    i = waterI - 1;
                }
                else if (currentTile == 'ibr') {
                    let preloadedIceBridge = {};
                    if (!iceBridgeStart) {

                        preloadedIceBridge = {
                            type: 'icebridge-start',
                            x: i * 32,
                            y: j * 32
                        }

                        iceBridgeStart = true;
                    } else if (this.level[j][i + 1] != 'ibr') {
                        preloadedIceBridge = {
                            type: 'icebridge-end',
                            x: i * 32,
                            y: j * 32
                        }

                        iceBridgeStart = false;
                    } else {
                        preloadedIceBridge = {
                            type: 'icebridge-mid',
                            x: i * 32,
                            y: j * 32
                        }
                    }

                    this.preloadedIceBridge.push(preloadedIceBridge);
                    this.level[j][i] = 0;
                }
                else if (this.level[j][i] == 'bb') {
                    let preloadedBlock = {
                        type: 'bonus-block',
                        x: i * 32,
                        y: j * 32,
                        powerupType: 'random'
                    }

                    this.preloadedBlocks.push(preloadedBlock);
                    this.level[j][i] = 0;
                } else if (this.level[j][i] == 'bb-s') {
                    let preloadedBlock = {
                        type: 'bonus-block',
                        x: i * 32,
                        y: j * 32,
                        powerupType: 'star'
                    }

                    this.preloadedBlocks.push(preloadedBlock);
                    this.level[j][i] = 0;
                } else if (this.level[j][i] == 'bb-e') {
                    let preloadedBlock = {
                        type: 'bonus-block',
                        x: i * 32,
                        y: j * 32,
                        powerupType: 'egg'
                    }

                    this.preloadedBlocks.push(preloadedBlock);
                    this.level[j][i] = 0;
                } else if (this.level[j][i] == 'w') {
                    let preloadedWood = {};
                    if (!blockStart) {
                        if (this.level[j][i + 1] != 'w') {
                            preloadedWood = {
                                type: 'single-wood',
                                x: i * 32,
                                y: j * 32
                            }
                        } else {
                            preloadedWood = {
                                type: 'wood-start',
                                x: i * 32,
                                y: j * 32
                            }

                            blockStart = true;
                        }
                    } else if (this.level[j][i + 1] != 'w') {
                        preloadedWood = {
                            type: 'wood-end',
                            x: i * 32,
                            y: j * 32
                        }

                        blockStart = false;
                    } else {
                        preloadedWood = {
                            type: 'wood-mid',
                            x: i * 32,
                            y: j * 32
                        }
                    }

                    this.preloadedWoods.push(preloadedWood);
                    this.level[j][i] = 0;
                }
            }
        }
    }

    parseCoinLayer() {
        var coinSprites = [];
        for (var i = 0; i < this.preloadedCoins.length; i++) {
            var preloadedCoin = this.preloadedCoins[i];

            var coin = new Coin({
                id: i,
                key: 'coin',
                scene: this.scene,
                x: preloadedCoin.x,
                y: preloadedCoin.y,
                player: this.player,
                level: this
            });

            this.coinGroup.add(coin);
            coinSprites.push(coin);
        }

        this.coinSprites = coinSprites;
    }

    parseWoodLayer() {
        for (var i = 0; i < this.preloadedWoods.length; i++) {
            var preloadedWood = this.preloadedWoods[i];

            let wood = {};

            if (preloadedWood.type == "single-wood") {
                wood = this.scene.add.sprite(preloadedWood.x, preloadedWood.y, "wood-single");
            } else if (preloadedWood.type == "wood-start") {
                wood = this.scene.add.sprite(preloadedWood.x, preloadedWood.y, "wood", 0);
            } else if (preloadedWood.type == "wood-mid") {
                wood = this.scene.add.sprite(preloadedWood.x, preloadedWood.y, "wood", 1);
            } else if (preloadedWood.type == "wood-end") {
                wood = this.scene.add.sprite(preloadedWood.x, preloadedWood.y, "wood", 4);
            }

            this.scene.physics.world.enableBody(wood, 0);
            wood.body.setAllowGravity(false);
            wood.body.setImmovable(true);

            this.woodGroup.add(wood);
        }
    }

    parseIceBridgeLayer() {
        for (var i = 0; i < this.preloadedIceBridge.length; i++) {
            var preloadedIceBridge = this.preloadedIceBridge[i];

            let bridge = {}
            let tile = 4;

            if (preloadedIceBridge.type == "icebridge-start") {
                tile = 0;
            } else if (preloadedIceBridge.type == "icebridge-mid") {
                tile = 1;
            } else {
                tile = 2;
            }

            bridge = this.scene.add.sprite(preloadedIceBridge.x, preloadedIceBridge.y, "icebridge", tile);

            this.scene.physics.world.enableBody(bridge, 0);
            bridge.body.setAllowGravity(false);
            bridge.body.setImmovable(true);
            bridge.setOrigin(0, 0);

            this.woodGroup.add(bridge);
        }
    }

    parseAntracticWater() {
        for (var i = 0; i < this.preloadedAntarcticWaters.length; i++) {
            var preloadedAntarcticWater = this.preloadedAntarcticWaters[i];

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
                })
            }
        }
    }

    parseBlockLayer() {
        var blockSprites = [];
        for (var i = 0; i < this.preloadedBlocks.length; i++) {
            var preloadedBlock = this.preloadedBlocks[i]; { };

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
                    powerupType: preloadedBlock.powerupType
                })
            }

            this.blockGroup.add(block);
            blockSprites.push(block);
        }

        this.blockSprites = blockSprites;
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

        this.parseAntracticWater();

        let groundLayer = map.createStaticLayer(0, snowTiles, 0, 0);
        this.groundLayer = groundLayer;

        this.player = new Tux({
            key: "tux",
            scene: this.scene,
            x: 0,
            y: 0,
            level: this
        });

        this.player.body.setCollideWorldBounds(true);

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

        this.parseLevelEndLayer();

        //this.scene.physics.add.collider(this.enemyGroup, this.groundLayer);
        this.scene.physics.add.collider(this.coinGroup, this.groundLayer);
        this.playerGroundCollider = this.scene.physics.add.collider(this.player, this.groundLayer);
        this.woodCollider = this.scene.physics.add.collider(this.player, this.woodGroup, this.woodHit);

        this.scene.physics.world.bounds.width = groundLayer.width;
        this.scene.physics.world.bounds.height = groundLayer.height;
        groundLayer.setCollisionByExclusion(0, true);

        this.scene.physics.world.enable(this.player);
        this.scene.physics.world.setBoundsCollision(true, true, true, true);
        this.scene.cameras.main.setBounds(0, 0, this.level[0].length * 32, 21 * 32);
        this.scene.cameras.main.startFollow(this.player, true);
    }

    woodHit(player) {
        var tileX = Math.floor(player.x / 32);
        var tileY = Math.floor(player.y / 32);

        for (var i = 0; i < player.level.blockSprites.length; i++) {
            var blockSprite = player.level.blockSprites[i];

            var blockTileX = Math.floor(blockSprite.x / 32);
            var blockTileY = Math.floor(blockSprite.y / 32);

            if ( blockTileX == tileX && blockTileY == tileY - 1) {
                blockSprite.blockHit(blockSprite, player);
            }
        }
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

    update(time, delta) {
        this.player.update(time, delta);
        this.player.draw(time, delta);

        for (var i = 0; i < this.creatureSprites.length; i++) {
            var creatureSprite = this.creatureSprites[i];

            if (creatureSprite != null) {
                this.creatureSprites[i].update(time, delta);
            }
        }

        for (var i = 0; i < this.coinSprites.length; i++) {
            var coinSprite = this.coinSprites[i];
            
            if (coinSprite != null) {
                coinSprite.update(time, delta);
            }
        }

        for (var i = 0; i < this.blockSprites.length; i++) {
            var blockSprite = this.blockSprites[i];

            if (blockSprite != null) {
                blockSprite.update(time, delta);
            }
        }

        Array.from(this.powerupGroup.children.entries).forEach(
            (powerup) => {
                powerup.update(time, delta);
            });
    }

    setPlayer(player) {

    }

    addStar(x, y) {
        let star = new StarPowerUp({
            scene: this.scene,
            key: "star",
            x: x,
            y: y,
            player: this.player,
            level: this
        });

        this.powerupGroup.add(star);
    }

    addEgg(x, y) {
        let egg = new EggPowerUp({
            scene: this.scene,
            key: "egg",
            x: x,
            y: y,
            player: this.player,
            level: this
        });

        this.powerupGroup.add(egg);
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
                        player: this.player,
                        level: this
                    });

                    break;

                case "iceblock":
                    creatureObject = new MrIceBlock({
                        id: i,
                        scene: this.scene,
                        key: "mriceblock",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        player: this.player,
                        level: this
                    });

                    break;

                case "krosh":
                    creatureObject = new Krosh({
                        id: i,
                        scene: this.scene,
                        key: "krosh",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        stopY: creature.position.stopY,
                        player: this.player,
                        level: this
                    });

                    break;

                case "fish":
                    creatureObject = new Fish({
                        id: i,
                        scene: this.scene,
                        key: "fish",
                        x: creature.position.x * 32,
                        y: creature.position.y * 32,
                        player: this.player,
                        level: this
                    });

                    break;
            }

            creatureSprites.push(creatureObject);
            this.enemyGroup.add(creatureObject);
        }

        this.creatureSprites = creatureSprites;
    }



    parseLevelEndLayer() {
        var iglooBg = this.scene.add.sprite(this.preloadedLevelEnd.x - 145, this.preloadedLevelEnd.y - 60, "igloo-bg");
        var iglooFg = this.scene.add.sprite(this.preloadedLevelEnd.x, this.preloadedLevelEnd.y - 60, "igloo-fg");

        iglooFg.setDepth(1000);
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
        //
    }
}

class Level2Data {
    constructor(config) {
        config.landscape = 'castle';
        config.level = [
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
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'w', 'w', 'w', 'w', 'bb-s', 'bb-e', 'w', 0, 0, 0, 'w', 'w', 'bb-s', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2],
            [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
            [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'la2', 'wl2', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0, 0, 0, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 'la', 'la', 'la', 'la', 'la', 'la', 'la', 'la', 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
        ];
    }
};

class Level1Data {
    constructor() {
        this.landscape = 'snow';
        this.level = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 'c', 'c', 'c', 'c', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'w', 'w', 'w', 'w', 'bb-s', 'bb-e', 'w', 0, 0, 0, 'w', 'w', 'bb-s', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'end', 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 'ibr', 'ibr', 'ibr', 'ibr', 'ibr', 'ibr', 'ibr', 'ibr', 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa2', 'wa2', 'wa2', 'wa2', 'wa2', 'wa2', 'wa2', 'wa2', 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
            [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6],
            [7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 0, 0, 0, 0, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 'wa', 7, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 9]
        ];

        this.creatures = [
            {
                name: "iceblock",
                direction: "left",
                position: {
                    x: 15,
                    y: 17
                }
            },

            {
                name: "snowball",
                direction: "left",
                position: {
                    x: 25,
                    y: 17
                }
            },

            {
                name: "krosh",
                position: {
                    x: 40,
                    y: 8,
                    stopY: 17
                }
            },

            {
                name: "fish",
                position: {
                    x: 53,
                    y: 25
                }
            }
        ];
    }
}