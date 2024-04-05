"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRuleMap = void 0;
const enums_1 = require("./enums");
const errors_1 = require("./errors");
function parseRuleMap(root) {
    if (typeof root !== "object" || typeof root.rule !== "object")
        throw new errors_1.ParsingError("-", "no rule");
    if (typeof root.rule.root !== "object")
        throw new errors_1.ParsingError("-", "no root rule");
    const ret = {
        name: root.name || "",
        version: root.version || "",
        schemaVersion: root.schemaVersion || "1.0",
        rule: {}
    };
    Object.keys(root.rule).forEach(rName => {
        try {
            ret.rule[rName] = parseRule(root.rule[rName], root.rule);
        }
        catch (e) {
            throw new errors_1.ParsingError(rName, e.toString());
        }
    });
    return ret;
}

exports.parseRuleMap = parseRuleMap;
const SetActionMap = {
    "SET": enums_1.SET_ACTION_ENUM.SET_UPDATE,
    "ADD": enums_1.SET_ACTION_ENUM.INCREMENT,
    "APPEDN": enums_1.SET_ACTION_ENUM.APPEND
};
function isInvalidSetAction(val) {
    return (val && SetActionMap[val] === undefined);
}
function parseRule(rule, ruleMap) {
    if (typeof rule !== "object")
        throw new Error("not a valid rule schema");
    if (typeof rule.next !== "string")
        throw new Error("no next atribute");
    const newRule = {
        set: [],
        subParsing: [],
        valMask: rule.valMask || null,
        next: rule.next,
    };
    if (rule.set)
        newRule.set = rule.set.map((set, setId) => {
            if (!Array.isArray(set.type) && typeof set.val !== "string")
                throw new Error(`no val atribute in set array with index ${setId}`);
            if (isInvalidSetAction(set.action))
                throw new Error(`not valid action atribute in set array with index ${setId}`);
            if (typeof set.target !== "string")
                throw new Error(`no target atribute in set array with index ${setId}`);
            const typeList = (Array.isArray(set.type)) ? set.type.map((type, typeId) => {
                if (!type.val)
                    throw new Error(`no val atribute in set array with index ${setId} in type array with index ${typeId}`);
                if (isInvalidSetAction(type.action))
                    throw new Error(`not valid action atribute in set array with index ${setId} in type array with index ${typeId}`);
                return {
                    selector: type.selector || true,
                    action: type.action ? SetActionMap[type.action] : enums_1.SET_ACTION_ENUM.SET_UPDATE,
                    val: type.val,
                };
            }) : [{
                    selector: true,
                    action: set.action ? SetActionMap[set.action] : enums_1.SET_ACTION_ENUM.SET_UPDATE,
                    val: set.val,
                }];
            return {
                valMask: set.valMask || null,
                target: set.target,
                single: set.single || false,
                type: typeList
            };
        });
    if (rule.subParsing) {
        let lastMask;
        newRule.subParsing = rule.subParsing.map((sub, subId) => {
            if (!ruleMap[sub.targetRule])
                throw new Error(`not valid targetRule atribute in subParsing array with index ${subId}`);
            if (typeof sub.subMask !== "string")
                throw new Error(`no subMask atribute in subParsing array with index ${subId}`);
            const breakVal = sub.break !== undefined ? sub.break : sub.repeat !== undefined ? !sub.repeat : (sub.repeatMax === undefined && sub.repeatMaxGlob === undefined);
            const ret = {
                valMask: (lastMask === sub.valMask) ? true : (sub.valMask || null),
                selector: sub.selector || true,
                targetRule: sub.targetRule,
                chroot: sub.chroot || "",
                subMask: sub.subMask,
                newIn: sub.newVal || null,
                repeatMax: sub.repeatMax || -1,
                repeatMaxGlob: sub.repeatMaxGlob || -1,
                break: breakVal
            };
            lastMask = sub.valMask;
            return ret;
        });
    }
    return newRule;
}
//# sourceMappingURL=parseSchema.js.map
