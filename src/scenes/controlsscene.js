import { Keybindings, KeyBinder } from '../object/controller.js';

export class ControlsScene extends MenuScene {
    constructor() {
        super({ key: 'ControlsScene' });

        this.keyBinder = new keyBinder();
    }

    adjustKey(control, key) {
        this.keyBinder.setKeyBinding(control, key);
    }

    restoreDefaults() {
        this.keyBinder.restoreDefaults();
    }
}