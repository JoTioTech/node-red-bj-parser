"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
class SQueue {
    constructor(strRef, start, end) {
        this.strRef = strRef;
        this.errPairNotFount = [];
        this.start = start || 0;
        this.end = end || strRef.length;
    }
    *[Symbol.iterator]() {
        for (let i = 0; i < this.end; i++) {
            yield this.strRef[i];
        }
    }
    clone() {
        return new SQueue(this.strRef, this.start, this.end);
    }
    nextInStr() {
        const ch = this.strRef[this.start++];
        if (ch == '\\') {
            if (this.start < this.end)
                return this.strRef[this.start++];
            else
                throw new errors_1.InvalidEscapeSequence(this.strRef);
        }
        return ch;
    }
    hasNext() {
        return this.start < this.end;
    }
    next() {
        const ch = this.strRef[this.start++];
        return ch;
    }
    peek() {
        if (!this.hasNext())
            return '';
        return this.strRef[this.start];
    }
    searchUntil_char(trgStr) {
        const startingIndex = this.start;
        while (this.hasNext()) {
            const char = this.next();
            if (char == trgStr)
                return new SQueue(this.strRef, startingIndex, this.start - 1);
        }
        throw new errors_1.StrTargetError("Closing char not found in string:", this.strRef, startingIndex);
    }
    serchUntil_closingBracket() {
        return this.searchPair('(', ')', 1);
    }
    serchUntil_closingBracketSquare() {
        return this.searchPair('[', ']', 1);
    }
    searchUntil_endOfString() {
        const startingIndex = this.start;
        while (this.hasNext()) {
            const char = this.nextInStr();
            if (char == '\'')
                return new SQueue(this.strRef, startingIndex, this.start - 1);
        }
        throw new errors_1.StrTargetError("Closing char not found in string:", this.strRef, startingIndex);
    }
    peakAsString() {
        return this.strRef.slice(this.start, this.end);
    }
    shiftWhitespace() {
        while (this.strRef[this.start] === ' ' || this.strRef[this.start] === '\t')
            this.start++;
    }
    pushPairStart() {
        this.errPairNotFount.push(this.start);
    }
    popPairEnd() {
        if (this.errPairNotFount.length === 0)
            throw new Error("Internal err");
        this.errPairNotFount.pop();
    }
    throwLastErr(title) {
        if (this.errPairNotFount.length === 0)
            throw new Error("Internal err");
        throw new errors_1.StrTargetError(title || "Closing char not found in string:", this.strRef, this.errPairNotFount.pop());
    }
    throwFullStrErr(err, shift = 0) {
        throw new errors_1.StrTargetError(err, this.strRef, this.start + shift);
    }
    consumeToString() {
        return this.strRef.slice(this.start, this.end);
    }
    toString() {
        return this.strRef.slice();
    }
    searchPair(incChar, recChar, depth) {
        const startingIndex = this.start;
        while (this.hasNext()) {
            const char = this.next();
            if (char === '\'') {
                this.searchUntil_endOfString();
            }
            else if (char === incChar) {
                depth++;
            }
            else if (char === recChar && --depth <= 0) {
                return new SQueue(this.strRef, startingIndex, this.start);
            }
        }
        throw new errors_1.StrTargetError("Closing char not found in string:", this.strRef, startingIndex);
    }
}
exports.default = SQueue;
//# sourceMappingURL=sQueue.js.map

