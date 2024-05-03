'use strict';
const __importDefault = (this && this.__importDefault) || function (module_) {
	return (module_ && module_.__esModule) ? module_ : {default: module_};
};

Object.defineProperty(exports, '__esModule', {value: true});
const bin_1 = require('./bin');
const binIter_1 = require('./binIter');
const enums_1 = require('./enums');
const errors_1 = require('./errors');
const evaluators_1 = require('./evaluators');
const logger_1 = require('./logger');
const sQueue_1 = __importDefault(require('./sQueue'));

class Parser {
	constructor(schema, loggerOptions) {
		this.loggerOptions = loggerOptions;
		this.ExecutedRuleCount = 0;
		this.Schema = schema;
		this.Logger = new logger_1.DebugLogger(loggerOptions);
		this.Logger.logAs(logger_1.DEBUG_TYPE.INIT, 'schema meta', this.Schema.name, this.Schema.version, this.Schema.schemaVersion);
		this.Logger.logAs(logger_1.DEBUG_TYPE.INIT, 'schema', this.Schema);
		this.Logger.logAs(logger_1.DEBUG_TYPE.INIT, 'log', loggerOptions);
	}

	runHexAndWrap(fullRootDataHex) {
		let fullOutputJson;
		try {
			fullOutputJson = this.runHex(fullRootDataHex);
		} catch (error) {
			this.Logger.logAs(logger_1.DEBUG_TYPE.ERR, error.message);
		}

		return {
			outJson: fullOutputJson,
			logs: this.Logger.getLogs(),
			parsingError: !this.Logger.isClean(),
		};
	}

	runHex(fullRootDataHex) {
		this.Logger.resetState();
		const fullOutputJson = {};
		const fullRootData = (0, bin_1.binFromHex)(fullRootDataHex);
		this.Logger.logAs(logger_1.DEBUG_TYPE.FULL_IN_RUN, 'Full pld', fullRootData.genIter());
		this.ExecutedRuleCount = 0;
		this.Logger.subParsPref_inc();
		this.Logger.logAs(logger_1.DEBUG_TYPE.RULE_IO, 'root', '(IN - 00)', fullRootData.genIter());
		const restPld = this.executeRule(fullOutputJson, 'root', fullRootData.genIter(), []);
		if (restPld.getSize() !== 0) {
			this.Logger.logAs(logger_1.DEBUG_TYPE.WARN, 'Unmanaged end of msg:\nIN:', fullRootData.genIter(), '\nOUT:', restPld);
		}

		return fullOutputJson;
	}

