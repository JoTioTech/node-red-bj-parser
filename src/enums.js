"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_PATH_TYPE = exports.SET_ACTION_ENUM = exports.ExeTypeReverse = exports.ExeType = void 0;
var ExeType;
(function (ExeType) {
    ExeType[ExeType["ANY"] = 0] = "ANY";
    ExeType[ExeType["INT"] = 1] = "INT";
    ExeType[ExeType["BIN"] = 2] = "BIN";
    ExeType[ExeType["BOOL"] = 3] = "BOOL";
    ExeType[ExeType["STRING"] = 4] = "STRING";
    ExeType[ExeType["PATH"] = 5] = "PATH";
    ExeType[ExeType["FLOAT"] = 6] = "FLOAT";
		ExeType[ExeType["JSON"] = 7] = "JSON";
})(ExeType = exports.ExeType || (exports.ExeType = {}));
exports.ExeTypeReverse = [
    "ANY",
    "INT",
    "BIN",
    "BOOL",
    "STRING",
    "PATH",
		"FLOAT",
		"JSON",
];
var SET_ACTION_ENUM;
(function (SET_ACTION_ENUM) {
    SET_ACTION_ENUM[SET_ACTION_ENUM["SET_UPDATE"] = 0] = "SET_UPDATE";
    SET_ACTION_ENUM[SET_ACTION_ENUM["INCREMENT"] = 1] = "INCREMENT";
    SET_ACTION_ENUM[SET_ACTION_ENUM["APPEND"] = 2] = "APPEND";
    SET_ACTION_ENUM[SET_ACTION_ENUM["NO_ACTION"] = 3] = "NO_ACTION";
})(SET_ACTION_ENUM = exports.SET_ACTION_ENUM || (exports.SET_ACTION_ENUM = {}));
var JSON_PATH_TYPE;
(function (JSON_PATH_TYPE) {
    JSON_PATH_TYPE[JSON_PATH_TYPE["OBJECT"] = 0] = "OBJECT";
    JSON_PATH_TYPE[JSON_PATH_TYPE["ARR"] = 1] = "ARR";
})(JSON_PATH_TYPE = exports.JSON_PATH_TYPE || (exports.JSON_PATH_TYPE = {}));
//# sourceMappingURL=enums.js.map

