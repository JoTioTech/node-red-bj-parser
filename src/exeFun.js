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
		retType: enums_1.ExeType.INT,
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
		retType: enums_1.ExeType.INT,
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
		retType: enums_1.ExeType.INT,
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
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			const bits = ((argumentArray[0] & 0xFF) << 24) | ((argumentArray[0] & 0xFF_00) << 8) | ((argumentArray[0] & 0xFF_00_00) >> 8) | ((argumentArray[0] >> 24) & 0xFF);
			const sign = bits >>> 31 === 0 ? 1 : -1;
			const e = (bits >>> 23) & 0xFF;
			const m = e === 0 ? (bits & 0x7F_FF_FF) << 1 : (bits & 0x7F_FF_FF) | 0x80_00_00;
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
		retType: enums_1.ExeType.INT,
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
		retType: enums_1.ExeType.INT,
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
	toIntBCD3Digit: {
		name: 'toIntBCD3Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return (argumentArray[0] & 0xF) + 10 * ((argumentArray[0] >> 4) & 0xF) + 100 * ((argumentArray[0] >> 8) & 0xF);
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
	toIntBCD5Digit: {
		name: 'toIntBCD5Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return (argumentArray[0] & 0xF) + 10 * ((argumentArray[0] >> 4) & 0xF) + 100 * ((argumentArray[0] >> 8) & 0xF) + 1000 * ((argumentArray[0] >> 12) & 0xF) + 10_000 * ((argumentArray[0] >> 16) & 0xF);
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
	toIntBCD7Digit: {
		name: 'toIntBCD7Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return (argumentArray[0] & 0xF) + 10 * ((argumentArray[0] >> 4) & 0xF) + 100 * ((argumentArray[0] >> 8) & 0xF) + 1000 * ((argumentArray[0] >> 12) & 0xF) + 10_000 * ((argumentArray[0] >> 16) & 0xF) + 100_000 * ((argumentArray[0] >> 20) & 0xF) + 1_000_000 * ((argumentArray[0] >> 24) & 0xF);
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
	toIntBCD9Digit: {
		name: 'toIntBCD9Digit',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			return (argumentArray[0] & 0xF) + 10 * ((argumentArray[0] >> 4) & 0xF) + 100 * ((argumentArray[0] >> 8) & 0xF) + 1000 * ((argumentArray[0] >> 12) & 0xF) + 10_000 * ((argumentArray[0] >> 16) & 0xF) + 100_000 * ((argumentArray[0] >> 20) & 0xF) + 1_000_000 * ((argumentArray[0] >> 24) & 0xF) + 10_000_000 * ((argumentArray[0] >> 28) & 0xF) + 100_000_000 * ((argumentArray[0] >> 32) & 0xF);
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
	getLength: {
		name: 'getLength',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.STRING, enums_1.ExeType.BIN],
		retType: enums_1.ExeType.INT,
		fun(argumentArray, variableMap) {
			const struct = (0, bin_1.genMaskIterator)(argumentArray[2], argumentArray[0], new evaluators_1.ExpEvaluator(variableMap));
			global.parserVariables[argumentArray[1]] = struct.len;
			return struct.len;
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

				string_ += byte.toString(16).padStart(2, '0');
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
	parseMBUSMockHeader: {
		name: 'parseMBUSMockHeader',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.BIN, enums_1.ExeType.STRING],
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

			const start = 0x68;
			const cField = 0x08; // Control field: RSP_UD (slave response)
			const address = 0xFD; // Primary address (from manual)
			const ciField = 0x72; // CI field: Variable Data Response

			const identificationNumber = new Uint8Array([0x00, 0x00, 0x00, 0x00]); // 4 bytes (e.g., device ID)
			const manufacturerId = new Uint8Array([0x2F, 0x00]); // 2 bytes
			const version = new Uint8Array([0x07]); // 1 byte (FW 2.0.0)
			const deviceType = new Uint8Array([0xFF]); // 1 byte (unknown)
			const accessNumber = new Uint8Array([0x00]); // 1 byte
			const status = new Uint8Array([0x02]); // 1 byte (no error)
			const configWord = new Uint8Array([0x00, 0x00]); // 2 bytes
			const signature = new Uint8Array([0x2F, 0x2F]); // 2 bytes (AES placeholder)

			let dataBytes = new Uint8Array([]);

			if (argumentArray[2] === 'simple') {
				dataBytes = new Uint8Array(array);
			} else if (argumentArray[2] === 'full') {
				dataBytes = new Uint8Array([
					...identificationNumber,
					...manufacturerId,
					...version,
					...deviceType,
					...accessNumber,
					...status,
					...configWord,
					...signature,
					...array,
				]);
			}

			const dataLength = 3 + dataBytes.length;
			const lValue = dataLength & 0xFF;

			const checksumBytes = new Uint8Array([cField, address, ciField, ...dataBytes]);
			const checksum = checksumBytes.reduce((sum, byte) => sum + byte, 0) % 256;

			const frame = new Uint8Array([
				start,
				lValue,
				lValue,
				start, // Header: 68 L L 68
				cField,
				address,
				ciField, // C/A/CI fields
				...dataBytes, // Data (mandatory fields + records)
				checksum, // Checksum
				0x16, // Stop byte
			]);

			// const hexFrame = [...frame].map(byte => byte.toString(16).padStart(2, '0')).join('');
			// console.log(hexFrame);

			const data = (0, mbus_1.mbusDecoder)(frame);
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

			// Convert byte array to IMEI String
			let toReturn = '';
			for (let i = 0; i < array.length; i++) {
				toReturn += array[i].toString().padStart(i == array.length - 1 ? 1 : 2, '0');
			}

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
	twoComplement4Byte: {
		name: 'twoComplement4Byte',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray) {
			return argumentArray[0] < 0x80_00_00_00 ? argumentArray[0] : argumentArray[0] - 0x1_00_00_00_00;
		},
	},
	twoComplement3Byte: {
		name: 'twoComplement3Byte',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray) {
			return argumentArray[0] < 0x80_00_00 ? argumentArray[0] : argumentArray[0] - 0x1_00_00_00;
		},
	},
	twoComplement2Byte: {
		name: 'twoComplement2Byte',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray) {
			return argumentArray[0] < 0x80_00 ? argumentArray[0] : argumentArray[0] - 0x1_00_00;
		},
	},
	twoComplement1Byte: {
		name: 'twoComplement1Byte',
		argsType: [enums_1.ExeType.INT],
		retType: enums_1.ExeType.INT,
		fun(argumentArray) {
			return argumentArray[0] < 0x80 ? argumentArray[0] : argumentArray[0] - 0x1_00;
		},
	},
	clearArray: {
		name: 'clearArray',
		argsType: [enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			global.parserArrays ||= {};
			global.parserArrays[argumentArray[0]] = [];
			return 0;
		},
	},
	pushToArray: {
		name: 'pushToArray',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.ANY],
		retType: enums_1.ExeType.ARRAY,
		fun(argumentArray) {
			if (!global.parserArrays[argumentArray[0]]) {
				global.parserArrays[argumentArray[0]] = [];
			}

			global.parserArrays[argumentArray[0]].push(argumentArray[1]);
			return 0;
		},
	},
	loadLastArrayElementToCustomVar: {
		name: 'loadLastArrayElementToCustomVar',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			if (!global.parserArrays[argumentArray[0]]) {
				global.parserArrays[argumentArray[0]] = [];
			}

			global.parserVariables[argumentArray[1]] = global.parserArrays[argumentArray[0]].pop();
			return 0;
		},
	},
	removeLastArrayElement: {
		name: 'removeLastArrayElement',
		argsType: [enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			if (!global.parserArrays[argumentArray[0]]) {
				global.parserArrays[argumentArray[0]] = [];
			}

			return global.parserArrays[argumentArray[0]].pop();
		},
	},
	loadFirstArrayElementToCustomVar: {
		name: 'loadFirstArrayElementToCustomVar',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			if (!global.parserArrays[argumentArray[0]]) {
				global.parserArrays[argumentArray[0]] = [];
			}

			global.parserVariables[argumentArray[1]] = global.parserArrays[argumentArray[0]].shift();
			return 0;
		},
	},
	removeFirstArrayElement: {
		name: 'removeFirstArrayElement',
		argsType: [enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			if (!global.parserArrays[argumentArray[0]]) {
				global.parserArrays[argumentArray[0]] = [];
			}

			return global.parserArrays[argumentArray[0]].shift();
		},
	},
	clearCustomVar: {
		name: 'clearCustomVar',
		argsType: [enums_1.ExeType.STRING],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			delete global.parserVariables[argumentArray[0]];
			global.parserVariables ||= {};
			return 0;
		},
	},
	clearCustomVars: {
		name: 'clearCustomVars',
		argsType: [enums_1.ExeType.ANY],
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {
			global.parserVariables = {};
			global.parserArrays = {};
			return 0;
		},
	},
	setCustomVar: {
		name: 'setCustomVar',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.ANY], // NOTE: test if this doesn't mess up anything else oritignaly was ExeType.INT
		retType: enums_1.ExeType.ANY,
		fun(argumentArray) {

			// console.log("Setting " + argumentArray[0] + " to " + argumentArray[1]);
			global.parserVariables[argumentArray[0]] = argumentArray[1];
			// console.log(global.parserVariables);
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
	dumbMilesightModbusFormat: { // Used to parse modbus value in UC300 LTE version, not usefull anywhere else
		name: 'dumbMilesightModbusFormat',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.INT, enums_1.ExeType.INT, enums_1.ExeType.BIN],
		retType: enums_1.ExeType.JSON,
		fun(argumentArray, variableMap) {
			if (argumentArray[1] == undefined || argumentArray[1] == 0) {
				return [];
			}

			const struct = (0, bin_1.genMaskIterator)(argumentArray[3], argumentArray[0], new evaluators_1.ExpEvaluator(variableMap));
			const endIndex = struct.ranges[0].iter.start + struct.len;

			const chunkSizeBinary = struct.len / argumentArray[1];
			const chunkSize = struct.len / argumentArray[1] / 8;
			let byte = 0;
			const data = [];
			for (let i = struct.ranges[0].iter.start; i < endIndex; i += chunkSizeBinary) {
				byte = 0;
				for (let index = 0; index < chunkSizeBinary; index++) {
					byte <<= 1; byte += struct.ranges[0].iter.base.data[i + index];
				}

				// Reverse byte order in each chunk, its size in bytes in in chunkSize
				let number = 0;
				for (let i = 0; i < chunkSize; i++) {
					number = (number << 8) + (byte & 0xFF);
					byte >>= 8;
				}

				if (argumentArray[2] === 1 && number >= 2 ** (8 * chunkSize - 1)) {
					number -= 2 ** (8 * chunkSize);
				} else if (argumentArray[2] === 0xFF) { // Convert to float
					const sign = number >>> 31 === 0 ? 1 : -1;
					const e = (number >>> 23) & 0xFF;
					const m = e === 0 ? (number & 0x7F_FF_FF) << 1 : (number & 0x7F_FF_FF) | 0x80_00_00;
					number = sign * m * 2 ** (e - 150);
				}

				data.push(number);
			}

			if (data == undefined || data.length === 0) {
				return [];
			}

			return data;
		},
	},
	asciiToNumber: {
		name: 'asciiToNumber',
		argsType: [enums_1.ExeType.STRING, enums_1.ExeType.BIN], // Mask, bin
		retType: enums_1.ExeType.INT,
		fun(argumentArray) {
			const struct = (0, bin_1.genMaskIterator)(argumentArray[3], argumentArray[0], new evaluators_1.ExpEvaluator(variableMap));
			const endIndex = struct.ranges[0].iter.start + struct.len;
			let byte = 0;
			let number = 0;
			for (let i = struct.ranges[0].iter.start; i < endIndex; i += 8) {
				byte = 0;
				for (let index = 0; index < 8; index++) {
					byte <<= 1; byte += struct.ranges[0].iter.base.data[i + index];
				}

				byte -= 48;
				number = (number * 10) + byte;
			}

			return number;
		},
	},

});
// # sourceMappingURL=exeFun.js.map
