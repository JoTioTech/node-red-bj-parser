"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEscapeSequence = exports.StrTargetError = exports.NotImplementedError = exports.ParsingError = exports.ExpEvaluatorError = exports.InputFormatError = void 0;
class InputFormatError extends Error {
    constructor(description, val, oldErr) {
        const msg = InputFormatError.generateMsg(description, val, oldErr);
        super(msg);
        this.name = "InputFormatError";
        this.description = description;
        this.val = val;
        this.oldErr = oldErr;
        this.fulMsg = msg;
    }
    static generateMsg(description, val, oldErr) {
        const outStr = `${(oldErr && oldErr.getMsg) ? oldErr.getMsg() : ''}\n  ${description}\n`;
        const valMap = Object.entries(val)
            .map(([key, value]) => `   --> ${key}: ${JSON.stringify(value)}\n`);
        const msg = outStr + valMap.join('') + '='.repeat(35) + '\n';
        return msg;
    }
    getMsg() {
        return this.fulMsg;
    }
}
exports.InputFormatError = InputFormatError;
class ExpEvaluatorError extends Error {
    constructor(fullExp, description) {
        super("Expression evaluation error:\n\tExp: " + fullExp + "\n\tErr: " + description);
    }
}
exports.ExpEvaluatorError = ExpEvaluatorError;
class ParsingError extends Error {
    constructor(ruleName, description) {
        super("Schema parsing error:\n\tRule Name: " + ruleName + "\n\tErr: " + description);
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

