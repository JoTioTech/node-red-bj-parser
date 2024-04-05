const parserModule = __importDefault(require('./src/BJ_parser'));
const parserSchemaModule = require('./src/parseSchema');

module.exports = function (RED) {
	function ParserNode(config) {
		RED.nodes.createNode(this, config);
		const parserConfig = {
            	supressHeader: config.supresedLogs
            		.toUpperCase()
            		.split(',')
            		.map(value => value.trim()),
            	maxStrLenght: config.maxBinLen,
            	binAsHex: true,
            	directToConsole: false,
		};

		this.on('input', message_ => {
			const stringHex = message_.payload;
			const schema = parserSchemaModule.parseRuleMap(message_.parsingSchema);
			const parser = new parserModule.default(schema, parserConfig);

			message_.payload = parser.runHexAndWrap(stringHex);
			this.send(message_);
		});
	}

	RED.nodes.registerType('BJ-parser', ParserNode);
};
