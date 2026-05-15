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

				if (splitCfg.binaryMask) {
					const maskRegex = /([01])\((\d+)\)/g;
					let match;
					let totalMaskBits = 0;
					const maskInstructions = [];

					while ((match = maskRegex.exec(splitCfg.binaryMask)) !== null) {
						const type = match[1];
						const length = Number.parseInt(match[2], 10);
						maskInstructions.push({type, length});
						totalMaskBits += length;
					}

					if (maskInstructions.length === 0) {
						console.log('bad binaryMask format');
						message.payload = {};
					} else {
						const remainder = totalMaskBits % 8;
						if (remainder !== 0) {
							const padLength = 8 - remainder;
							maskInstructions.push({type: '0', length: padLength});
							totalMaskBits += padLength;
						}

						const headerBytesRequired = totalMaskBits / 8;
						const headerSize = splitCfg.headerSize || 0;
						const footerSize = splitCfg.footerSize || 0;
						const multiplier = splitCfg.multiplier || 1;

						let currentOffset = 0;
						const parsedChunks = [];

						while (currentOffset < stringHex.length) {
							const remainingHex = stringHex.slice(Math.max(0, currentOffset));
							const requiredHexCharsForHeader = headerBytesRequired * 2;

							if (remainingHex.length < requiredHexCharsForHeader) {
								break;
							}

							const lengthHex = remainingHex.slice(0, Math.max(0, requiredHexCharsForHeader));

							let binaryString = '';
							for (const element of lengthHex) {
								binaryString += Number.parseInt(element, 16).toString(2).padStart(4, '0');
							}

							let extractedBits = '';
							let bitOffset = 0;
							for (const inst of maskInstructions) {
								if (inst.type === '1') {
									extractedBits += binaryString.substring(bitOffset, bitOffset + inst.length);
								}
								bitOffset += inst.length;
							}

							while (extractedBits.length % 8 !== 0) {
								extractedBits = '0' + extractedBits;
							}

							if (splitCfg.endianness === 'LE') {
								const bytes = [];
								for (let i = 0; i < extractedBits.length; i += 8) {
									bytes.push(extractedBits.substring(i, i + 8));
								}
								extractedBits = bytes.reverse().join('');
							}

							const actualLength = Number.parseInt(extractedBits, 2);
							const totalChunkBytes = headerSize + (actualLength * multiplier) + footerSize;
							const chunkHexLength = totalChunkBytes * 2;

							if (remainingHex.length < chunkHexLength || chunkHexLength === 0) {
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

						message.payload = parsedChunks.length === 1 ? parsedChunks[0] : parsedChunks;
					}
				} else {
					console.log('missing binaryMask in payloadSplitting configuration');
					message.payload = {};
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
