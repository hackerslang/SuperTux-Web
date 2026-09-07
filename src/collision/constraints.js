import { CollisionHit } from "./collision_hit.js";
import { Sector } from "../object/level/sector.js";

export class Constraints {
    constructor(config) {
        this.negativeInfinityX = Number.MIN_VALUE;
        this.negativeInfinityY = Number.MIN_VALUE;
        this.infinityX = Number.MAX_VALUE;
        this.infinityY = Number.MAX_VALUE;

        this.positionLeft = this.negativeInfinityX;
        this.positionRight = this.infinityX;
        this.positionTop = this.negativeInfinityY;
        this.positionBottom = this.infinityY;

        this.hit = new CollisionHit();
    }

    hasConstraints() {
        return this.positionLeft > this.negativeInfinityX ||
            this.positionRight < this.infinityX ||
            this.positionTop > this.negativeInfinityY ||
            this.positionBottom < this.infinityY;
    }

    mergeConstraints(other) {
        this.constrainLeft(other.positionLeft);
        this.constrainRight(other.positionRight);
        this.constrainTop(other.positionTop);
        this.constrainBottom(other.positionBottom);

        this.hit.left = this.hit.left || !!(other.hit && other.hit.left);
        this.hit.right = this.hit.right || !!(other.hit && other.hit.right);
        this.hit.top = this.hit.top || !!(other.hit && other.hit.top);
        this.hit.bottom = this.hit.bottom || !!(other.hit && other.hit.bottom);
        this.hit.crush = this.hit.crush || !!(other.hit && other.hit.crush);
    }

    constrainLeft(position) {
        this.positionLeft = Math.max(this.positionLeft, position);
    }

    constrainRight(position) {
        this.positionRight = Math.min(this.positionRight, position);
    }

    constrainTop(position) {
        this.positionTop = Math.max(this.positionTop, position);
    }

    constrainBottom(position) {
        this.positionBottom = Math.min(this.positionBottom, position);
    }


}