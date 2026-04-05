import { imagesData } from '../../assets/data/images.js';

export class AtlasLoader {
    constructor(config) {
        this.scene = config.scene;
        this.imagesData = imagesData;
    }

    loadAtlasFromData(key) {
        var entity = this.imagesData.atlas[key];

        this.scene.load.atlas(key, entity.image, entity.json);
    }

    getTextureFromAtlas(atlasKey, textureKey) {
        var texture = this.scene.textures.getFrame(atlasKey, textureKey);

        return texture;
    }
}