import { CookieSave } from "../object/game_session.js";

export var DefaultKeyBindings = [
    { "caption": "jump", "expl": "Jump", "defaultKey": Phaser.Input.Keyboard.KeyCodes.Z, "configureable": true },
    { "caption": "fire", "expl": "Fire", "defaultKey": Phaser.Input.Keyboard.KeyCodes.CTRL, "configurable": true },
    { "caption": "left", "expl": "Left", "defaultKey": Phaser.Input.Keyboard.KeyCodes.Q, "configurable": true },
    { "caption": "right", "expl": "Right", "defaultKey": Phaser.Input.Keyboard.KeyCodes.S, "configurable": true },
    { "caption": "duck", "expl": "Duck;Down when Climbing", "defaultKey": Phaser.Input.Keyboard.KeyCodes.W, "configurable": true },
    { "caption": "menu", "expl": "Menu", "defaultKey": Phaser.Input.Keyboard.KeyCodes.ESC, "configurable": false },
    { "caption": "pause", "expl": "Pause", "defaultKey": Phaser.Input.Keyboard.KeyCodes.P, "configurable": false },
    { "caption": "use", "expl": "Use;Interact;Grab for Climbing;Toggle Grab", "defaultKey": Phaser.Input.Keyboard.KeyCodes.E, "configurable": true },
    { "caption": "grab", "expl": "Grab Enemy;Grab for Climbing;Toggle Grab", "defaultKey": Phaser.Input.Keyboard.KeyCodes.G, "configurable": true },
    { "caption": "jumpalways", "expl": "Always Jump;Jump defaultKey", "defaultKey": Phaser.Input.Keyboard.KeyCodes.SPACE, "configurable": true },
    { "caption": "quicksave", "expl": "Quick Save", "defaultKey": Phaser.Input.Keyboard.KeyCodes.K, "configurable": false },
    { "caption": "quickload", "expl": "Quick Load", "defaultKey": Phaser.Input.Keyboard.KeyCodes.L, "configurable": false },
];

export var PossibleKeys = [
    Phaser.Input.Keyboard.KeyCodes.A, Phaser.Input.Keyboard.KeyCodes.B, Phaser.Input.Keyboard.KeyCodes.C,
    Phaser.Input.Keyboard.KeyCodes.D, Phaser.Input.Keyboard.KeyCodes.E, Phaser.Input.Keyboard.KeyCodes.F,
    Phaser.Input.Keyboard.KeyCodes.G, Phaser.Input.Keyboard.KeyCodes.H, Phaser.Input.Keyboard.KeyCodes.I,
    Phaser.Input.Keyboard.KeyCodes.J, Phaser.Input.Keyboard.KeyCodes.K, Phaser.Input.Keyboard.KeyCodes.L,
    Phaser.Input.Keyboard.KeyCodes.M, Phaser.Input.Keyboard.KeyCodes.N, Phaser.Input.Keyboard.KeyCodes.O,
    Phaser.Input.Keyboard.KeyCodes.P, Phaser.Input.Keyboard.KeyCodes.Q, Phaser.Input.Keyboard.KeyCodes.R,
    Phaser.Input.Keyboard.KeyCodes.S, Phaser.Input.Keyboard.KeyCodes.T, Phaser.Input.Keyboard.KeyCodes.U,
    Phaser.Input.Keyboard.KeyCodes.V, Phaser.Input.Keyboard.KeyCodes.W, Phaser.Input.Keyboard.KeyCodes.X,
    Phaser.Input.Keyboard.KeyCodes.Y, Phaser.Input.Keyboard.KeyCodes.Z,

    Phaser.Input.Keyboard.KeyCodes.ESC, Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.ENTER,
    Phaser.Input.Keyboard.KeyCodes.BACKSPACE, Phaser.Input.Keyboard.KeyCodes.TAB,
    Phaser.Input.Keyboard.KeyCodes.SHIFT, Phaser.Input.Keyboard.KeyCodes.CTRL, Phaser.Input.Keyboard.KeyCodes.ALT,
    Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.DOWN,
    Phaser.Input.Keyboard.KeyCodes.LEFT, Phaser.Input.Keyboard.KeyCodes.RIGHT,
    Phaser.Input.Keyboard.KeyCodes.NUM_0, Phaser.Input.Keyboard.KeyCodes.NUM_1,
    Phaser.Input.Keyboard.KeyCodes.NUM_2, Phaser.Input.Keyboard.KeyCodes.NUM_3,
    Phaser.Input.Keyboard.KeyCodes.NUM_4, Phaser.Input.Keyboard.KeyCodes.NUM_5,
    Phaser.Input.Keyboard.KeyCodes.NUM_6, Phaser.Input.Keyboard.KeyCodes.NUM_7,
    Phaser.Input.Keyboard.KeyCodes.NUM_8, Phaser.Input.Keyboard.KeyCodes.NUM_9
];

