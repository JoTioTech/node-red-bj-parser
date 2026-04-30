const parserModule = __importDefault(require('./src/BJ_parser'));
const parserSchemaModule = require('./src/parseSchema');

module.exports = function (RED) {
	function ParserNode(config) {
		RED.nodes.createNode(this, config);
		const parserConfig = {
			suppressHeader: config.suppressedLogs.toUpperCase().split(',').map(value => value.trim()),
			maxStrLength: config.maxBinLen,
			binAsHex: true,
			directToConsole: false,
		};

		this.on('input', message => {
			const stringHex = message.payload;

			globalThis.parserArrays ||= {};
			globalThis.parserVariables ||= {};

			const schema = parserSchemaModule.parseRuleMap(message.parsingSchema);
			const parser = new parserModule.default(schema, parserConfig);

			message.payload = {};

			if (schema.payloadSplitting && schema.payloadSplitting.enabled === true) {
				const splitCfg = schema.payloadSplitting;

				const locationMatch = /^0\((\d+)\)1\((\d+)\)$/.exec(splitCfg.location);

				if (!locationMatch) {
					console.log('bad splitting location format');
					message.payload = {};
				} else {
					const skipBytes = Number.parseInt(locationMatch[1], 10);
					const lengthBytes = Number.parseInt(locationMatch[2], 10);

					let maskType = null;
					let keepBits = 0;
					let shiftBits = 0;

					if (splitCfg.binaryMask) {
						const maskMiddleBits = /^0\((\d+)\)1\((\d+)\)0\((\d+)\)$/.exec(splitCfg.binaryMask); // E.g. 0(4)1(8)0(4)
						const maskRightShift = /^1\((\d+)\)0\((\d+)\)$/.exec(splitCfg.binaryMask); // E.g. 1(12)0(4)
						const maskUpperBits = /^0\((\d+)\)1\((\d+)\)$/.exec(splitCfg.binaryMask); // E.g. 0(4)1(12)

						if (maskMiddleBits) {
							maskType = 'middle';
							keepBits = Number.parseInt(maskMiddleBits[2], 10);
							shiftBits = Number.parseInt(maskMiddleBits[3], 10);
						} else if (maskRightShift) {
							maskType = 'rightShift';
							shiftBits = Number.parseInt(maskRightShift[2], 10);
						} else if (maskUpperBits) {
							maskType = 'upperBits';
							keepBits = Number.parseInt(maskUpperBits[2], 10);
						}
					}


					// extract string with length
					let currentOffset = 0; // Tracks the offset in hex characters
					const parsedChunks = [];

					while (currentOffset < stringHex.length) {
						const remainingHex = stringHex.slice(Math.max(0, currentOffset));
						const requiredHexCharsForHeader = (skipBytes + lengthBytes) * 2;

						if (remainingHex.length < requiredHexCharsForHeader) {
							break;
						}

						let lengthHex = remainingHex.substring(skipBytes * 2, skipBytes * 2 + lengthBytes * 2);

						// Reverse endianness
						if (splitCfg.endianness === 'LE') {
							const bytes = [];
							for (let i = 0; i < lengthHex.length; i += 2) {
								bytes.push(lengthHex.substring(i, i + 2));
							}

							lengthHex = bytes.reverse().join('');
						}

						const rawLength = Number.parseInt(lengthHex, 16);

						let actualLength = rawLength;

						// Apply the binary mask
						if (maskType === 'middle') {
							actualLength = (rawLength >> shiftBits) & ((1 << keepBits) - 1);
						} else if (maskType === 'rightShift') {
							actualLength = rawLength >> shiftBits;
						} else if (maskType === 'upperBits') {
							actualLength = rawLength & ((1 << keepBits) - 1);
						}

						const totalChunkBytes = splitCfg.metadataSize + (actualLength * splitCfg.multiplier);
						const chunkHexLength = totalChunkBytes * 2;

						if (remainingHex.length < chunkHexLength){
							break;
						}

						const chunkHex = remainingHex.slice(0, Math.max(0, chunkHexLength));
						const parsedChunk = parser.runHexAndWrap(chunkHex);

						parsedChunks.push(parsedChunk);

						if (parsedChunk.parsingError === true) {
							break;
						}

						currentOffset += chunkHexLength;
					}

					if(parsedChunks.length === 1)
						message.payload = parsedChunks[0];
					else
						message.payload = parsedChunks;
				}
			} else {
				message.payload = parser.runHexAndWrap(stringHex);
			}

			if (schema.clearGlobalVars == true) {
				globalThis.parserVariables = {};
				globalThis.parserArrays = {};
			}

			message.payload.schemaInfo = {
				name: schema.name,
				version: schema.version,
				schemaVersion: schema.schemaVersion,
			};
			this.send(message);
		});
	}

	RED.nodes.registerType('BJ-parser', ParserNode);
};