	// TODO: there should be built in recursion protection
	executeRule(fullOutputJson, ruleName, rootPld, pathModifier) {
		const ruleIterCount = (this.ExecutedRuleCount).toString().padStart(2, '0');
		const rSchema = this.Schema.rule[ruleName];
		const executor = new evaluators_1.ExpEvaluator()
			.setVar('in', rootPld, enums_1.ExeType.BIN)
			.setVar('currentPath', pathModifier, enums_1.ExeType.PATH);
		this.Logger.logAs(logger_1.DEBUG_TYPE.SET_VAR_OTHER, 'in =', rootPld);
		rSchema.set.forEach((set, setId) => {
			executor
				.setVar('outJson', fullOutputJson, enums_1.ExeType.ANY);
			const targetPath = this.concatPath(pathModifier, set.target, executor);
			if (set.valMask) {
				const valueInt = (0, bin_1.consumeIterToInt)((0, bin_1.genMaskIterator)(rootPld, set.valMask, executor));
				executor.setVar('val', valueInt, enums_1.ExeType.INT);
				this.Logger.logAs(logger_1.DEBUG_TYPE.SET_VAR_VAL_SET, 'val =', valueInt, `"${set.valMask}"`);
			} else {
				executor.rmVar('val');
			}

			for (let typeId = 0; typeId < set.type.length; typeId++) {
				const type = set.type[typeId];
				const loggerMessage = `${setId}/${typeId}:`;
				try {
					if ((typeof type.selector === 'boolean' && !type.selector) || (typeof type.selector !== 'boolean' && !executor.execStr(type.selector, enums_1.ExeType.BOLL))) {
						this.Logger.logAs(logger_1.DEBUG_TYPE.SET_SELECTOR_CHECK, loggerMessage, false, type.selector);
						continue;
					}

					this.Logger.logAs(logger_1.DEBUG_TYPE.SET_SELECTOR_CHECK, loggerMessage, true, type.selector);
					const value = executor.execStr(type.val);
					this.accessAtributeAtr(type.action, value, fullOutputJson, targetPath, executor);
				} catch (error) {
					error.message = 'In set ' + error.message + '\n' + error.message;
					throw error;
				}

				if (set.single) {
					return;
				}
			}
		});
		let subGlobRepetitionCount = 0;
		const repeatRuleMask = Array.from({length: rSchema.subParsing.length}).fill(0);
		for (let subStruckI = 0; subStruckI < rSchema.subParsing.length; subStruckI++) {
			const sub = rSchema.subParsing[subStruckI];
			this.Logger.logAs(logger_1.DEBUG_TYPE.SUB_REPETITION, subStruckI, `${subGlobRepetitionCount},${repeatRuleMask[subStruckI]}`, `(${sub.repeatMaxGlob},${sub.repeatMax})`);
			if (sub.repeatMaxGlob >= 0 && sub.repeatMaxGlob <= subGlobRepetitionCount) {
				continue;
			}

			if (sub.repeatMax >= 0 && sub.repeatMax <= repeatRuleMask[subStruckI]) {
				continue;
			}

			if (sub.valMask) {
				if (sub.valMask === true) {
					this.Logger.logAs(logger_1.DEBUG_TYPE.SET_VAR_VAL_SUB, 'val =', executor.getVar('val'), '"INHERIT"');
				} else {
					const valueInt = (0, bin_1.consumeIterToInt)((0, bin_1.genMaskIterator)(rootPld, sub.valMask, executor));
					this.Logger.logAs(logger_1.DEBUG_TYPE.SET_VAR_VAL_SUB, 'val =', valueInt, `"${sub.valMask}"`);
					executor.setVar('val', valueInt, enums_1.ExeType.INT);
				}
			} else {
				executor.rmVar('val');
			}

			executor
				.setVar('i', subGlobRepetitionCount, enums_1.ExeType.INT);
			this.Logger.logAs(logger_1.DEBUG_TYPE.SET_VAR_OTHER, 'i =', subGlobRepetitionCount);
			if ((typeof sub.selector === 'boolean' && !sub.selector) || (typeof sub.selector !== 'boolean' && !executor.execStr(sub.selector, enums_1.ExeType.BOLL))) {
				this.Logger.logAs(logger_1.DEBUG_TYPE.SUB_SELECTOR_CHECK, subStruckI, false, sub.selector);
				continue;
			}

			this.Logger.logAs(logger_1.DEBUG_TYPE.SUB_SELECTOR_CHECK, subStruckI, true, sub.selector);
			const chrootPath = this.concatPath(pathModifier, sub.chroot, executor);
			const subRootPld = (0, bin_1.genMaskIterator)(rootPld, sub.subMask, executor);
			this.Logger.subParsPref_inc();
			this.Logger.logAs(logger_1.DEBUG_TYPE.RULE_IO, sub.targetRule, `(IN - ${(++this.ExecutedRuleCount).toString().padStart(2, '0')})`, subRootPld, sub.subMask);
			const returnValuePld = this.executeRule(fullOutputJson, sub.targetRule, subRootPld, chrootPath);
			if (sub.newIn) {
				executor.setVar('ret', returnValuePld, enums_1.ExeType.BIN);
				this.Logger.logAs(logger_1.DEBUG_TYPE.SET_VAR_OTHER, 'ret =', returnValuePld);
				rootPld = executor.execStr(sub.newIn, enums_1.ExeType.BIN);
				this.Logger.logAs(logger_1.DEBUG_TYPE.NEW_IN, sub.newIn, rootPld);
			} else {
				rootPld = returnValuePld;
				this.Logger.logAs(logger_1.DEBUG_TYPE.NEW_IN, rootPld);
			}

			repeatRuleMask[subStruckI]++;
			subGlobRepetitionCount++;
			subStruckI = -1;
			if (sub.break) {
				this.Logger.logAs(logger_1.DEBUG_TYPE.SUB_REPETITION, subStruckI, 'Break');
				break;
			}

			executor
				.setVar('in', rootPld, enums_1.ExeType.BIN);
			this.Logger.logAs(logger_1.DEBUG_TYPE.SET_VAR_OTHER, 'in =', rootPld);
		}

		if (rSchema.valMask) {
			const valueInt = (0, bin_1.consumeIterToInt)((0, bin_1.genMaskIterator)(rootPld, rSchema.valMask, executor));
			executor.setVar('val', valueInt, enums_1.ExeType.INT);
			this.Logger.logAs(logger_1.DEBUG_TYPE.SET_VAR_VAL_SET, 'val =', valueInt, `"${rSchema.valMask}"`);
		} else {
			executor.rmVar('val');
		}

		const returnValue = (rSchema) ? (0, bin_1.genMaskIterator)(rootPld, rSchema.next, executor) : rootPld;
		this.Logger.logAs(logger_1.DEBUG_TYPE.RULE_IO, ruleName, `(OUT - ${ruleIterCount})`, returnValue, rSchema.next);
		this.Logger.subParsPref_dec();
		return returnValue;
	}

