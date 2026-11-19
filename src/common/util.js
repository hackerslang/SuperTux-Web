export class Util {
    constructor() {

    }

    static is3DArray(value) {
        function hasDepth(value, depth) {
            if (depth === 0) return !Array.isArray(value);
            return Array.isArray(value)
                && value.length > 0
                && value.every(item => hasDepth(item, depth - 1));
        }

        return hasDepth(value, 3);
    }
}

