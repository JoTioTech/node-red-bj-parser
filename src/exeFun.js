"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXP_FUNCTION_ENUM = void 0;
const bin_1 = require("./bin");
const enums_1 = require("./enums");
const evaluators_1 = require("./evaluators");
exports.EXP_FUNCTION_ENUM = Object.freeze({
    eql: {
        name: "eql",
        argsType: [enums_1.ExeType.ANY, enums_1.ExeType.ANY],
        retType: enums_1.ExeType.BOLL,
        fun: (argArr, varMap) => {
            return argArr[0] === argArr[1];
        }
    },
    more: {
        name: "more",
        argsType: [enums_1.ExeType.ANY, enums_1.ExeType.ANY],
        retType: enums_1.ExeType.BOLL,
        fun: (argArr, varMap) => {
            return argArr[0] > argArr[1];
        }
    },
    less: {
        name: "less",
        argsType: [enums_1.ExeType.ANY, enums_1.ExeType.ANY],
        retType: enums_1.ExeType.BOLL,
        fun: (argArr, varMap) => {
            return argArr[0] < argArr[1];
        }
    },
    toBool: {
        name: "toBool",
        argsType: [enums_1.ExeType.ANY],
        retType: enums_1.ExeType.BOLL,
        fun: (argArr, varMap) => {
            return (argArr[0]) ? true : false;
        }
    },
    toInt16: {
        name: "toInt16",
        argsType: [enums_1.ExeType.INT],
        retType: enums_1.ExeType.INT,
        fun: (argArr, varMap) => {
            return argArr[0] < 0x8000 ? argArr[0] : argArr[0] - 0x10000;
        }
    },
    toUtf8: {
        name: "binToString",
        argsType: [enums_1.ExeType.BIN],
        retType: enums_1.ExeType.STRING,
        fun: (argArr, varMap) => {
            return (0, bin_1.consumeIiterToUTF8)(argArr[0]);
        }
    },
    mask: {
        name: "mask",
        argsType: [enums_1.ExeType.STRING, enums_1.ExeType.BIN],
        retType: enums_1.ExeType.INT,
        fun: (argArr, varMap) => {
            const outMask = (0, bin_1.genMaskIterator)(argArr[1], argArr[0], new evaluators_1.ExpEvaluator(varMap));
            const outInt = (0, bin_1.consumeIterToInt)(outMask);
            return outInt;
        }
    },
    maskB: {
        name: "maskB",
        argsType: [enums_1.ExeType.STRING, enums_1.ExeType.BIN],
        retType: enums_1.ExeType.BIN,
        fun: (argArr, varMap) => {
            const outMask = (0, bin_1.genMaskIterator)(argArr[1], argArr[0], new evaluators_1.ExpEvaluator(varMap));
            return outMask;
        }
    },
    parsUTC_5b: {
        name: "parsUTC_5b",
        argsType: [enums_1.ExeType.INT],
        retType: enums_1.ExeType.STRING,
        fun: (argArr, varMap) => {
            return new Date(argArr[0]).toUTCString();
        }
    }
});
//# sourceMappingURL=exeFun.js.map