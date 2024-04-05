"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEscapeSequence = exports.StrTargetError = exports.NotImplementedError = exports.ParsingError = exports.ExpEvaluatorError = exports.InputFromatError = void 0;
class InputFromatError extends Error {
    constructor(decsription, val, oldErr) {
        const msg = InputFromatError.generateMsg(decsription, val, oldErr);
        super(msg);
        this.name = "InputFromatError";
        this.decsription = decsription;
        this.val = val;
        this.oldErr = oldErr;
        this.fulMsg = msg;
    }
    static generateMsg(decsription, val, oldErr) {
        const outStr = `${(oldErr && oldErr.getMsg) ? oldErr.getMsg() : ''}\n  ${decsription}\n`;
        const valMap = Object.entries(val)
            .map(([key, value]) => `   --> ${key}: ${JSON.stringify(value)}\n`);
        const msg = outStr + valMap.join('') + '='.repeat(35) + '\n';
        return msg;
    }
    getMsg() {
        return this.fulMsg;
    }
}
exports.InputFromatError = InputFromatError;
class ExpEvaluatorError extends Error {
    constructor(fullExp, decsription) {
        super("Expresion evalution error:\n\tExp: " + fullExp + "\n\tErr: " + decsription);
    }
}
exports.ExpEvaluatorError = ExpEvaluatorError;
class ParsingError extends Error {
    constructor(ruleName, decsription) {
        super("Schema parsing error:\n\tRule Name: " + ruleName + "\n\tErr: " + decsription);
    }
}
exports.ParsingError = ParsingError;
class NotImplementedError extends Error {
    constructor() {
        super("Not implemented");
    }
}
exports.NotImplementedError = NotImplementedError;
class StrTargetError extends Error {
    constructor(title, str, start) {
        super(title + "\n\t" + str + "\n\t" + " ".repeat(start > 0 ? start - 1 : 0) + '^');
        this.title = title;
        this.str = str;
        this.start = start;
    }
}
exports.StrTargetError = StrTargetError;
class InvalidEscapeSequence extends Error {
    constructor(string) {
        super("Invalid Escape Sequence in string:\n\t" + string);
        this.string = string;
    }
}
exports.InvalidEscapeSequence = InvalidEscapeSequence;
//# sourceMappingURL=errors.js.map