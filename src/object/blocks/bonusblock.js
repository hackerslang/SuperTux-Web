import { BounceableBlock } from "./bounceableblock.js";
import { Brick } from "./brick.js";
import { FlowerType } from "../powerup/flower.js";

export const PowerUpContent = {
    COIN: 0,
    FIREGROW: 1,
    EGG: 2,
    AIRGROW: 3,
    EARTHGROW: 4,
    RETROGROW: 5,
    STAR: 6,
    RETROSTAR: 7,
    TUXDOLL: 8,
    CUSTOM: 9,
    SCRIPT: 10,
    LIGHT: 11,
    LIGHT_ON: 12,
    TRAMPOLINE: 13,
    PORTABLE_TRAMPOLINE: 14,
    RAIN: 15,
    EXPLODE: 16,
    ROCK: 17,
    POTION: 18
};

export const BlockType = {
    BLUE: 0,
    ORANGE: 1,
    PURPLE: 2,
    RETRO: 3,
    HELL: 4
};

export class BonusBlock extends BounceableBlock {
    constructor(config) {
        super(config);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setVelocity(0, 0).setBounce(0, 0).setCollideWorldBounds(false);

        this.body.setAllowGravity(false);
        this.player = config.player;
        this.level = config.level;
        this.scene = config.scene;
        this.id = config.id;
        this.startY = config.y;
        this.isEmpty = false;
        this.done = false;
        this.setOrigin(0, 0);
        this.body.setBounce(0);
        this.body.setImmovable(true);
        this.gotHitByPlayer = false;
        this.releasedPowerUp = false;
        this.hitSide = "none";
        this.contents = config.contents;
        this.color = config.color || "blue";

        this.hitCounter = 1;

        if (config.hitCounter != null) {
            this.hitCounter = config.hitCounter;
        }

        this.DIRECTION_LEFT = -1;
        this.DIRECTION_RIGHT = 1;

        this.setDepth(9000);
        this.init();

        this.body.setSize(32, 32);
        this.body.setOffset(0, 0);
    }

    init() {
        switch (this.color) {
            case "blue":
                this.setTexture("blue-bonus-block");
                break;
            case "purple":
                this.setTexture("purple-bonus-block");
                break;
            case "orange":
                this.setTexture("orange-bonus-block");
                break;
            default:
                this.setTexture("retro-info-block");
                break;
        }
    }

    addObject(object) {
        if (this.objects !== undefined && this.objects.length > 0) {
            console.log("Only one custom object is allowed inside bonus blocks.");
            return;
        }

        this.setObject(object);
    }

    setObject(object) {
        this.object = object;

        this.objects = [];
        this.objects.push(object);
    }

    getDefaultSpriteName() {
        switch (this.color) {
            case "blue":
                return "blue-bonus-block";
            case "purple":
                return "purple-bonus-block";
            case "orange":
                return "orange-bonus-block";
            default:
                return "retro-info-block";
        }
    }

    onTypeChange(oldType) {
        super.onTypeChange(oldType);

        this.hitCounter = this.getDefaultHitCounter();
        this.coinSprite = this.getDefaultCoinSprite();
    }

    collides(other, hit) {
        if (other?.parent instanceof BonusBlock || other?.parent instanceof Brick) {
            return false;
        }
        return true;
    }

    collision(other, hit) {
        if (hit.hasDirection()) {
            let player = other.parent.isPlayer ? other.parent : null;
            if (player) {
                if (player.doesButtjump ||
                    (player.isSwimBoosting && new Rect(player.bbox).getBottom() < new Rect(this.getBbox()).top + SHIFT_DELTA)) {
                    this.tryDrop(player);
                }
            }

            let enemy = other.parent.isEnemy ? other.parent : null;
            if (enemy) {
                // Hit contains no information for collisions with blocks.
                // Enemy's bottom has to be below the top of the block
                // SHIFT_DELTA is required to slide over one tile gaps.
                if (enemy.canBreak() && (new Rect(enemy.getBbox()).getBottom() > new Rect(this.getBbox()).top + SHIFT_DELTA)) {
                    this.tryOpen(player);
                }
            }

            let crusher = other.parent.isEnemy && other.parent.isCrusher ? other.parent : null;
            if (crusher) {
                this.tryOpen(player);
            }

            let portable = other.parent.isPortable ? other.parent : null;
            if (portable && !enemy) {
                if (new Rect(other.getBbox()).top > new Rect(this.getBbox()).getBottom() - SHIFT_DELTA) {
                    this.tryOpen(player);
                }
            }
        }

        return super.collision(other, hit);
    }

