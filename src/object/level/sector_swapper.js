var SectorScenesSlots = [
    {
        "key": "SectorScene1",
        "loadedSector": null
    },
    {
        "key": "SectorScene2",
        "loadedSector": null
    },
    {
        "key": "SectorScene3",
        "loadedSector": null
    }
];

var currentSceneKey = "";

class SectorSwapper {
    static newSector(sector, currentScene) {
        sector.makeCurrent();
        
        this.createNewSectorScene(currentScene);
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

    static createNewSectorScene(currentScene) {
        var firstFreeSectorSlot = this.getFirstFreeSectorSlot();

        if (firstFreeSectorSlot != null) {
            //var sectorScene = currentScene.scene.add(firstFreeSectorSlot.key, SectorSwapper.getSectorSceneFromSlot(firstFreeSectorSlot), false); //autostart = true/false;
            var sector = Sector.getCurrentSector();
            
            game.scene.pause(currentScene.key);
            game.scene.start(firstFreeSectorSlot.key);
            firstFreeSectorSlot.loadedSector = sector;
        }
    }

    static getFirstFreeSectorSlot() {
        console.log(SectorScenesSlots);
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
}
