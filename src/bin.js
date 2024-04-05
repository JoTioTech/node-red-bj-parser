"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeItaratorToPrint_hex = exports.consumeItaratorToPrint_bin = exports.consumeIiterToUTF8 = exports.consumeIiterToBuffer = exports.consumeIiterToArrString = exports.consumeIterToInt = exports.concatIterator = exports.genMaskIterator = exports.binFromHex = exports.Multi_iterator = exports.RA_iterator = exports.BaseBin = void 0;
const binIter_1 = require("./binIter");
const enums_1 = require("./enums");
const sQueue_1 = __importDefault(require("./sQueue"));
class BaseBin {
    constructor(data) {
        this.data = data;
    }
    getLen() {
        return this.data.length;
    }
    get(i) {
        return this.data[i];
    }
    genIter() {
        return new RA_iterator(this);
    }
}
exports.BaseBin = BaseBin;
class RA_iterator extends binIter_1.BinIter {
    constructor(base, start = 0, end = base.getLen()) {
        super(end - start);
        this.base = base;
        this.start = start;
    }
    get_inner(usedIndex) {
        return this.base.get(this.start + usedIndex);
    }
    getRangeIter_inner(index, start, end) {
        return new RA_iterator(this.base, this.start + index + start, this.start + index + end);
    }
}
exports.RA_iterator = RA_iterator;
class Multi_iterator extends binIter_1.BinIter {
    constructor(ranges, len) {
        super(len);
        this.ranges = ranges;
        this.curRange = 0;
    }
    get_inner(usedIndex) {
        let range = this.ranges[this.curRange];
        if (range.end <= usedIndex) {
            while (range.end <= usedIndex) {
                this.curRange++;
                range = this.ranges[this.curRange];
            }
            if (range.dirty.refCount !== 0) {
                if (range.dirty.refCount-- === 0)
                    range.dirty = { refCount: 0 };
                range.iter = range.iter.genRangeIter();
            }
        }
        range.iter.shiftTo(usedIndex - range.start);
        return range.iter.next();
    }
    getRangeIter_inner(index, start, end) {
        if (this.ranges.length === 0)
            return new Multi_iterator([], 0);
        Multi_iterator.DEV_TABS++;
        let startRange = this.curRange;
        let trgId = index + start;
        let trgIdE = index + end;
        while (startRange < this.ranges.length && this.ranges[startRange].end <= trgId) {
            startRange++;
        }
        let endRange = startRange;
        while (endRange < this.ranges.length && this.ranges[endRange].end < trgIdE) {
            endRange++;
        }
        endRange++;
        const newRranges = this.ranges.slice(startRange, endRange).map((val, i) => {
            const ret = {
                start: val.start - trgId,
                end: val.end - trgId,
                iter: val.iter,
                dirty: val.dirty
            };
            val.dirty.refCount++;
            return ret;
        });
        if (newRranges.length === 1) {
            Multi_iterator.DEV_TABS--;
            newRranges[0].dirty.refCount--;
            return newRranges[0].iter.genRangeIter(-1 * newRranges[0].start, trgIdE + trgId - newRranges[0].start);
        }
        else if (newRranges.length !== 0) {
            newRranges[0].dirty.refCount--;
            newRranges[0].dirty = { refCount: 0 };
            newRranges[0].iter = newRranges[0].iter.genRangeIter(-1 * newRranges[0].start);
            newRranges[0].start = 0;
        }
        const ret = new Multi_iterator(newRranges, end - start);
        Multi_iterator.DEV_TABS--;
        return ret;
    }
}
exports.Multi_iterator = Multi_iterator;
Multi_iterator.DEV_TABS = 0;
function binFromHex(str) {
    const serchString = str.replace(/[ \t\n]/g, '').toLocaleLowerCase();
    const ret = new Array(serchString.length * 4);
    for (let i = 0; i < serchString.length; i++) {
        let bin = parseInt(serchString[i], 16);
        for (let j = 0; j < 4; j++) {
            ret[i * 4 + 3 - j] = (bin >> j) % 2 === 1;
        }
    }
    return new BaseBin(ret);
}
exports.binFromHex = binFromHex;
function genMaskIterator(base, mask, executor, inverse = false) {
    const expandedMask = expandMask(new sQueue_1.default(mask), executor, inverse);
    const ranges = [];
    let lastEnd = 0;
    let agregadedLen = 0;
    for (let i = 0; i < expandedMask.length; i++) {
        let len = expandedMask[i].len;
        const lastAgrLen = agregadedLen;
        if (len === -1) {
            agregadedLen += base.getSize() - lastEnd;
            ranges.push({
                end: agregadedLen,
                start: lastAgrLen,
                iter: base.genRangeIter(lastEnd),
                dirty: {
                    refCount: 0
                },
            });
            break;
        }
        if (len < 1)
            continue;
        const nextEnd = lastEnd + len;
        if (expandedMask[i].val) {
            if (nextEnd > base.getSize())
                len = len - (nextEnd - base.getSize());
            agregadedLen += len;
            ranges.push({
                end: agregadedLen,
                start: lastAgrLen,
                iter: base.genRangeIter(lastEnd, nextEnd),
                dirty: {
                    refCount: 0
                }
            });
        }
        if (nextEnd >= base.getSize())
            break;
        lastEnd = nextEnd;
    }
    return new Multi_iterator(ranges, agregadedLen);
}
exports.genMaskIterator = genMaskIterator;
function concatIterator(list) {
    let acmLen = 0;
    const ranges = list.map(val => {
        const oldAcmLen = acmLen;
        acmLen += val.getSize();
        return {
            end: acmLen,
            start: oldAcmLen,
            iter: val.genRangeIter(),
            dirty: {
                refCount: 0
            }
        };
    });
    return new Multi_iterator(ranges, acmLen);
}
exports.concatIterator = concatIterator;
function expandMask(mask, executor, inverse) {
    const parsedMask = [];
    executor.setVar("len", -1, enums_1.ExeType.INT);
    while (mask.hasNext()) {
        mask.shiftWhitespace();
        const char = mask.next();
        let loadedSimbol;
        let repetition = 1;
        if (char === '1') {
            loadedSimbol = !inverse;
        }
        else if (char === '0') {
            loadedSimbol = inverse;
        }
        else {
            throw new Error('Not valid mask');
        }
        if (mask.peek() == '(') {
            mask.next();
            mask.pushPairStart();
            repetition = executor.exec(mask, enums_1.ExeType.INT, ')');
            mask.popPairEnd();
        }
        if (repetition === -1) {
            if (loadedSimbol) {
                parsedMask.push({
                    len: -1,
                    val: loadedSimbol
                });
            }
            return parsedMask;
        }
        if (parsedMask.length === 0 || parsedMask[parsedMask.length - 1].val != loadedSimbol) {
            parsedMask.push({
                len: repetition,
                val: loadedSimbol
            });
        }
        else {
            parsedMask[parsedMask.length - 1].len += repetition;
        }
    }
    return parsedMask;
}
function consumeIterToInt(iter) {
    let exp = iter.getSize() - 1;
    let res = 0;
    for (; exp >= 0; exp--) {
        if (iter.next())
            res += Math.pow(2, exp);
    }
    return res;
}
exports.consumeIterToInt = consumeIterToInt;
function consumeIiterToArrString(iter) {
    let ret = '';
    while (iter.hasNext()) {
        ret += iter.next() ? "1" : "0";
    }
    return ret;
}
exports.consumeIiterToArrString = consumeIiterToArrString;
function consumeIiterToBuffer(iter) {
    const len = iter.getSize() / 8;
    const bufArr = [];
    for (let i = 0; i < len; i++) {
        let num = 0;
        for (let j = 7; j >= 0; j--) {
            if (iter.next())
                num += Math.pow(2, j);
        }
        bufArr.push(num);
    }
    bufArr.reverse();
    return Buffer.from(bufArr);
}
exports.consumeIiterToBuffer = consumeIiterToBuffer;
function consumeIiterToUTF8(iter) {
    return consumeIiterToBuffer(iter).toString('utf8');
}
exports.consumeIiterToUTF8 = consumeIiterToUTF8;
function consumeItaratorToPrint_bin(iter, length) {
    let ret = '';
    const absLen = iter.getSize();
    const len = (!length || length < 0 || length > iter.getSize()) ? iter.getSize() : length;
    for (let i = 0; i < len; i++) {
        ret += iter.next() ? "1" : "0";
        if (i % 8 === 7) {
            ret += ' ';
        }
    }
    if (iter.hasNext()) {
        ret += "...";
        ret += `[${formatBinUnits(absLen)}]`;
    }
    return ret;
}
exports.consumeItaratorToPrint_bin = consumeItaratorToPrint_bin;
function consumeItaratorToPrint_hex(iter, length) {
    let ret = '';
    let j = 8;
    const absLen = iter.getSize();
    const len = (!length || length < 0) ? Infinity : length;
    for (let i = 0; i < len && iter.hasNext(); i += 8) {
        if (i != 0) {
            ret += ' ';
            if (i % 32 === 0)
                ret += ' ';
        }
        let value = 0;
        for (j = 0; j < 8 && iter.hasNext(); j++) {
            value += (iter.next() ? 1 : 0) * Math.pow(2, 7 - j);
        }
        if (value < 0xf)
            ret += '0';
        ret += value.toString(16);
    }
    if (j != 8)
        ret += `(-${8 - j}b)`;
    if (iter.hasNext()) {
        ret += "...";
        ret += `[${formatBinUnits(absLen)}]`;
    }
    return ret;
}
exports.consumeItaratorToPrint_hex = consumeItaratorToPrint_hex;
function formatBinUnits(val) {
    if (val > 1000000)
        return (val / 1000000).toFixed(6).padStart(10, " ") + " Mb";
    else if (val > 1000)
        return (val / 1000).toFixed(3).padStart(7, " ") + " Kb";
    else
        return val.toFixed(0).padStart(3, " ") + " b";
}
//# sourceMappingURL=bin.js.map