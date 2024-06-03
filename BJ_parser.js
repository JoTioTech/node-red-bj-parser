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
			// DELETE: This is just for development, all schemas should be validated beforehand
			const schema = parserSchemaModule.parseRuleMap(message.parsingSchema);
			const parser = new parserModule.default(schema, parserConfig);

			message.payload = parser.runHexAndWrap(stringHex);
			if(message.payload.outJson.network == undefined)	message.payload.outJson.network = {}, message.payload.outJson.network.network_type = "";
			if(message.payload.outJson.msg_type == undefined) message.payload.outJson.msg_type = "";
			if(message.payload.outJson.device_type == undefined) message.payload.outJson.device_type = "";
			if(message.payload.outJson.device_subtype == undefined) message.payload.outJson.device_subtype = "";

			message.payload.schema_info = {
				"name" : schema.name,
				"version" : schema.version,
				"schema_version" : schema.schemaVersion
			};
			this.send(message);
		});
	}

	RED.nodes.registerType('BJ-parser', ParserNode);
};




