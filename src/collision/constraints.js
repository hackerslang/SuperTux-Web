export class Constraints {
    constructor(config) {
        this.negativeInfinityX = - 10;
        this.negativeInfinityY = - 10;
        this.infinityX = Sector.getCurrentSectorWidth() + 10;
        this.infinityY = Sector.getCurrentSectorHeight() + 10;

        this.positionLeft = this.negativeInfinityX;
        this.positionRight = this.infinityX;
        this.positionTop = this.negativeInfinityY;
        this.positionBottom = this.infinityY;
    }

    hasConstraints() {
        return
        position_left > this.negativeInfinityX ||
            position_right < this.infinityX ||
            position_top > this.negativeInfinityY ||
            position_bottom < this.infinityY;
    }

    mergeConstraints(other) {
        constrainLeft(other.positionLeft);
        constrainRight(other.positionRight);
        constrainTop(other.positionTop);
        constrainBottom(other.positionBottom);

        hit.left |= other.hit.left;
        hit.right |= other.hit.right;
        hit.top |= other.hit.top;
        hit.bottom |= other.hit.bottom;
        hit.crush |= other.hit.crush;
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