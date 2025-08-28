"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpEvaluator = exports.STD_EXE_VAR_MAP = void 0;
const enums_1 = require("./enums");
const sQueue_1 = __importDefault(require("./sQueue"));
const exeFun_1 = require("./exeFun");
const bin_1 = require("./bin");
const EXE_FUN_LIST = Object.keys(exeFun_1.EXP_FUNCTION_ENUM).map(key => exeFun_1.EXP_FUNCTION_ENUM[key]);
exports.STD_EXE_VAR_MAP = {
    true: {
        val: true,
        type: enums_1.ExeType.BOLL
    },
    false: {
        val: false,
        type: enums_1.ExeType.BOLL
    },
    nan: {
        val: NaN,
        type: enums_1.ExeType.INT
    },
    null: {
        val: null,
        type: enums_1.ExeType.ANY
    },
		custom1: {
				val: -1,
				type: enums_1.ExeType.INT
		},
		custom2: {
				val: -1,
				type: enums_1.ExeType.INT
		},
		custom3: {
				val: -1,
				type: enums_1.ExeType.INT
		},
};
class ExpEvaluator {
    constructor(varList) {
        this.varList = (varList) ? varList : JSON.parse(JSON.stringify(exports.STD_EXE_VAR_MAP));
    }
    setVar(name, val, type) {
        this.varList[name] = {
            val,
            type
        };
        return this;
    }
    getVar(name) {
        return this.varList[name].val;
    }
    rmVar(name) {
        if (this.varList[name])
            delete this.varList[name];
        return this;
    }
    execStr(str, type, endOfInputChar) {
        return this.exec(new sQueue_1.default(str), type, endOfInputChar);
    }
    exec(str, type = enums_1.ExeType.ANY, endOfInputChar) {
        const ret = this.execExp(str, (endOfInputChar === undefined) ? [] : [endOfInputChar]);
        if (ret[0] !== type && type !== enums_1.ExeType.ANY)
            throw Error(`Not a valid type (is ${enums_1.ExeTypeReverse[ret[0]]})`);
        return ret[1];
    }
    insertIntoTree(root, newItem) {
        if (!root)
            return newItem;
        if (root.priority <= newItem.priority) {
            newItem.subL = root;
            return newItem;
        }
        else {
            root.subR = this.insertIntoTree(root.subR, newItem);
            return root;
        }
    }
    getRightMost(root) {
        if (!root)
            return null;
        if (!root.subR) {
            return root;
        }
        return this.getRightMost(root.subR);
    }
    execExp(str, endOfInputChar = []) {
        let root;
        while (str.hasNext()) {
            str.shiftWhitespace();
            const char = str.next();
            if (endOfInputChar.includes(char)) {
                return this.evalTree(root);
            }
            else if (char === '@') {
                const resVal = this.evalFun(str);
                root = this.insertIntoTree(root, {
                    priority: 0,
                    type: resVal[0],
                    value: resVal[1]
                });
            }
            else if (char === '$') {
                const resVal = this.evalVar(str);
                root = this.insertIntoTree(root, {
                    priority: 0,
                    type: resVal[0],
                    value: resVal[1]
                });
            }
            else if (char === '+' || char === '-') {
                root = this.insertIntoTree(root, {
                    priority: 2,
                    type: null,
                    value: char
                });
            }
            else if (char === '*' || char === '/' || char === '%' || char === ':') {
                root = this.insertIntoTree(root, {
                    priority: 1,
                    type: null,
                    value: char
                });
            }
            else if (char === '(') {
                str.pushPairStart();
                const resVal = this.execExp(str, [')']);
                str.popPairEnd();
                root = this.insertIntoTree(root, {
                    priority: 0,
                    type: resVal[0],
                    value: resVal[1]
                });
            }
            else if (char === "=" || char == "<" || char == ">") {
                let hasTrailingEql = false;
                if (str.peek() === '=') {
                    str.next();
                    hasTrailingEql = true;
                }
                if (!hasTrailingEql && char === '=')
                    str.throwFullStrErr("Not a valid operator");
                root = this.insertIntoTree(root, {
                    priority: 3,
                    type: null,
                    value: char + (hasTrailingEql ? '=' : '')
                });
            }
            else if (char === "&") {
                let double = false;
                if (str.peek() === '&') {
                    str.next();
                    double = true;
                }
                if (!double)
                    throw str.throwFullStrErr("Not a valid operator", -1);
                root = this.insertIntoTree(root, {
                    priority: 4,
                    type: null,
                    value: "&&"
                });
            }
            else if (char === "|") {
                let double = false;
                if (str.peek() === '|') {
                    str.next();
                    double = true;
                }
                if (!double)
                    throw str.throwFullStrErr("Not a valid operator", -1);
                root = this.insertIntoTree(root, {
                    priority: 5,
                    type: null,
                    value: "||"
                });
            }
            else if (/\d/.test(char)) {
                let numRes;
                if (char === '0' && str.hasNext() && str.peek() === 'x') {
                    str.next();
                    let numStr = '';
                    while (str.hasNext()) {
                        if (/[\da-fA-F]/.test(str.peek())) {
                            numStr += str.next();
                        }
                        else
                            break;
                    }
                    numRes = parseInt(numStr, 16);
                }
                else {
                    let numStr = char;
                    let pointFound = false;
                    while (str.hasNext()) {
                        if (/\d/.test(str.peek())) {
                            numStr += str.next();
                        }
                        else if (str.peek() === '.') {
                            numStr += str.next();
                            if (!/\d/.test(str.peek()) || pointFound)
                                str.throwFullStrErr("Not a valid decimal number");
                        }
                        else
                            break;
                    }
                    numRes = parseFloat(numStr);
                }
                root = this.insertIntoTree(root, {
                    priority: 0,
                    type: enums_1.ExeType.INT,
                    value: numRes
                });
            }
            else if (char === "'") {
                const strQueue = str.searchUntil_endOfString();
                root = this.insertIntoTree(root, {
                    priority: 0,
                    type: enums_1.ExeType.STRING,
                    value: strQueue.consumeToString(),
                });
            }
            else
                str.throwFullStrErr(`Not a valid token: ${char}`);
        }
        if (endOfInputChar.length !== 0)
            str.throwLastErr();
        return this.evalTree(root);
    }
    evalTree(node) {
        if (!node)
            return [enums_1.ExeType.ANY, undefined];
        if (node.priority === 0) {
            if (node.subL || node.subR)
                throw new Error("Internal Err");
            return [node.type, node.value];
        }
        else {
            if (!node.subR)
                throw new Error("Not a valid operation tree");
            const rRes = this.evalTree(node.subR);
            if ((node.value === '-' || node.value === '+') && rRes[0] === enums_1.ExeType.INT) {
                const newVal = (node.value === '-' ? -1 : 1) * rRes[1];
                if (!node.subL)
                    return [enums_1.ExeType.INT, newVal];
                if (this.getRightMost(node.subL).type === null) {
                    return this.evalTree(this.insertIntoTree(node.subL, {
                        priority: 0,
                        type: enums_1.ExeType.INT,
                        value: newVal
                    }));
                }
            }
            if (!node.subL)
                throw new Error("Not a valid operation tree");
            const lRes = this.evalTree(node.subL);
            if (node.value === '+' || node.value === '-' || node.value === '*' || node.value === '/' || node.value === '%') {
								if(lRes[0] === enums_1.ExeType.STRING || rRes[0] === enums_1.ExeType.STRING){
									if (node.value === '+')
										return [enums_1.ExeType.STRING, lRes[1].toString() + rRes[1].toString()];
								}

                if (!(lRes[0] === enums_1.ExeType.INT && rRes[0] === enums_1.ExeType.INT))
                    throw new Error(`Not a valid data type for ${node.value} (must be INT is ${enums_1.ExeTypeReverse[lRes[0]]} and ${enums_1.ExeTypeReverse[rRes[0]]})`);
                if (node.value === '+')
                    return [enums_1.ExeType.INT, lRes[1] + rRes[1]];
                if (node.value === '-')
                    return [enums_1.ExeType.INT, lRes[1] - rRes[1]];
                if (node.value === '*')
                    return [enums_1.ExeType.INT, lRes[1] * rRes[1]];
                if (node.value === '/')
                    return [enums_1.ExeType.INT, lRes[1] / rRes[1]];
                if (node.value === '%')
                    return [enums_1.ExeType.INT, lRes[1] % Math.floor(rRes[1])];
            }
            else if (node.value === ':') {
                if (!(lRes[0] === enums_1.ExeType.BIN && rRes[0] === enums_1.ExeType.BIN))
                    throw new Error(`Not a valid data type for ${node.value} (must be BIN is ${enums_1.ExeTypeReverse[lRes[0]]} and ${enums_1.ExeTypeReverse[rRes[0]]})`);
                return [lRes[0], (0, bin_1.concatIterator)([lRes[1], rRes[1]])];
            }
            else if (node.value === '==' || node.value === '<' || node.value === '>' || node.value === '<=' || node.value === '>=') {
                if (lRes[0] === enums_1.ExeType.BIN || rRes[0] === enums_1.ExeType.BIN)
                    throw new Error(`Not a valid data type for ${node.value} (can't be BIN)`);
                if (node.value === '==')
                    return [enums_1.ExeType.BOLL, lRes[1] === rRes[1]];
                if (node.value === '<')
                    return [enums_1.ExeType.BOLL, lRes[1] < rRes[1]];
                if (node.value === '>')
                    return [enums_1.ExeType.BOLL, lRes[1] > rRes[1]];
                if (node.value === '<=')
                    return [enums_1.ExeType.BOLL, lRes[1] <= rRes[1]];
                if (node.value === '>=')
                    return [enums_1.ExeType.BOLL, lRes[1] >= rRes[1]];
            }
            else if (node.value === '&&' || node.value === '||') {
                if (!(lRes[0] === enums_1.ExeType.BOLL && rRes[0] === enums_1.ExeType.BOLL))
                    throw new Error(`Not a valid data type for ${node.value} (must be BIN is ${enums_1.ExeTypeReverse[lRes[0]]} and ${enums_1.ExeTypeReverse[rRes[0]]})`);
                if (node.value === '&&')
                    return [enums_1.ExeType.BOLL, lRes[1] && rRes[1]];
                if (node.value === '||')
                    return [enums_1.ExeType.BOLL, lRes[1] || rRes[1]];
            }
            else
                throw new Error(`Internal Err ${node.value}`);
        }
    }
    evalFun(str) {
        let fullName = '';
        str.pushPairStart();
        while (str.hasNext()) {
            const char = str.next();
            if (/[a-zA-Z0-9_]/.test(char)) {
                fullName += char;
                str.shiftWhitespace();
            }
            else if (char === '(') {
                const funMeta = EXE_FUN_LIST.find((val) => val.name === fullName);
                if (!funMeta)
                    str.throwFullStrErr(`Not a valid fun name ( ${fullName} ):`, -1 * fullName.length);
                const argList = [];
                for (let i = 0; i < funMeta.argsType.length; i++) {
                    str.pushPairStart();
                    const arg = this.execExp(str, [',', ')']);
                    if (funMeta.argsType[i] !== enums_1.ExeType.ANY && funMeta.argsType[i] !== arg[0])
                        str.throwLastErr(`Not a valid function argument type (must be ${funMeta.argsType[i]} is ${enums_1.ExeTypeReverse[arg[0]]})`);
                    str.popPairEnd();
                    argList.push(arg[1]);
                }
                str.popPairEnd();
                return [funMeta.retType, funMeta.fun(argList, this.varList)];
            }
            else
                str.throwFullStrErr("Not a valid function", -1);
        }
        str.throwLastErr();
    }
    evalVar(str) {
        let fullName = '';
        while (str.hasNext()) {
            const char = str.peek();
            if (/[a-zA-Z0-9]/.test(char)) {
                str.next();
                fullName += char;
            }
            else
                break;
        }

			// copy all global variables into the varList
			for (const [key, value] of Object.entries(global.parserVariables)) {
				// if (typeof value === 'number') {
				this.varList[key] = {
					val: value,
					type: enums_1.ExeType.INT
				};
				// }
			}

        const varMeta = this.varList[fullName];
        if (!varMeta)
            throw Error(`Not a valid var name (${fullName})\n   Available names: ${Object.keys(this.varList)}`);
        return [varMeta.type, varMeta.val];
    }
}
exports.ExpEvaluator = ExpEvaluator;
//# sourceMappingURL=evaluators.js.map

