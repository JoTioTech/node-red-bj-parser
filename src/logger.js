"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugLogger = exports.DEBUG_TYPE = void 0;
const bin_1 = require("./bin");
const binIter_1 = require("./binIter");
const enums_1 = require("./enums");
const DEBUG_TYPET_TR_MAP = Object.freeze({
    DEFAULT: {
        head: 'LOG',
        prior: 1,
    },
    INIT: {
        head: 'INIT',
        prior: 10,
    },
    FULL_IN_RUN: {
        head: 'PLD',
        prior: 10,
    },
    RULE_IO: {
        head: 'NEXT',
        prior: 10,
    },
    NEW_IN: {
        head: "NEW",
        prior: 10,
    },
    SET_VAR_VAL_SET: {
        head: "VAR",
        prior: 10,
    },
    SET_VAR_VAL_SUB: {
        head: "VAR",
        prior: 10,
    },
    SET_VAR_OTHER: {
        head: "VAR",
        prior: 10,
    },
    SET_ATRIBUTE: {
        head: "SET_ATR",
        prior: 10,
    },
    CREATE_ATRIBUTE: {
        head: "CR_ATR",
        prior: 10,
    },
    JSON_CHANGE: {
        head: "JSON",
        prior: 10,
    },
    SET_SELECTOR_CHECK: {
        head: "SLCT_A",
        prior: 10,
    },
    SUB_SELECTOR_CHECK: {
        head: "SLCT_B",
        prior: 10,
    },
    SUB_REPETITION: {
        head: "REP_B",
        prior: 10,
    },
    WARN: {
        head: "WARN",
        ignoreLenRestriction: true,
        prior: 20,
    },
    ERR: {
        head: "ERR",
        ignoreLenRestriction: true,
        prior: 30
    }
});
var DEBUG_TYPE;
(function (DEBUG_TYPE) {
    DEBUG_TYPE["DEFAULT"] = "DEFAULT";
    DEBUG_TYPE["INIT"] = "INIT";
    DEBUG_TYPE["FULL_IN_RUN"] = "FULL_IN_RUN";
    DEBUG_TYPE["RULE_IO"] = "RULE_IO";
    DEBUG_TYPE["NEW_IN"] = "NEW_IN";
    DEBUG_TYPE["SET_VAR_VAL_SET"] = "SET_VAR_VAL_SET";
    DEBUG_TYPE["SET_VAR_VAL_SUB"] = "SET_VAR_VAL_SUB";
    DEBUG_TYPE["SET_VAR_OTHER"] = "SET_VAR_OTHER";
    DEBUG_TYPE["SET_ATRIBUTE"] = "SET_ATRIBUTE";
    DEBUG_TYPE["CREATE_ATRIBUTE"] = "CREATE_ATRIBUTE";
    DEBUG_TYPE["JSON_CHANGE"] = "JSON_CHANGE";
    DEBUG_TYPE["SET_SELECTOR_CHECK"] = "SET_SELECTOR_CHECK";
    DEBUG_TYPE["SUB_SELECTOR_CHECK"] = "SUB_SELECTOR_CHECK";
    DEBUG_TYPE["SUB_REPETITION"] = "SUB_REPETITION";
    DEBUG_TYPE["WARN"] = "WARN";
    DEBUG_TYPE["ERR"] = "ERR";
})(DEBUG_TYPE = exports.DEBUG_TYPE || (exports.DEBUG_TYPE = {}));
class DebugLogger {
    constructor(options) {
        this.LogList = [];
        this.DefaultHeader = DEBUG_TYPE.DEFAULT;
        this.SuppressedHeadersMap = Array.isArray(options === null || options === void 0 ? void 0 : options.suppressHeader) ? options.suppressHeader.reduce((acc, val) => {
            acc[val] = true;
            return acc;
        }, {}) : {};
        this.maxStrLength = options === null || options === void 0 ? void 0 : options.maxStrLength;
        this.logBinAsHex = (options === null || options === void 0 ? void 0 : options.binAsHex) ? options.binAsHex : false;
        this.subParsingPrefix = 0;
        this.directToConsole = options.directToConsole;
    }
    isClean() {
        return this.errCounter === 0 && this.warnCounter === 0;
    }
    getLogs() {
        return this.LogList.map(val => val.str);
    }
    log(...args) {
        this.logInner(this.DefaultHeader, this.logBinAsHex, args);
    }
    logAs(type, ...args) {
        this.logInner(type, this.logBinAsHex, args);
    }
    logTypeEnabled(type) {
        return !(type in this.SuppressedHeadersMap);
    }
    resetState() {
        this.LogList = [];
        this.errCounter = 0;
        this.warnCounter = 0;
        this.subParsingPrefix = 0;
    }
    subParsPref_inc() {
        this.subParsingPrefix++;
    }
    subParsPref_dec() {
        this.subParsingPrefix--;
        if (this.subParsingPrefix < 0)
            this.subParsingPrefix = 0;
    }
    logInner(type, toHex, args) {
        if (!this.logTypeEnabled(type))
            return;
        const typeVal = DEBUG_TYPET_TR_MAP[type];
        const maxLen = typeVal.ignoreLenRestriction ? 1000 : this.maxStrLength;
        const head = "-" + typeVal.head + "-\t";
        const headLen = head.length - 1;
        const printableArgs = args.map((val, valI) => {
            let ret = (valI === 0) ? head : '';
            if ((0, binIter_1.isBinIter)(val)) {
                const iter = val.genRangeIter();
                ret += toHex ? (0, bin_1.consumeIterToPrint_hex)(iter, maxLen) : (0, bin_1.consumeIterToPrint_bin)(iter, maxLen);
            }
            else if (Array.isArray(val) && val.length > 0 && val[0].name !== undefined && val[0].type !== undefined) {
                let isArr = false;
                for (let i = 0; i < val.length; i++) {
                    if (isArr)
                        ret += '[' + val[i].name + ']';
                    else
                        ret += '/' + val[i].name;
                    isArr = val[i].type === enums_1.JSON_PATH_TYPE.ARR;
                }
            }
            else if (typeof val === "object")
                ret += JSON.stringify(val, null, 2);
            else if (val === undefined || val === null)
                return "";
            else
                ret += val.toString();
            return ret;
        });
        const lines = printableArgs
            .join("\t")
            .split('\n')
            .map((subVal, subValI) => (subValI === 0 ? "" : "\n") + " |".repeat(this.subParsingPrefix) + (subValI === 0 ? "" : " ".repeat(headLen) + '\t') + subVal)
            .join(" ");
        if (typeVal.prior > 15 && typeVal.prior <= 25)
            this.warnCounter++;
        else if (typeVal.prior > 25)
            this.errCounter++;
        ;
        this.LogList.push({
            type,
            str: lines,
        });
        if (this.directToConsole)
            console.log(lines);
    }
}
exports.DebugLogger = DebugLogger;
;
//# sourceMappingURL=logger.js.map

