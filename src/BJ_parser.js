"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bin_1 = require("./bin");
const binIter_1 = require("./binIter");
const enums_1 = require("./enums");
const errors_1 = require("./errors");
const evaluators_1 = require("./evaluators");
const loger_1 = require("./loger");
const sQueue_1 = __importDefault(require("./sQueue"));
class Parser {
    constructor(schema, logerOptions) {
        this.logerOptions = logerOptions;
        this.ExecutedRuleCount = 0;
        this.Schema = schema;
        this.Loger = new loger_1.DebugLogger(logerOptions);
        this.Loger.logAs(loger_1.DEBUG_TYPE.INIT, "schema meta", this.Schema.name, this.Schema.version, this.Schema.schemaVersion);
        this.Loger.logAs(loger_1.DEBUG_TYPE.INIT, "schema", this.Schema);
        this.Loger.logAs(loger_1.DEBUG_TYPE.INIT, "log", logerOptions);
    }
    runHexAndWrap(fullRootDataHex) {
        let fullOutputJson;
        try {
            fullOutputJson = this.runHex(fullRootDataHex);
        }
        catch (err) {
            this.Loger.logAs(loger_1.DEBUG_TYPE.ERR, err.message);
        }
        return {
            outJson: fullOutputJson,
            logs: this.Loger.getLogs(),
            parsingError: !this.Loger.isClean(),
        };
    }
    runHex(fullRootDataHex) {
        this.Loger.resetState();
        const fullOutputJson = {};
        const fullRootData = (0, bin_1.binFromHex)(fullRootDataHex);
        this.Loger.logAs(loger_1.DEBUG_TYPE.FULL_IN_RUN, "Full pld", fullRootData.genIter());
        this.ExecutedRuleCount = 0;
        this.Loger.subParsPref_inc();
        this.Loger.logAs(loger_1.DEBUG_TYPE.RULE_IO, 'root', `(IN - 00)`, fullRootData.genIter());
        const restPld = this.executeRule(fullOutputJson, 'root', fullRootData.genIter(), []);
        if (restPld.getSize() !== 0) {
            this.Loger.logAs(loger_1.DEBUG_TYPE.WARN, 'Unmanaged end of msg:\nIN:', fullRootData.genIter(), '\nOUT:', restPld);
        }
        return fullOutputJson;
    }
    executeRule(fullOutputJson, ruleName, rootPld, pathModifier) {
        const ruleIterCount = (this.ExecutedRuleCount).toString().padStart(2, '0');
        const rSchema = this.Schema.rule[ruleName];
        const executor = new evaluators_1.ExpEvaluator()
            .setVar("in", rootPld, enums_1.ExeType.BIN)
            .setVar("curentPath", pathModifier, enums_1.ExeType.PATH);
        this.Loger.logAs(loger_1.DEBUG_TYPE.SET_VAR_OTHER, 'in =', rootPld);
        rSchema.set.forEach((set, setId) => {
            executor
                .setVar("outJson", fullOutputJson, enums_1.ExeType.ANY);
            const targetPath = this.concatPath(pathModifier, set.target, executor);
            if (set.valMask) {
                const valInt = (0, bin_1.consumeIterToInt)((0, bin_1.genMaskIterator)(rootPld, set.valMask, executor));
                executor.setVar("val", valInt, enums_1.ExeType.INT);
                this.Loger.logAs(loger_1.DEBUG_TYPE.SET_VAR_VAL_SET, 'val =', valInt, `"${set.valMask}"`);
            }
            else
                executor.rmVar('val');
            for (let typeId = 0; typeId < set.type.length; typeId++) {
                const type = set.type[typeId];
                const logerMsg = `${setId}/${typeId}:`;
                try {
                    if ((typeof type.selector === 'boolean' && !type.selector) || (typeof type.selector !== 'boolean' && !executor.execStr(type.selector, enums_1.ExeType.BOLL))) {
                        this.Loger.logAs(loger_1.DEBUG_TYPE.SET_SELECTOR_CHECK, logerMsg, false, type.selector);
                        continue;
                    }
                    this.Loger.logAs(loger_1.DEBUG_TYPE.SET_SELECTOR_CHECK, logerMsg, true, type.selector);
                    const val = executor.execStr(type.val);
                    this.accesAtributeAtr(type.action, val, fullOutputJson, targetPath, executor);
                }
                catch (err) {
                    err.message = "In set " + err.message + "\n" + err.message;
                    throw err;
                }
                if (set.single)
                    return;
            }
        });
        let subGlobRepetitionCount = 0;
        const repearRuleMask = new Array(rSchema.subParsing.length).fill(0);
        for (let subStruckI = 0; subStruckI < rSchema.subParsing.length; subStruckI++) {
            const sub = rSchema.subParsing[subStruckI];
            this.Loger.logAs(loger_1.DEBUG_TYPE.SUB_REPETITION, subStruckI, `${subGlobRepetitionCount},${repearRuleMask[subStruckI]}`, `(${sub.repeatMaxGlob},${sub.repeatMax})`);
            if (sub.repeatMaxGlob >= 0 && sub.repeatMaxGlob <= subGlobRepetitionCount)
                continue;
            if (sub.repeatMax >= 0 && sub.repeatMax <= repearRuleMask[subStruckI])
                continue;
            if (sub.valMask) {
                if (sub.valMask === true)
                    this.Loger.logAs(loger_1.DEBUG_TYPE.SET_VAR_VAL_SUB, 'val =', executor.getVar("val"), `"INHERIT"`);
                else {
                    const valInt = (0, bin_1.consumeIterToInt)((0, bin_1.genMaskIterator)(rootPld, sub.valMask, executor));
                    this.Loger.logAs(loger_1.DEBUG_TYPE.SET_VAR_VAL_SUB, 'val =', valInt, `"${sub.valMask}"`);
                    executor.setVar("val", valInt, enums_1.ExeType.INT);
                }
            }
            else
                executor.rmVar('val');
            executor
                .setVar("i", subGlobRepetitionCount, enums_1.ExeType.INT);
            this.Loger.logAs(loger_1.DEBUG_TYPE.SET_VAR_OTHER, 'i =', subGlobRepetitionCount);
            if ((typeof sub.selector === 'boolean' && !sub.selector) || (typeof sub.selector !== 'boolean' && !executor.execStr(sub.selector, enums_1.ExeType.BOLL))) {
                this.Loger.logAs(loger_1.DEBUG_TYPE.SUB_SELECTOR_CHECK, subStruckI, false, sub.selector);
                continue;
            }
            this.Loger.logAs(loger_1.DEBUG_TYPE.SUB_SELECTOR_CHECK, subStruckI, true, sub.selector);
            const chrootPath = this.concatPath(pathModifier, sub.chroot, executor);
            const subRootPld = (0, bin_1.genMaskIterator)(rootPld, sub.subMask, executor);
            this.Loger.subParsPref_inc();
            this.Loger.logAs(loger_1.DEBUG_TYPE.RULE_IO, sub.targetRule, `(IN - ${(++this.ExecutedRuleCount).toString().padStart(2, '0')})`, subRootPld, sub.subMask);
            const retPld = this.executeRule(fullOutputJson, sub.targetRule, subRootPld, chrootPath);
            if (sub.newIn) {
                executor.setVar("ret", retPld, enums_1.ExeType.BIN);
                this.Loger.logAs(loger_1.DEBUG_TYPE.SET_VAR_OTHER, 'ret =', retPld);
                rootPld = executor.execStr(sub.newIn, enums_1.ExeType.BIN);
                this.Loger.logAs(loger_1.DEBUG_TYPE.NEW_IN, sub.newIn, rootPld);
            }
            else {
                rootPld = retPld;
                this.Loger.logAs(loger_1.DEBUG_TYPE.NEW_IN, rootPld);
            }
            repearRuleMask[subStruckI]++;
            subGlobRepetitionCount++;
            subStruckI = -1;
            if (sub.break) {
                this.Loger.logAs(loger_1.DEBUG_TYPE.SUB_REPETITION, subStruckI, "Break");
                break;
            }
            executor
                .setVar("in", rootPld, enums_1.ExeType.BIN);
            this.Loger.logAs(loger_1.DEBUG_TYPE.SET_VAR_OTHER, 'in =', rootPld);
        }
        if (rSchema.valMask) {
            const valInt = (0, bin_1.consumeIterToInt)((0, bin_1.genMaskIterator)(rootPld, rSchema.valMask, executor));
            executor.setVar("val", valInt, enums_1.ExeType.INT);
            this.Loger.logAs(loger_1.DEBUG_TYPE.SET_VAR_VAL_SET, 'val =', valInt, `"${rSchema.valMask}"`);
        }
        else
            executor.rmVar('val');
        const ret = (rSchema) ? (0, bin_1.genMaskIterator)(rootPld, rSchema.next, executor) : rootPld;
        this.Loger.logAs(loger_1.DEBUG_TYPE.RULE_IO, ruleName, `(OUT - ${ruleIterCount})`, ret, rSchema.next);
        this.Loger.subParsPref_dec();
        return ret;
    }
    accesAtributeAtr(setAction, opVal, josnData, pathArr, executor) {
        let curentObject = josnData;
        for (let pathArrIndex = 0; pathArrIndex < pathArr.length; pathArrIndex++) {
            const block = pathArr[pathArrIndex].name;
            if (pathArr.length - 1 === pathArrIndex) {
                const printableOpVal = (0, binIter_1.isBinIter)(opVal) ? (0, bin_1.consumeIiterToArrString)(opVal.genRangeIter()) : opVal;
                if (setAction === enums_1.SET_ACTION_ENUM.SET_UPDATE) {
                    this.Loger.logAs(loger_1.DEBUG_TYPE.SET_ATRIBUTE, 'ACTION:', 'SET\nPATH:', pathArr, '\nNAME:', block, '\nVAL:', opVal);
                    curentObject[block] = printableOpVal;
                }
                else if (setAction === enums_1.SET_ACTION_ENUM.INCREMENT) {
                    this.Loger.logAs(loger_1.DEBUG_TYPE.SET_ATRIBUTE, 'ACTION', 'ICREMENT\nPATH:', pathArr, '\nNAME:', block, '\nVAL:', opVal);
                    if (curentObject[block] === undefined)
                        curentObject[block] = 0;
                    if (typeof curentObject[block] !== 'number')
                        throw new errors_1.InputFromatError('Path has invalid type, expected: number/string', { str: curentObject, fullPath: pathArrIndex });
                    curentObject[block] += printableOpVal;
                }
                else if (setAction === enums_1.SET_ACTION_ENUM.APPEND) {
                    this.Loger.logAs(loger_1.DEBUG_TYPE.SET_ATRIBUTE, 'ACTION:', 'APPEND\nPATH:', pathArr, '\nNAME:', block, '\nVAL:', opVal);
                    if (curentObject[block] === undefined)
                        curentObject[block] = [];
                    if (!Array.isArray(curentObject[block])) {
                        throw new errors_1.InputFromatError('Path has invalid type, expected: array', { str: curentObject, fullPath: pathArrIndex });
                    }
                    curentObject[block].push(printableOpVal);
                }
                this.Loger.logAs(loger_1.DEBUG_TYPE.JSON_CHANGE, josnData);
            }
            if (curentObject[block] === undefined) {
                if (this.Loger.logTypeEnabled(loger_1.DEBUG_TYPE.CREATE_ATRIBUTE))
                    this.Loger.logAs(loger_1.DEBUG_TYPE.CREATE_ATRIBUTE, 'TYPE', pathArr[pathArrIndex].type === enums_1.JSON_PATH_TYPE.ARR ? "[]" : "{}", '\nPATH:', pathArr.slice(0, pathArrIndex + 1));
                curentObject[block] = pathArr[pathArrIndex].type === enums_1.JSON_PATH_TYPE.ARR ? [] : {};
                this.Loger.logAs(loger_1.DEBUG_TYPE.JSON_CHANGE, josnData);
            }
            curentObject = curentObject[block];
        }
    }
    concatPath(oldErr, newPath = '', executor) {
        const fullPath = oldErr.slice();
        const splitPath = newPath.split('/').filter(n => n);
        splitPath.forEach(val => {
            if (val === '..') {
                while (true) {
                    if (fullPath.length === 0) {
                        throw new errors_1.InputFromatError('Invalid path concat', { curentPath: oldErr, newPath: splitPath });
                    }
                    fullPath.pop();
                    if (fullPath[fullPath.length - 1].type !== enums_1.JSON_PATH_TYPE.ARR)
                        break;
                }
            }
            else if (val.includes('[')) {
                const blockArr = new sQueue_1.default(val);
                const arrName = blockArr.seachUntil_char('[').consumeToString();
                fullPath.push({
                    name: arrName,
                    type: enums_1.JSON_PATH_TYPE.ARR
                });
                while (true) {
                    const indexVal = executor.exec(blockArr, enums_1.ExeType.INT, ']');
                    if (!blockArr.hasNext()) {
                        fullPath.push({
                            name: indexVal,
                            type: enums_1.JSON_PATH_TYPE.OBJECT
                        });
                        break;
                    }
                    if (blockArr.next() !== '[')
                        throw new errors_1.InputFromatError('Invalid array indefinx', { segment: val, newPath: splitPath });
                    fullPath.push({
                        name: indexVal,
                        type: enums_1.JSON_PATH_TYPE.ARR
                    });
                }
            }
            else if (val !== '.') {
                fullPath.push({
                    name: val,
                    type: enums_1.JSON_PATH_TYPE.OBJECT,
                });
            }
        });
        return fullPath;
    }
}
exports.default = Parser;
//# sourceMappingURL=BJ_parser.js.map