    hit(player) {
        this.tryOpen(player);
    }

    //getDefaultCoinSprite()
    //{
    //    switch (m_type) {
    //        case HELL:
    //            return new Coin()     
    //        case RETRO:
    //            return "images/objects/coin/retro_coin.sprite";
    //        default:
    //            return "images/objects/coin/coin.sprite";
    //    }
    //}

    update(time, delta) {       
        super.update(time, delta);
    }

    hit(player) {
        this.tryOpen(player);
    }

    getDirectionOnHit() {
        if (this.player.body.x > this.body.x) {
            return -1;
        }

        return 1;
    }

    tryOpen(player) {
        if (this.isEmpty) {
            return;
        }

        if (player === undefined)
            return;

        if (super.playerHasHitBeforeTimer > 0) {
            return;
        }
        super.resetPlayerHitBeforeTimer();

        this.scene.sound.play("brick");

        var direction = (player.collisionObject.bbox.getMiddle().x > this.collisionObject.bbox.getMiddle().x) ? this.DIRECTION_LEFT: this.DIRECTION_RIGHT;

        var playUpgradeSound = false;

        switch (this.contents) {
            case PowerUpContent.COIN:
                this.addCoinPowerUp();
                break;

            case PowerUpContent.FIREGROW:
                {
                    this.addFlowerPowerUp();
                    break;
                }

            case PowerUpContent.EGG:
                {
                    this.addEggPowerUp();
                    break;
                }

            case PowerUpContent.AIRGROW:
                {
                    this.raiseGrowupBonus(player, BONUS_AIR, direction);
                    break;
                }

            case PowerUpContent.EARTHGROW:
                {
                    this.raiseGrowupBonus(player, BONUS_EARTH, direction);
                    break;
                }

            case PowerUpContent.RETROGROW:
                {
                    this.raiseGrowupBonus(player, BONUS_FIRE, direction,
                        "images/powerups/retro/mints.png", "images/powerups/retro/coffee.png");
                    break;
                }

            case PowerUpContent.STAR:
                {
                    Sector.get().add(Star(get_pos() + Vector(0, -32), direction));
                    playUpgradeSound = true;
                    break;
                }

            case PowerUpContent.RETROSTAR:
                {
                    Sector.get().add(Star(get_pos() + Vector(0, -32), direction,
                        "images/powerups/retro/golden_herring.png"));
                    playUpgradeSound = true;
                    break;
                }

            case PowerUpContent.TUXDOLL:
                {
                    //Tux doll
                    playUpgradeSound = true;
                    break;
                }

            case PowerUpContent.CUSTOM:
                {
                    //custom
                    playUpgradeSound = true;
                    break;
                }

            case PowerUpContent.SCRIPT:
                { break; } // This prevents default contents from being assumed because scripts always run.

            case PowerUpContent.LIGHT:
            case PowerUpContent.LIGHT_ON:
                {
                    break;
                }
            case PowerUpContent.TRAMPOLINE:
                {
                   //trampoline
                    playUpgradeSound = true;
                    break;
                }
            case PowerUpContent.PORTABLE_TRAMPOLINE:
                {
                    //portable trampoline
                    playUpgradeSound = true;
                    break;
                }
            case PowerUpContent.ROCK:
                {
                    // to be implemented??
                    break;
                }
            case PowerUpContent.POTION:
                {
                    // to be implemented??
                    break;
                }
            case PowerUpContent.RAIN:
                {
                    // to be implemented??
                        playUpgradeSound = true;
                    break;
                }
            case PowerUpContent.EXPLODE:
                {
                    // to be implemented??
                    playUpgradeSound = true;
                    break;
                    }

            default:
                this.addCoinPowerUp();
                break;
        }

        if (playUpgradeSound)
            this.scene.sound.play("upgrade");

        // if (!this.script.empty()) { // Scripts always run if defined.
        //     // to be implemented??
        // }

        this.startBounce(player);
        if (this.hitCounter <= 0 || this.contents == PowerUpContent.LIGHT || this.contents == PowerUpContent.LIGHT_ON) { // Use 0 to allow infinite hits.
        } else if (this.hitCounter == 1) {
            this.setEmpty();
        } else {
            this.hitCounter--;
        }
    }

