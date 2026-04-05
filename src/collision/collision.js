export class Rectangle {

}

export class Collision {

    constructor(config) {

    }

    static makePlane(p1, p2, n, c) {
        n = new Phaser.Math.Vector(p2.y - p1.y, p1.x - p2.x);
        c = - p2.dot(n);
        var nval = n.length();
        n /= nval;
        c /= nval;

        return { n, c };
    }

    static rectangleCollidesWithAATriangle(rect, triangle) {
        if (rect.overlaps(triangle.bbox)) {
            return false;
        }

        var normal = new Vector(0, 0);
        var c = 0.0;
        var p1 = new Vector(0, 0);
        var area = {};

        switch (triangle.dir & triangle.DEFORM_MASK) {
            case 0:
                    area.p1 = triangle.bbox.p1;
                    area.p2 = triangle.bbox.p2;
                    break;
            case AATriangle.DEFORM_BOTTOM:
                    area.p2 = new Vector(triangle.bbox.get_left(), triangle.bbox.get_top() + triangle.bbox.get_height() / 2);
                    area.p2 = triangle.bbox.p2;
                    break;
            case AATriangle.DEFORM_TOP:
                    area.p1 = triangle.bbox.p1;
                    area.p2 = new Vector(triangle.bbox.get_right(), triangle.bbox.get_top() + triangle.bbox.get_height() / 2);
                    break;
            case AATriangle.DEFORM_LEFT:
                    area.p1 = triangle.bbox.p1;
                    area.p2 = new Vector(triangle.bbox.get_left() + triangle.bbox.get_width() / 2, triangle.bbox.get_bottom());
                    break;
            case AATriangle.DEFORM_RIGHT:
                    area.p1 = new Vector(triangle.bbox.get_left() + triangle.bbox.get_width() / 2, triangle.bbox.get_top());
                    area.p2 = triangle.bbox.p2;
                    break;
            default:
                break;
        }

        var hasDownwardsEastCorner = false;
        var hasDownwardsWestCorner = false;

        switch (triangle.dir & triangle.DIRECTION_MASK) {
            case AATriangle.SOUTHWEST:
                p1 = new Vector(rect.left, rect.bottom);
                this.makePlane(area.p1, area.p2, normal, c);
                break;
            case AATriangle.NORTHEAST:
                p1 = new Vector(rect.right, rect.top);
                this.makePlane(area.p2, area.p1, normal, c);
                hasDownwardsWestCorner = true;
                break;
            case AATriangle.SOUTHEAST:
                p1 = rect.p2;
                this.makePlane(new Vector(area.left, area.bottom), new Vector(area.right, area.top), normal, c);
                break;
            case AATriangle.NORTHWEST:
                p1 = rect.p1;
                this.makePlane(new Vector(area.right, area.top), new Vector(area.left, area.bottom), normal, c);
                hasDownwardsEastCorner = true;
                break;
            default:
                break;
        }

        var n_p1 = normal.dot(p1);
        var depth = n_p1 - c;

        if (depth < 0)
            return {
                hits: false,
                constraints: constraints,
                hitsRectangleBottom: hitsRectangleBottom
            };

        var outVector = normal.dot(depth + 0.2);

        const RDELTA = 3;

        if (p1.x < area.getLeft() - RDELTA || p1.x > area.getRight() + RDELTA ||
            p1.y < area.getTop() - RDELTA || p1.y > area.getBottom() + RDELTA) {
        } else {
            if (outvec.x < 0) {
                //hit right
                rect.velocity.x = Math.min(0, rect.velocity.x);
            } else {
                //hit left
                rect.velocity.x = Math.max(0, rect.velocity.x);
            }

            if (outvec.y < 0) {
                //hit bottom
                rect.velocity.y = Math.min(0, rect.velocity.y);
                hitsRectangleBottom = true;
            } else {
                //hit top
                rect.velocity.y = Math.max(0, rect.velocity.y);
            }

            constraints.hit.slopeNormal = normal;
        }

        return {
            hits: true,
            constraints: constraints,
            hitsRectangleBottom: hitsRectangleBottom
        };
    }
}