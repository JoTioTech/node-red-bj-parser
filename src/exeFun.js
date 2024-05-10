'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.EXP_FUNCTION_ENUM = void 0;
const bin_1 = require('./bin');
const enums_1 = require('./enums');
const evaluators_1 = require('./evaluators');

exports.EXP_FUNCTION_ENUM = Object.freeze({
	eql: {
		name: 'eql',
		argsType: [enums_1.ExeType.ANY, enums_1.ExeType.ANY],
		retType: enums_1.ExeType.BOLL,
		fun(argumentArray, variableMap) {
			return argumentArray[0] === argumentArray[1];
		},
	},
	more: {
		name: 'more',
		argsType: [enums_1.ExeType.ANY, enums_1.ExeType.ANY],
		retType: enums_1.ExeType.BOLL,
		fun(argumentArray, variableMap) {
			return argumentArray[0] > argumentArray[1];
		},
	},
	less: {
		name: 'less',
		argsType: [enums_1.ExeType.ANY, enums_1.ExeType.ANY],
		retType: enums_1.ExeType.BOLL,
		fun(argumentArray, variableMap) {
			return argumentArray[0] < argumentArray[1];
		},
	},
	toBool: {
		name: 'toBool',
		argsType: [enums_1.ExeType.ANY],
		retType: enums_1.ExeType.BOLL,
		fun(argumentArray, variableMap) {
			return Boolean(argumentArray[0]);
		},
	},
	toInt32: {
		name: 'toInt32',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return argumentArray[0] < 0x80_00_00_00 ? argumentArray[0] : argumentArray[0] - 0x1_00_00_00_00;
		},
	},
	toInt16: {
		name: 'toInt16',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return argumentArray[0] < 0x80_00 ? argumentArray[0] : argumentArray[0] - 0x1_00_00;
		},
	},
	toInt16LE: { // Interpret number in arguments as little-endian
		name: 'toInt16LE',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			const bigEndian = ((argumentArray[0] & 0xFF) << 8) | ((argumentArray[0] & 0xFF_00) >> 8);
			return bigEndian < 0x80_00 ? bigEndian : bigEndian - 0x1_00_00;
		},
	},
	toInt32LE: { // Interpret number in arguments as little-endian
		name: 'toInt32LE',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			const bigEndian = ((argumentArray[0] & 0xFF) << 24) | ((argumentArray[0] & 0xFF_00) << 8) | ((argumentArray[0] & 0xFF_00_00) >> 8) | ((argumentArray[0] >> 24) & 0xFF);
			return bigEndian < 0x80_00_00_00 ? bigEndian : bigEndian - 0x1_00_00_00_00;
		},
	},
	toInt24LE: { // Interpret number in arguments as little-endian
		name: 'toInt24LE',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			const bigEndian = ((argumentArray[0] & 0xFF) << 16) | ((argumentArray[0] & 0xFF_00) << 8) | ((argumentArray[0] & 0xFF_00_00) >> 8);
			return bigEndian < 0x80_00_00 ? bigEndian : bigEndian - 0x1_00_00_00;
		},
	},
	toFloat: {
		name: 'toFloat',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.FLOAT,
		fun(argumentArray, variableMap) {
			const sign = argumentArray[0] >>> 31 === 0 ? 1 : -1;
			const e = (argumentArray[0] >>> 23) & 0xFF;
			const m = e === 0 ? (argumentArray[0] & 0x7F_FF_FF) << 1 : (argumentArray[0] & 0x7F_FF_FF) | 0x80_00_00;
			const f = sign * m * 2 ** (e - 150);
			return f;
		},
	},
	toFloatLE: {
		name: 'toFloatLE',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.FLOAT,
		fun(argumentArray, variableMap) {
			const bigEndian = ((argumentArray[0] & 0xFF) << 24) | ((argumentArray[0] & 0xFF_00) << 8) | ((argumentArray[0] & 0xFF_00_00) >> 8) | ((argumentArray[0] >> 24) & 0xFF);
			const sign = bigEndian >>> 31 === 0 ? 1 : -1;
			const e = (bigEndian >>> 23) & 0xFF;
			const m = e === 0 ? (bigEndian & 0x7F_FF_FF) << 1 : (bigEndian & 0x7F_FF_FF) | 0x80_00_00;
			const f = sign * m * 2 ** (e - 150);
			return f;
		},
	},
	toDouble: {
		name: 'toDouble',
		argsType: [enums_1.ExeType.INT, enums_1.ExeType.INT],
		retType: enums_1.ExeType.FLOAT,
		fun(argumentArray, variableMap) {
			const sign = argumentArray[0] >>> 63 === 0 ? 1 : -1;
			const e = (argumentArray[0] >>> 52) & 0x7FF;
			const m = e === 0 ? (argumentArray[0] & 0x7FF_FFFF_FFFF_F) << 1 : (argumentArray[0] & 0x7FF_FFFF_FFFF_F) | 0x800_00_00_00_00;
			const f = sign * m * 2 ** (e - 1075);
			return f;
		},
	},
	toDoubleLE: {
		name: 'toDoubleLE',
		argsType: [enums_1.ExeType.INT, enums_1.ExeType.INT],
		retType: enums_1.ExeType.FLOAT,
		fun(argumentArray, variableMap) {
			const bigEndian = ((argumentArray[0] & 0xFF) << 56) | ((argumentArray[0] & 0xFF_00) << 40) | ((argumentArray[0] & 0xFF_00_00) << 24) | ((argumentArray[0] & 0xFF_00_00_00) << 8) | ((argumentArray[0] & 0xFF_00_00_00_00) >> 8) | ((argumentArray[0] & 0xFF_00_00_00_00_00) >> 24) | (argumentArray[0] >> 40) | ((argumentArray[0] >> 56) & 0xFF);
			const sign = bigEndian >>> 63 === 0 ? 1 : -1;
			const e = (bigEndian >>> 52) & 0x7FF;
			const m = e === 0 ? (bigEndian & 0x7FF_FFFF_FFFF_F) << 1 : (bigEndian & 0x7FF_FFFF_FFFF_F) | 0x800_00_00_00_00;
			const f = sign * m * 2 ** (e - 1075);
			return f;
		}
	},
	toIntBCD2Digit: {
		name: 'toIntBCD2Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return ((argumentArray[0] & 0xF) % 10) + 10 * (((argumentArray[0] >> 4) & 0xF) % 10) + 100 * (((argumentArray[0] >> 8) & 0xF) % 10);

		},
	},
	toIntBCD4Digit: {
		name: 'toIntBCD4Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return ((argumentArray[0] & 0xF) % 10) + 10 * (((argumentArray[0] >> 4) & 0xF) % 10) + 100 * (((argumentArray[0] >> 8) & 0xF) % 10) + 1000 * (((argumentArray[0] >> 12) & 0xF) % 10);
		},
	},
	toIntBCD6Digit: {
		name: 'toIntBCD6Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return ((argumentArray[0] & 0xF) % 10) + 10 * (((argumentArray[0] >> 4) & 0xF) % 10) + 100 * (((argumentArray[0] >> 8) & 0xF) % 10) + 1000 * (((argumentArray[0] >> 12) & 0xF) % 10) + 10_000 * (((argumentArray[0] >> 16) & 0xF) % 10) + 100_000 * (((argumentArray[0] >> 20) & 0xF) % 10);
		},
	},
	toIntBCD8Digit: {
		name: 'toIntBCD8Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return ((argumentArray[0] & 0xF) % 10) + 10 * (((argumentArray[0] >> 4) & 0xF) % 10) + 100 * (((argumentArray[0] >> 8) & 0xF) % 10) + 1000 * (((argumentArray[0] >> 12) & 0xF) % 10) + 10_000 * (((argumentArray[0] >> 16) & 0xF) % 10) + 100_000 * (((argumentArray[0] >> 20) & 0xF) % 10) + 1_000_000 * (((argumentArray[0] >> 24) & 0xF) % 10) + 10_000_000 * (((argumentArray[0] >> 28) & 0xF) % 10);
		},
	},
	toIntBCD10Digit: {
		name: 'toIntBCD10Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return ((argumentArray[0] & 0xF) % 10) + 10 * (((argumentArray[0] >> 4) & 0xF) % 10) + 100 * (((argumentArray[0] >> 8) & 0xF) % 10) + 1000 * (((argumentArray[0] >> 12) & 0xF) % 10) + 10_000 * (((argumentArray[0] >> 16) & 0xF) % 10) + 100_000 * (((argumentArray[0] >> 20) & 0xF) % 10) + 1_000_000 * (((argumentArray[0] >> 24) & 0xF) % 10) + 10_000_000 * (((argumentArray[0] >> 28) & 0xF) % 10) + 100_000_000 * (((argumentArray[0] >> 32) & 0xF) % 10) + 1_000_000_000 * (((argumentArray[0] >> 36) & 0xF) % 10);
		},
	},
	toIntBCD12Digit: {
		name: 'toIntBCD12Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return ((argumentArray[0] & 0xF) % 10) + 10 * (((argumentArray[0] >> 4) & 0xF) % 10) + 100 * (((argumentArray[0] >> 8) & 0xF) % 10) + 1000 * (((argumentArray[0] >> 12) & 0xF) % 10) + 10_000 * (((argumentArray[0] >> 16) & 0xF) % 10) + 100_000 * (((argumentArray[0] >> 20) & 0xF) % 10) + 1_000_000 * (((argumentArray[0] >> 24) & 0xF) % 10) + 10_000_000 * (((argumentArray[0] >> 28) & 0xF) % 10) + 100_000_000 * (((argumentArray[0] >> 32) & 0xF) % 10) + 1_000_000_000 * (((argumentArray[0] >> 36) & 0xF) % 10) + 10_000_000_000 * (((argumentArray[0] >> 40) & 0xF) % 10) + 100_000_000_000 * (((argumentArray[0] >> 44) & 0xF) % 10);
		},
	},
	toUtf8: {
		name: 'binToString',
		argsType: [enums_1.ExeType.BIN],
		retType: enums_1.ExeType.STRING,
		fun(argumentArray, variableMap) {
			return (0, bin_1.consumeIterToUTF8)(argumentArray[0]);
		},
	},
	mask: {
		name: 'mask',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.BIN],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			const outMask = (0, bin_1.genMaskIterator)(argumentArray[1], argumentArray[0], new evaluators_1.ExpEvaluator(variableMap));
			const outInt = (0, bin_1.consumeIterToInt)(outMask);
			return outInt;
		},
	},
	maskB: {
		name: 'maskB',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.BIN],
		retType: enums_1.ExeType.BIN,
		fun(argumentArray, variableMap) {
			const outMask = (0, bin_1.genMaskIterator)(argumentArray[1], argumentArray[0], new evaluators_1.ExpEvaluator(variableMap));
			return outMask;
		},
	},
	parsUTC_5b: {
		name: 'parsUTC_5b',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.STRING,
		fun(argumentArray, variableMap) {
			return new Date(argumentArray[0]).toUTCString();
		},
	},
});
// # sourceMappingURL=exeFun.js.map

