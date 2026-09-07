import { AATriangle } from '../math/aatriangle.js';
import { Rect } from '../math/rect.js';

export class Collision {

    constructor(config) {

    }

    static makePlane(p1, p2, n, c) {
        n = new Phaser.Math.Vector2(p2.y - p1.y, p1.x - p2.x);
        c = - p2.dot(n);
        var nval = n.length();
        n /= nval;
        c /= nval;

        return { n, c };
    }

    static rectangleCollidesWithAATriangle(constraints, rect, triangle, collisionObject) {
        if (!rect.overlaps(triangle.bbox)) {
            return false;
        }

        var normal = new Phaser.Math.Vector2(0, 0);
        var c = 0.0;
        var p1 = new Phaser.Math.Vector2(0, 0);
        var area = new Rect();

        var hitsRectangleBottom = false;

        switch (triangle.dir & triangle.DEFORM_MASK) {
            case 0:
                    area.p1 = triangle.bbox.p1;
                    area.p2 = triangle.bbox.p2;
                    break;
            case AATriangle.DEFORM_BOTTOM:
                    area.p2 = new Vector(triangle.bbox.left, triangle.bbox.top + triangle.bbox.height / 2);
                    area.p2 = triangle.bbox.p2;
                    area.p1 = triangle.bbox.p1;
                    area.p2 = new Vector(triangle.bbox.getRight(), triangle.bbox.top + triangle.bbox.height / 2);
                    break;
            case AATriangle.DEFORM_LEFT:
                    area.p1 = triangle.bbox.p1;
                    area.p2 = new Vector(triangle.bbox.left + triangle.bbox.width / 2, triangle.bbox.getBottom());
                    break;
            case AATriangle.DEFORM_RIGHT:
                    area.p1 = new Vector(triangle.bbox.left + triangle.bbox.width / 2, triangle.bbox.top);
                    area.p2 = triangle.bbox.p2;
                    break;
            default:
                break;
        }

        var hasDownwardsEastCorner = false;
        var hasDownwardsWestCorner = false;
        
        switch (triangle.dir & triangle.DIRECTION_MASK) {
            case AATriangle.SOUTHWEST:
                p1 = new Vector(rect.left, rect.getBottom());
                ({ normal, c } = this.makePlane(area.p1, area.p2, normal, c));
                break;
            case AATriangle.NORTHEAST:
                p1 = new Vector(rect.getRight(), rect.top);
                ({ normal, c } = this.makePlane(area.p2, area.p1, normal, c));
                hasDownwardsWestCorner = true;
                break;
            case AATriangle.SOUTHEAST:
                p1 = rect.p2;
                ({ normal, c } = this.makePlane(new Vector(area.left, area.getBottom()), new Vector(area.getRicht(), area.top), normal, c));
                break;
            case AATriangle.NORTHWEST:
                p1 = rect.p1;
                ({ normal, c } = this.makePlane(new Vector(area.getRight(), area.top), new Vector(area.left, area.getBottom()), normal, c));
                hasDownwardsEastCorner = true;
                break;
            default:
                break;
        }
        //ok till here
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
        
        if (p1.x < area.left - RDELTA || p1.x > area.getRight() + RDELTA ||
            p1.y < area.top - RDELTA || p1.y > area.getBottom() + RDELTA) {
        } else {
            if (outVector.x < 0) {
                //hit right
                constraints.constrainRight(rect.right + outVector.x);
                constraints.hit.right = true;
            } else {
                //hit left
                constraints.constrainLeft(rect.left + outVector.x);
                constraints.hit.left = true;
            }

            if (outVector.y < 0) {
                //hit bottom
                constraints.constrainBottom(rect.bottom + outVector.y);
                constraints.hit.bottom = true;
                hitsRectangleBottom = true;
            } else {
                //hit top
                constraints.constrainTop(rect.top + outVector.y);
                constraints.hit.top = true;
            }

            constraints.hit.slopeNormal = normal;
        }

        return {
            hits: true,
            constraints: constraints,
            hitsRectangleBottom: hitsRectangleBottom
        };
    }

    static lineIntersectsLine(line1Start, line1End, line2Start, line2End) {
        // Adapted from Striker, (C) 1999 Joris van der Hoeven, GPL

        var a1 = line1Start.x, b1 = line1Start.y, a2 = line1End.x, b2 = line1End.y;
        var c1 = line2Start.x, d1 = line2Start.y, c2 = line2End.x, d2 = line2End.y;

        var num = (b2 - b1) * (c2 - c1) - (a2 - a1) * (d2 - d1);
        var den1 = (d2 - b2) * (c1 - c2) + (a2 - c2) * (d1 - d2);
        var den2 = (d2 - b2) * (a1 - a2) + (a2 - c2) * (b1 - b2);

        // Normalize to positive numerator.
        if (num < 0) {
            num = -num;
            den1 = -den1;
            den2 = -den2;
        }

        // Numerator is zero -> Check for parallel or coinciding lines.
        if (num == 0) {
            if ((b1 - b2) * (c1 - a2) != (a1 - a2) * (d1 - b2)) return false;
            if (a1 == a2) {
                [a1, b1] = [b1, a1];
                [a2, b2] = [b2, a2];
                [c1, d1] = [d1, c1];
                [c2, d2] = [d2, c2];
            }
            if (a1 > a2) [a1, a2] = [a2, a1];
            if (c1 > c2) [c1, c2] = [c2, c1];
            return ((a1 <= c2) && (a2 >= c1));
        }

        // Standard check.
        return (den1 >= 0) && (den1 <= num) && (den2 >= 0) && (den2 <= num);

    }

    static intersectsLine(r, lineStart, lineEnd) {
        var p1 = r.p1();
        var p2 = new Phaser.Math.Vector2(r.getRight(), r.top);
        var p3 = r.p2();
        var p4 = new Phaser.Math.Vector2(r.left, r.getBottom());

        if (Collision.lineIntersectsLine(p1, p2, lineStart, lineEnd)) return true;
        if (Collision.lineIntersectsLine(p2, p3, lineStart, lineEnd)) return true;
        if (Collision.lineIntersectsLine(p3, p4, lineStart, lineEnd)) return true;
        if (Collision.lineIntersectsLine(p4, p1, lineStart, lineEnd)) return true;

        return false;
    }
}