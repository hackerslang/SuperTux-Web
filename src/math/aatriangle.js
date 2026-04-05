export class AATriangle {
    SOUTHWEST = 0;
    NORTHEAST = 1;
    SOUTHEAST = 2;
    NORTHWEST = 3;
    DIRECTION_MASK = 0x0003;
    DEFORM_BOTTOM = 0x0010;
    DEFORM_TOP = 0x0020;
    DEFORM_LEFT = 0x0030;
    DEFORM_RIGHT = 0x0040;
    DEFORM_MASK = 0x0070;

    constructor(config) {
        this.bbox = config.bbox;
        this.direction = config.direction;
    }

}