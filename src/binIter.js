"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBinIter = exports.BinIter = void 0;
class ExIteratorCache {
    constructor(len) {
        this.cachedLen = 0;
        this.cacheArr = new Array(len);
    }
}
class BinIter {
    constructor(len) {
        this.len = len;
        this.index = 0;
    }
    getSize() {
        return this.len - this.index;
    }
    getIndex() {
        return this.index;
    }
    hasNext() {
        return this.index < this.len;
    }
    next() {
        if (!this.hasNext())
            throw new Error("No next value");
        return this.get_inner(this.index++);
    }
    shiftTo(trg) {
        if (trg <= this.len && trg > this.index)
            this.index = trg;
        return this;
    }
    shift(shift) {
        if (this.index + shift <= this.len && shift > 0)
            this.index += shift;
        return this;
    }
    genRangeIter(start = 0, end = this.getSize()) {
        return this.getRangeIter_inner(this.index, start, end);
    }
}
exports.BinIter = BinIter;
function isBinIter(val) {
    return (val !== null && typeof val === "object" && typeof val.genRangeIter === 'function' && typeof val.next === 'function');
}
exports.isBinIter = isBinIter;
//# sourceMappingURL=binIter.js.map

