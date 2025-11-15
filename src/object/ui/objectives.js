import { FontLoader } from './fontloader.js';

export class Objectives {

    showObjective(scene, text, options = {}) {
        const font = options.font || 'SuperTuxSmallFont';
        const margin = options.margin != null ? options.margin : 12;
        const scale = options.scale != null ? options.scale : 1;
        const fade = options.fade != null ? options.fade : false;

        const loader = new FontLoader();

        const x = scene.cameras.main.width - margin;
        const y = margin;

        const ft = loader.displayTextAlignRight({
            scene: scene,
            fontName: font,
            x: x,
            y: y,
            text: text,
            scale: scale,
            fade: fade
        });

        ft.show();

        return ft;
    }
}