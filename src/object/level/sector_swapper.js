import { SectorScene1, SectorScene2, SectorScene3 } from '../../scenes/sectorscene.js';
import { Sector } from './sector.js';
import { game } from '../../game.js';

export var SectorScenesSlots = [
    {
        "key": "SectorScene1",
        "loadedSector": null,
        "loadedScene": null
    },
    {
        "key": "SectorScene2",
        "loadedSector": null,
        "loadedScene": null
    },
    {
        "key": "SectorScene3",
        "loadedSector": null,
        "loadedScene": null
    }
];

export class SectorSwapper {
    static newSector(sector, currentScene) {
        sector.makeCurrent();
        
        this.createNewSectorScene(currentScene);
    }

    static clearAllSectors() {
        for (var i = 0; i < SectorScenesSlots.length; i++) {
            if (SectorScenesSlots[i].loadedSector != null) {
                game.scene.stop("SectorScene" + (i + 1));
                SectorScenesSlots[i].loadedSector = null;
                SectorScenesSlots[i].loadedScene = null;
            }
        }
    }

    static swapSector(sector, currentScene) {
        var sectorSlotFound = this.findSectorSlotForSector(sector);

        currentScene.scene.pause();
        sector.makeCurrent();

        if (sectorSlotFound != null) {
            game.scene.start(sectorSlot.key);
        } else {
            this.createNewSectorScene();
        }
    }

    static getLoadedSectors() {
        return Sector.getLoadedSectors();
    }

    static findSectorSlotForSector(sector) {
        for (var i = 0; i < SectorScenesSlots.length; i++) {
            var sectorSlot = SectorScenesSlots[i];
            if (sectorSlot.loadedSector != null && sectorSlot.loadedSector.name == sector.name) {
                return sectorSlot;
            }
        }

        return null;
    }

    static getCurrentSceneKey() {
        var sectorSlot = SectorSwapper.findSectorSlotForSector(Sector.getCurrentSector());

        return sectorSlot.key;
    }

    static createNewSectorScene(currentScene) {
        var firstFreeSectorSlot = this.getFirstFreeSectorSlot();

        if (firstFreeSectorSlot != null) {
            var sector = Sector.getCurrentSector();
            
            game.scene.pause(currentScene.key);
            game.scene.start(firstFreeSectorSlot.key, { slot: firstFreeSectorSlot });
            firstFreeSectorSlot.loadedSector = sector;
        }
    }
            
    // Launch a sector scene in the background (preload/create) without stopping the current scene.
    // The sector scene will put itself to sleep if it receives { preloadOnly: true } in data.
    static createNewSectorSceneInBackground(currentScene) {
        var firstFreeSectorSlot = this.getFirstFreeSectorSlot();

        if (firstFreeSectorSlot != null) {
            var sector = Sector.getCurrentSector();

            // Launch the scene so it runs in parallel with the current scene
            currentScene.scene.launch(firstFreeSectorSlot.key, { slot: firstFreeSectorSlot, preloadOnly: true });
            firstFreeSectorSlot.loadedSector = sector;

            return firstFreeSectorSlot;
        }

        return null;
    }

    static restartScene(currentScene) {
        var currentSlot = SectorSwapper.getCurrentSectorSlot(currentScene);
        var currentSceneKey = currentSlot.key;

        if (currentSlot != null) {
            game.scene.stop(currentSceneKey);
            game.scene.start(currentSceneKey, { slot: currentSlot });
        }
    }

    static getCurrentSectorSlot(currentScene) {
        var currentSlot = SectorScenesSlots.filter((x) => x.key == currentScene.key)[0];

        return currentSlot;
    }

    static getFirstFreeSectorSlot() {
        for (var i = 0; i < SectorScenesSlots.length; i++) {
            var sectorSlot = SectorScenesSlots[i];
            if (sectorSlot.loadedSector == null) {
                return sectorSlot;
            }
        }

        return null;
    }

    static getSectorSceneFromSlot(sectorSlot) {
        var sectorScene = null;

        switch (sectorSlot.key) {
            case "SectorScene2":
                sectorScene = SectorScene2;
                break;
            case "SectorScene3":
                sectorScene = SectorScene3;
                break;
            default:
                sectorScene = SectorScene1;
                break;
        }

        return sectorScene;
    }

    static getSectorSceneObjectFromSlot(sectorSlot) {
        var sectorSceneObj = sectorSlot.loadedScene;

        return sectorSceneObj;
    }

    static getCurrentSectorScene() {
        var sectorSlot = SectorSwapper.getCurrentSceneKey();

        return SectorSwapper.getSectorSceneFromSlot(sectorSlot);
    }

    static getCurrentSectorSceneObject() {
        var key = SectorSwapper.getCurrentSceneKey();
        var sectorSlot = SectorScenesSlots.find((x) => key == key);

        return SectorSwapper.getSectorSceneObjectFromSlot(sectorSlot);
    }
}
