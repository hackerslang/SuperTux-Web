import { CookieSave } from '../object/game_session.js';

export var DefaultKeyBindings = [
    { 'caption': 'jump', 'expl': 'Jump', 'key': Phaser.Input.Keyboard.KeyCodes.Z },
    { 'caption': 'fire', 'expl': 'Fire', 'key': Phaser.Input.Keyboard.KeyCodes.CTRL },
    { 'caption': 'left', 'expl': 'Left', 'key': Phaser.Input.Keyboard.KeyCodes.Q },
    { 'caption': 'right', 'expl': 'Right', 'key': Phaser.Input.Keyboard.KeyCodes.S },
    { 'caption': 'duck', 'expl': 'Duck;Down when Climbing', 'key': Phaser.Input.Keyboard.KeyCodes.W },
    { 'caption': 'menu', 'expl': 'Menu', 'key': Phaser.Input.Keyboard.KeyCodes.ESC },
    { 'caption': 'pause', 'expl': 'Pause', 'key': Phaser.Input.Keyboard.KeyCodes.P },
    { 'caption': 'use', 'expl': 'Use;Interact;Grab for Climbing;Toggle Grab', 'key': Phaser.Input.Keyboard.KeyCodes.E },
    { 'caption': 'grab', 'expl': 'Grab Enemy;Grab for Climbing;Toggle Grab', 'key': Phaser.Input.Keyboard.KeyCodes.G },
    { 'caption': 'jumpalways', 'expl': 'Always Jump;Jump when Climbing', 'key': Phaser.Input.Keyboard.KeyCodes.SPACE },
    { 'caption': 'quicksave', 'expl': 'Quick Save', 'key': Phaser.Input.Keyboard.KeyCodes.K },
    { 'caption': 'quickload', 'expl': 'Quick Load', 'key': Phaser.Input.Keyboard.KeyCodes.L }
];

export class KeyController {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        this.keyBinder = new KeyBinder();
        this.oldKeys = {};
        this.currentKeys = {};

        this.keyBindings = this.getKeyBindings();
        this.keys = this.getKeys();

        var self = this;
        this.keys.forEach(function parse(key) {
            self.setOldControl(key, false);
            self.setControl(key, false);
        });

        this.generateKeysForScene();
    }

    getKeys() {
        return this.keyBinder.getKeyBindings().map(k => k.caption);
    }

    getKeyBindings() {
        return this.keyBinder.getKeyBindings();
    }

    setOldControl(keyBinding, isKeyDown) {
        this.oldKeys[keyBinding] = isKeyDown;
    }

    setControl(keyBinding, isKeyDown) {
        this.currentKeys[keyBinding] = isKeyDown;
    }

    hold(key) {
        return this.currentKeys[key];
    }

    pressed(key) {
        return !this.oldKeys[key] && this.currentKeys[key];
    }

    released(key) {
        return this.oldKeys[key] && !this.currentKeys[key];
    }

    generateKeysForScene() {
        var keys = {};

        var self = this;
        this.keyBindings.forEach(function (keyBinding) {
            keys[keyBinding.caption] = self.scene.input.keyboard.addKey(keyBinding.key);
        });

        this.scene.keys = keys;
    }

    update() {
        var self = this;
        this.keys.forEach(function parse(key) {
            self.setOldControl(key, self.currentKeys[key]);
            self.setControl(key, self.scene.keys[key].isDown);
        });
    }
}

export class KeyBinder {
    constructor() {
        this.init();
    }

    init() {
        this.keyBindings = this.getKeyBindings();
    }

    changeKeyBinding(action, newKeyBinding) {
        if (this.keyBindings[action]) {
            this.keyBindings[action].key = newKeyBinding;
            this.save();
        }
    }

    restoreDefaults() {
        this.keyBindings = DefaultKeyBindings;
        this.save();
    }

    getKeyBindings() {
        var keyBindings = this.load();

        if (keyBindings == null) {
            keyBindings = DefaultKeyBindings;
        }

        return keyBindings;
    }

    save() {
        var cookieValue = JSON.stringify(this.keyBindings);

        CookieSave.setCookie("SuperTuxWeb-KeyBindings", cookieValue);
    }

    load() {
        var cookieValue = CookieSave.getCookie("SuperTuxWeb-KeyBindings");
        var loadedKeyBindings = null;

        if (cookieValue != null) {
            loadedKeyBindings = JSON.parse(cookieValue);
        }

        return loadedKeyBindings;
    }
}