    addCoinPowerUp() {
        this.scene.addBouncyCoin(this.x, this.y);
        this.scene.sound.play("collect-coin");
        this.scene.coinsDisplay.addCollectedCoin();
        if (this.hitCounter != 0 && !this.parentDispenser)
            ;//Sector:: get().get_level().m_stats.increment_coins();
    }

    addEggPowerUp() {
        this.scene.addEgg(this.x, this.y - 32, this.getDirectionOnHit(), 0);
    }

    addFlowerPowerUp() {
        this.scene.addFlower(this.x, this.y, FlowerType.BONUS_FIRE, this);
    }

    setEmpty() {
        this.isEmpty = true;
        this.setTextureEmpty();
    }

    setTextureEmpty() {
        switch (this.color) {
            case "blue":
                this.setTexture("blue-bonus-block-empty");
                break;
            case "purple":
                this.setTexture("purple-bonus-block-empty");
                break;
            case "orange":
                this.setTexture("orange-bonus-block-empty");
                break;
            default:
                this.setTexture("retro-info-block-empty");
                break;
        }
    }
    
    releasePowerUp(direction) {
        if (!this.releasedPowerUp) {
            if (this.powerupType == 'star') {
                this.level.addStar(this.x, this.y - 32, direction);
            } else if (this.powerupType == 'egg') {
                this.level.addEgg(this.x, this.y - 32, direction);
            }

            this.releasedPowerUp = true;
        }
    }

    getDefaultCoinSprite() {
        switch (this.blockType) {
            case BlockType.RETRO:
                return "retroCoin";
            default:
                return "coin";
        }
    }

    getContentByData(tileData) {
        switch (tileData) {
            case 1: return PowerUpContent.COIN;
            case 2: return PowerUpContent.FIREGROW;
            case 3: return PowerUpContent.STAR;
            case 4: return PowerUpContent.TUXDOLL;
            case 5: return PowerUpContent.ICEGROW;
            case 6: return PowerUpContent.LIGHT;
            case 7: return PowerUpContent.TRAMPOLINE;
            case 8: return PowerUpContent.PORTABLE_TRAMPOLINE; // Trampoline.
            case 9: return PowerUpContent.ROCK; // Rock.
            case 10: return PowerUpContent.RAIN;
            case 11: return PowerUpContent.EXPLODE;
            case 12: return PowerUpContent.POTION; // Red potion.
            case 13: return PowerUpContent.AIRGROW;
            case 14: return PowerUpContent.EARTHGROW;
            case 15: return PowerUpContent.LIGHT_ON;
            case 16: return PowerUpContent.RETROGROW;
            case 17: return PowerUpContent.RETROSTAR;
            default:
                console.log("Invalid box contents");
                return PowerUpContent.COIN;
        }
    }

    getCoinsWorth() {
        return this.contents == BonusBlock.Content.COIN ? this.hitCounter :
            (this.contents == BonusBlock.Content.RAIN ||
                this.contents == BonusBlock.Content.EXPLODE) ? this.hitCounter * 10 : 0;
    }

    getDefaultHitCounter() {
        switch (this.blockType) {
            case BlockType.ORANGE:
                return 3;
            case BlockType.PURPLE:
                return 5;
            default:
                return 1;
        }
    }

    remove() {
        this.level.removeBlock(this);
    }
}