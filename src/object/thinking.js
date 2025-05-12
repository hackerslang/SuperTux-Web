export class Thinking {
    constructor(config) {
        this.scene = config.scene;
        this.creature = config.creature;
        this.icon = config.texture;
        this.thinking = false;
        this.thinkingTime = 0;
        this.thinkingInterval = null;
    }

    init() {
        var creatureTop = this.creature.body.top;

        this.thinkingSmaller = this.scene.add.sprite(this.creature.x, creatureTop - 40, "thinking-smaller");
        this.thinkingSmall = this.scene.add.sprite(this.creature.x, creatureTop - 80, "thinking-small");
        this.thinkingMax = this.scene.add.sprite(this.creature.x, creatureTop - 150, "thinking-max");
        this.smallAnimatedIcon = new SmallAnimatedIcon({ scene: this.scene, x: this.thinkingMax.x, y: this.thinkingMax.y, texture: this.icon });

        var self = this;
        this.scene.tweens.add({
            targets: this.thinkingSmaller,
            alpha: { from: 0, to: 1 },
            duration: 125,
            yoyo: false,
            loop: -1,
            loopDelay: 2000,
            onComplete: function () {
                self.scene.tweens.add({
                    targets: self.thinkingSmall,
                    alpha: { from: 0, to: 1 },
                    duration: 150,
                    yoyo: false,
                    loop: 0,
                    onComplete: function () {
                        self.scene.tweens.add({
                            targets: self.thinkingMax,
                            alpha: { from: 0, to: 1 },
                            duration: 200,
                            yoyo: false,
                            loop: 0,
                            onComplete: function () {
                                self.scene.tweens.add({
                                    targets: self.smallAnimatedIcon,
                                    alpha: { from: 0, to: 1 },
                                    duration: 200,
                                    yoyo: false,
                                    loop: 0,
                                    onComplete: function () {
                                        self.scene.tweens.add({
                                            targets: self.thinkingSmall,
                                            delay: 1500,
                                            alpha: { from: 1, to: 0 },
                                            duration: 75,
                                            yoyo: false,
                                            loop: -1
                                        });
                                        self.scene.tweens.add({
                                            targets: self.thinkingSmaller,
                                            alpha: { from: 1, to: 0 },
                                            delay: 1500,
                                            duration: 75,
                                            yoyo: false,
                                            loop: -1
                                        });
                                    }
                                });
                            }
                        });
                    }
                })
            },
            ease: 'Sine.easeInOut'
        });
    }

    update(time, delta) {
        var creatureTop = this.creature.body.top;

        this.thinkingSmaller.x = this.creature.x;
        this.thinkingSmaller.y = creatureTop - 40;
        this.thinkingSmall.x = this.creature.x + 20;
        this.thinkingSmall.y = creatureTop - 80;
        this.thinkingMax.x = this.creature.x + 40;
        this.thinkingMax.y = creatureTop - 150;
        this.smallAnimatedIcon.x = this.thinkingMax.x;
        this.smallAnimatedIcon.y = this.thinkingMax.y;
    }
}