	accessAtributeAtr(setAction, opValue, jsonData, pathArray, executor) {
		let currentObject = jsonData;
		for (let pathArrayIndex = 0; pathArrayIndex < pathArray.length; pathArrayIndex++) {
			const block = pathArray[pathArrayIndex].name;
			if (pathArray.length - 1 === pathArrayIndex) {
				const printableOpValue = (0, binIter_1.isBinIter)(opValue) ? (0, bin_1.consumeIterToArrString)(opValue.genRangeIter()) : opValue;
				switch (setAction) {
					case enums_1.SET_ACTION_ENUM.SET_UPDATE: {
						this.Logger.logAs(logger_1.DEBUG_TYPE.SET_ATRIBUTE, 'ACTION:', 'SET\nPATH:', pathArray, '\nNAME:', block, '\nVAL:', opValue);
						currentObject[block] = printableOpValue;

						break;
					}

					case enums_1.SET_ACTION_ENUM.INCREMENT: {
						this.Logger.logAs(logger_1.DEBUG_TYPE.SET_ATRIBUTE, 'ACTION', 'INCREMENT\nPATH:', pathArray, '\nNAME:', block, '\nVAL:', opValue);
						if (currentObject[block] === undefined) {
							currentObject[block] = 0;
						}

						if (typeof currentObject[block] !== 'number') {
							throw new errors_1.InputFormatError('Path has invalid type, expected: number/string', {str: currentObject, fullPath: pathArrayIndex});
						}

						currentObject[block] += printableOpValue;

						break;
					}

					case enums_1.SET_ACTION_ENUM.APPEND: {
						this.Logger.logAs(logger_1.DEBUG_TYPE.SET_ATRIBUTE, 'ACTION:', 'APPEND\nPATH:', pathArray, '\nNAME:', block, '\nVAL:', opValue);
						if (currentObject[block] === undefined) {
							currentObject[block] = [];
						}

						if (!Array.isArray(currentObject[block])) {
							throw new errors_1.InputFormatError('Path has invalid type, expected: array', {str: currentObject, fullPath: pathArrayIndex});
						}

						currentObject[block].push(printableOpValue);

						break;
					}
				// No default
				}

				this.Logger.logAs(logger_1.DEBUG_TYPE.JSON_CHANGE, jsonData);
			}

			if (currentObject[block] === undefined) {
				if (this.Logger.logTypeEnabled(logger_1.DEBUG_TYPE.CREATE_ATRIBUTE)) {
					this.Logger.logAs(logger_1.DEBUG_TYPE.CREATE_ATRIBUTE, 'TYPE', pathArray[pathArrayIndex].type === enums_1.JSON_PATH_TYPE.ARR ? '[]' : '{}', '\nPATH:', pathArray.slice(0, pathArrayIndex + 1));
				}

				currentObject[block] = pathArray[pathArrayIndex].type === enums_1.JSON_PATH_TYPE.ARR ? [] : {};
				this.Logger.logAs(logger_1.DEBUG_TYPE.JSON_CHANGE, jsonData);
			}

			currentObject = currentObject[block];
		}
	}

	concatPath(oldError, newPath = '', executor) {
		const fullPath = oldError.slice();
		const splitPath = newPath.split('/').filter(Boolean);
		for (const value of splitPath) {
			if (value === '..') {
				while (true) {
					if (fullPath.length === 0) {
						throw new errors_1.InputFormatError('Invalid path concat', {currentPath: oldError, newPath: splitPath});
					}

					fullPath.pop();
					if (fullPath.at(-1).type !== enums_1.JSON_PATH_TYPE.ARR) {
						break;
					}
				}
			} else if (value.includes('[')) {
				const blockArray = new sQueue_1.default(value);
				const arrayName = blockArray.searchUntil_char('[').consumeToString();
				fullPath.push({
					name: arrayName,
					type: enums_1.JSON_PATH_TYPE.ARR,
				});
				while (true) {
					const indexValue = executor.exec(blockArray, enums_1.ExeType.INT, ']');
					if (!blockArray.hasNext()) {
						fullPath.push({
							name: indexValue,
							type: enums_1.JSON_PATH_TYPE.OBJECT,
						});
						break;
					}

					if (blockArray.next() !== '[') {
						throw new errors_1.InputFormatError('Invalid array indexing', {segment: value, newPath: splitPath});
					}

					fullPath.push({
						name: indexValue,
						type: enums_1.JSON_PATH_TYPE.ARR,
					});
				}
			} else if (value !== '.') {
				fullPath.push({
					name: value,
					type: enums_1.JSON_PATH_TYPE.OBJECT,
				});
			}
		}

		return fullPath;
	}
}
exports.default = Parser;
// # sourceMappingURL=BJ_parser.js.map