//to be used for control menu!
export var KeyCaptions = [
    { key: Phaser.Input.Keyboard.KeyCodes.A, caption: "A" },
    { key: Phaser.Input.Keyboard.KeyCodes.B, caption: "B" },
    { key: Phaser.Input.Keyboard.KeyCodes.C, caption: "C" },
    { key: Phaser.Input.Keyboard.KeyCodes.D, caption: "D" },
    { key: Phaser.Input.Keyboard.KeyCodes.E, caption: "E" },
    { key: Phaser.Input.Keyboard.KeyCodes.F, caption: "F" },
    { key: Phaser.Input.Keyboard.KeyCodes.G, caption: "G" },
    { key: Phaser.Input.Keyboard.KeyCodes.H, caption: "H" },
    { key: Phaser.Input.Keyboard.KeyCodes.I, caption: "I" },
    { key: Phaser.Input.Keyboard.KeyCodes.J, caption: "J" },
    { key: Phaser.Input.Keyboard.KeyCodes.K, caption: "K" },
    { key: Phaser.Input.Keyboard.KeyCodes.L, caption: "L" },
    { key: Phaser.Input.Keyboard.KeyCodes.M, caption: "M" },
    { key: Phaser.Input.Keyboard.KeyCodes.N, caption: "N" },
    { key: Phaser.Input.Keyboard.KeyCodes.O, caption: "O" },
    { key: Phaser.Input.Keyboard.KeyCodes.P, caption: "P" },
    { key: Phaser.Input.Keyboard.KeyCodes.Q, caption: "Q" },
    { key: Phaser.Input.Keyboard.KeyCodes.R, caption: "R" },
    { key: Phaser.Input.Keyboard.KeyCodes.S, caption: "S" },
    { key: Phaser.Input.Keyboard.KeyCodes.T, caption: "T" },
    { key: Phaser.Input.Keyboard.KeyCodes.U, caption: "U" },
    { key: Phaser.Input.Keyboard.KeyCodes.V, caption: "V" },
    { key: Phaser.Input.Keyboard.KeyCodes.W, caption: "W" },
    { key: Phaser.Input.Keyboard.KeyCodes.X, caption: "X" },
    { key: Phaser.Input.Keyboard.KeyCodes.Y, caption: "Y" },
    { key: Phaser.Input.Keyboard.KeyCodes.Z, caption: "Z" }
    , { key: Phaser.Input.Keyboard.KeyCodes.ESC, caption: "ESC" }
    , { key: Phaser.Input.Keyboard.KeyCodes.SPACE, caption: "SPACE" }
    , { key: Phaser.Input.Keyboard.KeyCodes.ENTER, caption: "ENTER" }
    , { key: Phaser.Input.Keyboard.KeyCodes.BACKSPACE, caption: "BACKSPACE" }
    , { key: Phaser.Input.Keyboard.KeyCodes.TAB, caption: "TAB" }
    , { key: Phaser.Input.Keyboard.KeyCodes.SHIFT, caption: "SHIFT" }
    , { key: Phaser.Input.Keyboard.KeyCodes.CTRL, caption: "CTRL" }
    , { key: Phaser.Input.Keyboard.KeyCodes.ALT, caption: "ALT" }
    , { key: Phaser.Input.Keyboard.KeyCodes.UP, caption: "UP" }
    , { key: Phaser.Input.Keyboard.KeyCodes.DOWN, caption: "DOWN" }
    , { key: Phaser.Input.Keyboard.KeyCodes.LEFT, caption: "LEFT" }
    , { key: Phaser.Input.Keyboard.KeyCodes.RIGHT, caption: "RIGHT" }
    , { key: Phaser.Input.Keyboard.KeyCodes.NUM_0, caption: "NUM 0" }
    , { key: Phaser.Input.Keyboard.KeyCodes.NUM_1, caption: "NUM 1" }
    , { key: Phaser.Input.Keyboard.KeyCodes.NUM_2, caption: "NUM 2" }
    , { key: Phaser.Input.Keyboard.KeyCodes.NUM_3, caption: "NUM 3" }
    , { key: Phaser.Input.Keyboard.KeyCodes.NUM_4, caption: "NUM 4" }
    , { key: Phaser.Input.Keyboard.KeyCodes.NUM_5, caption: "NUM 5" }
    , { key: Phaser.Input.Keyboard.KeyCodes.NUM_6, caption: "NUM 6" }
    , { key: Phaser.Input.Keyboard.KeyCodes.NUM_7, caption: "NUM 7" }
    , { key: Phaser.Input.Keyboard.KeyCodes.NUM_8, caption: "NUM 8" }
    , { key: Phaser.Input.Keyboard.KeyCodes.NUM_9, caption: "NUM 9" }
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
        if (!PossibleKeys.includes(newKeyBinding)) { return; }

        if (this.keyBindings === undefined) { return; }

        var keyBinding = this.keyBindings.find(k => k.caption === action);

        if (keyBinding === undefined) { return; }

        var defaultKeyBinding = DefaultKeyBindings.find(k => k.caption === action);

        if (defaultKeybinding === undefined || defaultKeyBinding.configurable === false) { return; } 

        keyBinding.key = newKeyBinding;

        this.save();
    }

    restoreDefaults() {
        this.mapDefaultKeyBindings();
        this.save();
    }

    getKeyBindings() {
        var keyBindings = this.load();

        if (keyBindings == null) {
            this.restoreDefaults();
        }

        return keyBindings;
    }

    mapDefaultKeyBindings() {
        this.keyBindings = DefaultKeyBindings.map(keyBinding => ({ caption: keyBinding.caption, key: keyBinding.defaultKey }));
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