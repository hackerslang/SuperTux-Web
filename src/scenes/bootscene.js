export class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'BootScene' }); }
    preload() {
        // load the plugin file and register it immediately (true = start)
        this.load.plugin('rexlineprogressplugin', 'plugins/rexlineprogressplugin.min.js', true);
    }
    create() {
        // plugin is now registered; start your real scenes
        this.scene.start('LevelSelectScene');
    }
}