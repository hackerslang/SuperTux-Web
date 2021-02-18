class KeyController {
    constructor(keys, scene) {
        this.keys = keys;
        this.scene = scene;

        this.oldKeys = {};
        this.currentKeys = {};

        for (let key in this.keys) {
            this.setOldControl(key, false);
            this.setControl(key, false);
        }
    }

    setOldControl(key, isKeyDown) {
        this.oldKeys[key] = isKeyDown;
    }

    setControl(key, isKeyDown) {
        this.currentKeys[key] = isKeyDown;
    }

    hold(key) {
        //console.log("HOLD: ..." + key + (this.currentKeys[key] && this.oldKeys[key]));

        return this.currentKeys[key];
    }

    pressed(key) {
        return !this.oldKeys[key] && this.currentKeys[key];
    }

    released(key) {
        return this.oldKeys[key] && !this.currentKeys[key];
    }

    update() {
        for (let key in this.currentKeys) {
            this.setOldControl(key, this.currentKeys[key]);
            this.setControl(key, this.scene.keys[key].isDown);

            if (key == 'jump' && this.oldKeys[key] == false && this.currentKeys[key] == true) {
                console.log(key);
                console.log("old: " + this.oldKeys[key] + ", new :" + this.currentKeys[key]);
            }

        }
    }


}