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

		this.on('input', message_ => {
			const stringHex = message_.payload;
			// DELETE: This is just for development, all schemas should be validated beforehand
			const schema = parserSchemaModule.parseRuleMap(message_.parsingSchema);
			const parser = new parserModule.default(schema, parserConfig);

			message_.payload = parser.runHexAndWrap(stringHex);
			message_.payload.schema_info = {
				"name" : schema.name,
				"version" : schema.version,
				"schema_version" : schema.schemaVersion
			};
			this.send(message_);
		});
	}

	RED.nodes.registerType('BJ-parser', ParserNode);
};




