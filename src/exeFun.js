'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.EXP_FUNCTION_ENUM = void 0;
const bin_1 = require('./bin');
const enums_1 = require('./enums');
const evaluators_1 = require('./evaluators');
const mbus_1 = require('./mbus');

exports.EXP_FUNCTION_ENUM = Object.freeze({
	neql: {
		name: 'neql',
		argsType: [enums_1.ExeType.ANY, enums_1.ExeType.ANY],
		retType: enums_1.ExeType.BOOL,
		fun(argumentArray, variableMap) {
			return argumentArray[0] !== argumentArray[1];
		},
	},
	eql: {
		name: 'eql',
		argsType: [enums_1.ExeType.ANY, enums_1.ExeType.ANY],
		retType: enums_1.ExeType.BOOL,
		fun(argumentArray, variableMap) {
			return argumentArray[0] === argumentArray[1];
		},
	},
	more: {
		name: 'more',
		argsType: [enums_1.ExeType.ANY, enums_1.ExeType.ANY],
		retType: enums_1.ExeType.BOOL,
		fun(argumentArray, variableMap) {
			return argumentArray[0] > argumentArray[1];
		},
	},
	less: {
		name: 'less',
		argsType: [enums_1.ExeType.ANY, enums_1.ExeType.ANY],
		retType: enums_1.ExeType.BOOL,
		fun(argumentArray, variableMap) {
			return argumentArray[0] < argumentArray[1];
		},
	},
	toBool: {
		name: 'toBool',
		argsType: [enums_1.ExeType.ANY],
		retType: enums_1.ExeType.BOOL,
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
	toInt24: {
		name: 'toInt24',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return argumentArray[0] < 0x80_00_00 ? argumentArray[0] : argumentArray[0] - 0x1_00_00_00;
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
			const bigEndian = ((argumentArray[0] & 0xFF) << 16) | (argumentArray[0]) | ((argumentArray[0] & 0xFF_00_00) >> 16);
			return bigEndian < 0x80_00_00 ? bigEndian : bigEndian - 0x1_00_00_00;
		},
	},
	toFloat16: {
		name: 'toFloat16',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.FLOAT,
		fun(argumentArray, variableMap) {
		 const bits = argumentArray[0];
			const sign = bits >>> 15 === 0 ? 1 : -1;
			const e = (bits >>> 10) & 0x1F;
			const m = e === 0 ? (bits & 0x3_FF) << 1 : (bits & 0x3_FF) | 0x4_00;
			const f = sign * m * 2 ** (e - 25);
			return f;
		},
	},
	toFloat16LE: {
		name: 'toFloat16LE',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.FLOAT,
		fun(argumentArray, variableMap) {
		 const bits = ((argumentArray[0] & 0xFF) << 8) | (argumentArray[0] >> 8);
			const sign = bits >>> 15 === 0 ? 1 : -1;
			const e = (bits >>> 10) & 0x1F;
			const m = e === 0 ? (bits & 0x3_FF) << 1 : (bits & 0x3_FF) | 0x4_00;
			const f = sign * m * 2 ** (e - 25);
			return f;
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
	toUInt16LE: { // Interpret number in arguments as little-endian
		name: 'toUInt16LE',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return ((argumentArray[0] & 0xFF) << 8) | ((argumentArray[0] & 0xFF_00) >> 8);
		},
	},
	toUInt32LE: { // Interpret number in arguments as little-endian
		name: 'toUInt32LE',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return ((argumentArray[0] & 0xFF) << 24) | ((argumentArray[0] & 0xFF_00) << 8) | ((argumentArray[0] & 0xFF_00_00) >> 8) | ((argumentArray[0] >> 24) & 0xFF);
		},
	},
	toUInt24LE: { // Interpret number in arguments as little-endian
		name: 'toUInt24LE',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return ((argumentArray[0] & 0xFF) << 16) | (argumentArray[0] & 0xFF_00) | ((argumentArray[0] & 0xFF_00_00) >> 16);
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
	toIntBCD2Digit: {
		name: 'toIntBCD2Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return (argumentArray[0] & 0xF) + 10 * ((argumentArray[0] >> 4) & 0xF);
		},
	},
	toIntBCD4Digit: {
		name: 'toIntBCD4Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return (argumentArray[0] & 0xF) + 10 * ((argumentArray[0] >> 4) & 0xF) + 100 * ((argumentArray[0] >> 8) & 0xF) + 1000 * ((argumentArray[0] >> 12) & 0xF);
		},
	},
	toIntBCD6Digit: {
		name: 'toIntBCD6Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return (argumentArray[0] & 0xF) + 10 * ((argumentArray[0] >> 4) & 0xF) + 100 * ((argumentArray[0] >> 8) & 0xF) + 1000 * ((argumentArray[0] >> 12) & 0xF) + 10_000 * ((argumentArray[0] >> 16) & 0xF) + 100_000 * ((argumentArray[0] >> 20) & 0xF);
		},
	},
	toIntBCD8Digit: {
		name: 'toIntBCD8Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return (argumentArray[0] & 0xF) + 10 * ((argumentArray[0] >> 4) & 0xF) + 100 * ((argumentArray[0] >> 8) & 0xF) + 1000 * ((argumentArray[0] >> 12) & 0xF) + 10_000 * ((argumentArray[0] >> 16) & 0xF) + 100_000 * ((argumentArray[0] >> 20) & 0xF) + 1_000_000 * ((argumentArray[0] >> 24) & 0xF) + 10_000_000 * ((argumentArray[0] >> 28) & 0xF);
		},
	},
	toIntBCD10Digit: {
		name: 'toIntBCD10Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return (argumentArray[0] & 0xF) + 10 * ((argumentArray[0] >> 4) & 0xF) + 100 * ((argumentArray[0] >> 8) & 0xF) + 1000 * ((argumentArray[0] >> 12) & 0xF) + 10_000 * ((argumentArray[0] >> 16) & 0xF) + 100_000 * ((argumentArray[0] >> 20) & 0xF) + 1_000_000 * ((argumentArray[0] >> 24) & 0xF) + 10_000_000 * ((argumentArray[0] >> 28) & 0xF) + 100_000_000 * ((argumentArray[0] >> 32) & 0xF) + 1_000_000_000 * ((argumentArray[0] >> 36) & 0xF);
		},
	},
	toIntBCD12Digit: {
		name: 'toIntBCD12Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return (argumentArray[0] & 0xF) + 10 * ((argumentArray[0] >> 4) & 0xF) + 100 * ((argumentArray[0] >> 8) & 0xF) + 1000 * ((argumentArray[0] >> 12) & 0xF) + 10_000 * ((argumentArray[0] >> 16) & 0xF) + 100_000 * ((argumentArray[0] >> 20) & 0xF) + 1_000_000 * ((argumentArray[0] >> 24) & 0xF) + 10_000_000 * ((argumentArray[0] >> 28) & 0xF) + 100_000_000 * ((argumentArray[0] >> 32) & 0xF) + 1_000_000_000 * ((argumentArray[0] >> 36) & 0xF) + 10_000_000_000 * ((argumentArray[0] >> 40) & 0xF) + 100_000_000_000 * ((argumentArray[0] >> 44) & 0xF);
		},
	},
	toHex: {
		name: 'toHex',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.BIN],
		retType: enums_1.ExeType.STRING,
		fun(argumentArray, variableMap) {
			const struct = (0, bin_1.genMaskIterator)(argumentArray[1], argumentArray[0], new evaluators_1.ExpEvaluator(variableMap));
			let string_ = '';
			const endIndex = struct.ranges[0].iter.start + struct.len;
			let byte = 0;
			for (let i = struct.ranges[0].iter.start; i < endIndex; i += 8) {
				byte = 0;
				for (let index = 0; index < 8; index++) {
					byte <<= 1; byte += struct.ranges[0].iter.base.data[i + index];
				}

				string_ += byte.toString(16);
			}

			return string_;
		},
	},
	parseMBUS: {
		name: 'parseMBUS',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.BIN],
		retType: enums_1.ExeType.JSON,
		fun(argumentArray, variableMap) {
			const struct = (0, bin_1.genMaskIterator)(argumentArray[1], argumentArray[0], new evaluators_1.ExpEvaluator(variableMap));
			const endIndex = struct.ranges[0].iter.start + struct.len;
			let byte = 0;
			const array = [];
			for (let i = struct.ranges[0].iter.start; i < endIndex; i += 8) {
				byte = 0;
				for (let index = 0; index < 8; index++) {
					byte <<= 1; byte += struct.ranges[0].iter.base.data[i + index];
				}

				array.push(byte);
			}

			const data = (0, mbus_1.mbusDecoder)(array);
			return data;
		},
	},
	toIMEI: {
		name: 'toIMEI',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.BIN],
		retType: enums_1.ExeType.STRING,
		fun(argumentArray, variableMap) {
			const struct = (0, bin_1.genMaskIterator)(argumentArray[1], argumentArray[0], new evaluators_1.ExpEvaluator(variableMap));
			const endIndex = struct.ranges[0].iter.start + struct.len;
			let byte = 0;
			const array = [];
			for (let i = struct.ranges[0].iter.start; i < endIndex; i += 8) {
				byte = 0;
				for (let index = 0; index < 8; index++) {
					byte <<= 1; byte += struct.ranges[0].iter.base.data[i + index];
				}
				array.push(byte);
			}
			// convert byte array to IMEI String
			let toReturn = '';
			for(var i =0; i < array.length; i++)
				toReturn = toReturn + array[i].toString().padStart(i==14 ? i :2, '0');
			return toReturn;
		},
	},
	toMBUSManufacturerID: {
		name: 'toMBUSManufacturerID',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.STRING,
		fun(argumentArray) {
			const number = argumentArray[0] & 0x7F_FF;
			const array = [(number >> 10) + 64, ((number >> 5) & 31) + 64, (number & 31) + 64];
			return String.fromCharCode.apply(null, array);
		},
	},
	clearArray: {
		name: 'clearArray',
		argsType: [enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			if (!global.arrays) global.arrays = {};
			global.arrays[argumentArray[0]] = [];
			return 0;
		},
	},
	pushToArray: {
		name: 'pushToArray',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.ANY],
		retType: enums_1.ExeType.ARRAY,
		fun(argumentArray) {
			if (!global.arrays) global.arrays = {};
			if (!global.arrays[argumentArray[0]]) global.arrays[argumentArray[0]] = [];
			global.arrays[argumentArray[0]].push(argumentArray[1]);
			return 0;

		},
	},
	loadLastArrayElementToCustomVar: {
		name: 'loadLastArrayElementToCustomVar',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			if (!global.arrays) global.arrays = {};
			if (!global.arrays[argumentArray[0]]) global.arrays[argumentArray[0]] = [];
			switch (argumentArray[1]) {
				case 'custom1': {
					global.custom1 =  global.arrays[argumentArray[0]].pop();
					break;
				}
				case 'custom2': {
					global.custom2 =  global.arrays[argumentArray[0]].pop();
					break;
				}
				case 'custom3': {
					global.custom3 =  global.arrays[argumentArray[0]].pop();
					break;
				}
			}
			return 0;
		},
	},
	removeLastArrayElement : {
		name: 'removeLastArrayElement',
		argsType: [enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			if (!global.arrays) global.arrays = {};
			if (!global.arrays[argumentArray[0]]) global.arrays[argumentArray[0]] = [];
					return  global.arrays[argumentArray[0]].pop();
		},
	},
	loadFirstArrayElementToCustomVar: {
		name: 'loadFirstArrayElementToCustomVar',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			if (!global.arrays) global.arrays = {};
			if (!global.arrays[argumentArray[0]]) global.arrays[argumentArray[0]] = [];
			switch (argumentArray[1]) {
				case 'custom1': {
					global.custom1 =  global.arrays[argumentArray[0]].shift();
					break;
				}
				case 'custom2': {
					global.custom2 =  global.arrays[argumentArray[0]].shift();
					break;
				}
				case 'custom3': {
					global.custom3 =  global.arrays[argumentArray[0]].shift();
					break;
				}
			}
			return 0;
		},
	},
	removeFirstArrayElement : {
		name: 'removeFirstArrayElement',
		argsType: [enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			if (!global.arrays) global.arrays = {};
			if (!global.arrays[argumentArray[0]]) global.arrays[argumentArray[0]] = [];
			return  global.arrays[argumentArray[0]].shift();
		}
	},
	setCustomVar: {
		name: 'setCustomVar',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.ANY], // NOTE: test if this doesn't mess up anything else oritignaly was ExeType.INT
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			switch (argumentArray[0]) {
				case 'custom1': {
					global.custom1 = argumentArray[1];
					break;
				}

				case 'custom2': {
					global.custom2 = argumentArray[1];
					break;
				}

				case 'custom3': {
					global.custom3 = argumentArray[1];
					break;
				}
			}

			return argumentArray[1];
		},
	},

	toAscii: {
		name: 'toAscii',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.BIN],
		retType: enums_1.ExeType.STRING,
		fun(argumentArray, variableMap) {
			const struct = (0, bin_1.genMaskIterator)(argumentArray[1], argumentArray[0], new evaluators_1.ExpEvaluator(variableMap));
			let string_ = '';
			const endIndex = struct.ranges[0].iter.start + struct.len;
			let byte = 0;
			for (let i = struct.ranges[0].iter.start; i < endIndex; i += 8) {
				byte = 0;
				for (let index = 0; index < 8; index++) {
					byte <<= 1; byte += struct.ranges[0].iter.base.data[i + index];
				}

				string_ += String.fromCharCode(byte);
			}

			return string_;
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
	parseUTC_5b: {
		name: 'parseUTC_5b',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.STRING,
		fun(argumentArray, variableMap) {
			return new Date(argumentArray[0]).toUTCString();
		},
	},
});
// # sourceMappingURL=exeFun.js.map
