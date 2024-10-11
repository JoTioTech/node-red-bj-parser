# BJ parser
- parser form binary to simple json format

## FIXES
- $val variable does not always work in set action, behavior is not consistent
- improper handling of repeat will lead to infinite loop and crash of whole Node-RED

## ROOT
- list all all rules
- **global scope** for rule name

#### Attributes

- name
	- OPTIONAL; default: ""
	- only for login purpose
- version
	- OPTIONAL; default: ""
	- only for login purpose
- schemaVersion
	- OPTIONAL; default: "1.0"
- rule:
		- see RULE

#### Structure

```
{
		name: <STRING>,
		version: <STRING>,
		schemaVersion: <STRING>,
		rule: <RULE>
}
```

#### Example

```
{
		rule: {
			 A: ...,
			 B: ...
		}
}
```

## RULE

- base node structure responsible for part of incoming message

#### Attributes

- set
	- see RULE.SET,
- subParsing
	- see RULE.SUBPARSING,
- valMask:
	- OPTIONAL;
	- mask for $val variable in next
- next: <RULE.NEXT>
	- OPTIONAL; default: return $in
	- define witch portion of *in_bin* will be returned from this rule
	- VAR: $in, $val,	$len

#### Structure

```
<STRING-rule name>: {
		set: <RULE.SET>,
		subParsing: <RULE.SUBPARSING>,
		valMask: <MASK_EXP>
		next: <MASK_EXP>
}
```

#### Example

```
 A: {
		set: ...,
		subParsing: ...,
		valMask:
		next: ...
}
```


## RULE.SET

- set parameters in *out_json*

#### Attributes (in array element)
- valMask
	- WARN: Does not work, sometimes error of val not existing is thrown
	- VAR: $in, $len
	- mask for $val variable
- target
	- path in *out_json*, where value will be written
- type
	- OPTIONAL; default: use values from *action*, *val*
	- list of available valu (multiple elements can be executed)
- type.selector
	- OPTIONAL; default: TRUE (works as else)
	- VAR: $in, $val, $len
	- if true, element will be executed
- type.action
	- OPTIONAL; default: SET
	- action performed on atribute in json
- type.val
	- VAR: $in, $val, $len
	- value for action
- single
	- OPTIONAL; default: FALSE
	- has meaning only if *type* is set
	- if true, only fist selected value with executed
- action
	- OPTIONAL; default: SET
	- interpreted only if
	- action performed on atribute in json
- val
	- OPTIONAL; default: use values from *type*
	- will be executed only if type is not set
	- VAR: $in, $val, $len
	- value for action

#### Structure

```
{
		valMask: <MASK_EXP>,
		target: <JSON_PATH>,
		single: <BOOL>,
		type:
		{
				selector: <BOOL_EXP>,
				action: <SET_ACTION_ENUM>,
				val: <ANY_EXP>
		}[],
		action: <SET_ACTION_ENUM>,
		val: <ANY_EXP>
}[]

```

#### Example

```
[
		{
				valMask: "0(12 + 1)1(3)",
				target: "perName",
				type: [
						{
								selector: "@eql($val, 0)",
								action: "SET",
								val: "'INTERNAL'"
						},
						{
								selector: "@eql($val, 1)",
								action: "SET",
								val: "'A'"
						}
				]
		}
]
```


## RULE.SUBPARSING

- parse next part of *in_bin*

#### Attributes (in array element)

- valMask
	- OPTIONAL
	- VAR: $in, $i, $len
	- mask for $val variable
- selector
	- OPTIONAL; default: TRUE (works as else)
	- VAR: $in, $i, $val, $len
	- if true, element will be executed
- targetRule
	- rule, that will be executed
- chroot
	- OPTIONAL; default: ""
	- VAR: $i, $val
	- path to new root path in *out_json* in *sub rule*
- subMask
	- binary that will be passed to *sub rule*
	- VAR: $in, $i, $len
- newIn
	- OPTIONAL; default: $ret
	- VAR: $in, $i, $len, $ret, $rvser
	- binary that will become new $in variable
- repeatMax
	- OPTIONAL; default: InF
	- skip this subrule, if number of times **this subrule** was already called is greater or equal of this value (in this subparsing, in this call)
- repeatMaxGlob
	- OPTIONAL; default: InF
	- skip this subrule, if number of times **any subrule** was already called is greater or equal of this value (in this subparsing, in this call)
- repeat
	- OPTIONAL; default: FALSE (if repeatMax or repeatMaxGlob are set)
	- do not break after subrule is executed

#### Structure

```
{
		valMask: <MASK_EXP>,
		selector: <BOOL_EXP>,
		targetRule: <STRING-rule name>,
		chroot: <JSON_PATH>,
		subMask: <MASK_EXP>,
		newIn: <BIN_EXP>,
		repeatMax: <INT>,
		repeatMaxGlob: <INT>,
		repeat: <BOOL>
}[]
```

#### Example

```
[
		{
				valMask: "0(8)1(4)",
				selector: "@eql($val, 2)",
				subMask: "0(16)1($len)",
				newIn: "@maskB('1(16)', $in) : $ret",
				targetRule: "parsUTC_root",
				chroot: "timestamp",
				repeat: true,
				repeatMax: 1
		},
		{
				valMask: "1(8)",
				selector: "@eql($val, 0x01)",
				subMask: "0(16)1($len)",
				newIn: "$rvsub : $ret",
				targetRule: "temp",
				repeat: false
		}
]
```

## MASK_EXP

- expression that will be expanded to binary mask
- if expression is shorter than input msg, remaining bit of input will be ignored
- if expression is longer than input msg, excessive bits of expression will be ignored
- sequence of 1 or 0 characters, expression in bracket will be evaluated as <NUM_EXP> and will use previous character that many times

#### Example

```
"0(8)1100(0)1($len)" // expands to "0000000011011111111..."
```

## JSON_PATH

- define path to in json tree
- *..*, *.* can be used

#### Example

```
"./A/B/B/.././C[$i][2*3]" // expands to A/B/C( as array )/${i}( as array )/6
```


## SET_ACTION_ENUM

- SET
	- create new atribute (if exist error)
- ADD
	- += (if do not exist, init whit 0)
- APPEND
	- add element to list (if do not exist, init with [])
- NO_ACTION
	- do nothing just evaluate val
	- to be used with functions setting custom variables or working with arrays
	- when NO_ACTION is used target doesn't have to be set if it is it will remain uninitialized


## Variable

- val
	- type: int
	- default: -1
	- resulting integer from valMask atribute
- len
	- type: int
	- deprecated
	- OLD: ~~number of bits in *in_bin*~~
	- NEW: -1
- in
	- type: binary
	- full binary in current rule
	- will be rewritten after *sub rule* **completely finish** (in will become value from newIn atr)
- i
	- type: int
	- number of *sub rule* are already **complete finished** in current rule
	- counting from 0
- ret
	- type: binary
	- value returned from *sub rule* from next atribute
- user can define any custom variable
	- WARN: responsible use is encouraged as they are stored in global scope - thus they will not be cleared by default after each message
	- WARN: periodic clearing of them is recommended to avoid cluttering memory (use clearArray function)
	- prefer use of common variables like `custom1`, `custom2`, `custom3`
	- type: int
	- custom variables, can be set by setCustomVar function
	- to access custom variable use `$<variable name>`,


## StD Variable

- true: true (boolean)
- false: false (boolean)
- nan: NaN (number)
- null: null (any)

## Operators

- \+, \-, \*, \\
	- std. math operators (not for string)
- (...)
	- std. bracket
- &, |
	- **not implemented**
	- bin and, or
- :
	- binary concat
- &&, ||
	- std bool operators
- ==, >, >=, <, <=
	- std bool operators

## Functions
- eql
	- RET: <BOOL>
	- ATR: <ANY>, <ANY>
	- js: ===
- more
	- RET: <BOOL>
	- ATR: <ANY>, <ANY>
	- js: >
- less
	- RET: <BOOL>
	- ATR: <ANY>, <ANY>
	- js: <
- toBool
	- RET: <BOOL>
	- ATR: <ANY>
	- if empty or 0 => false, else true
- toInt16
	- RET: <NUM>
	- ATR: <NUM>
	- convert to signed 16bit integer
- toUInt16LE
	- RET: <NUM>
	- ATR: <NUM>
	- convert to unsigned 16bit integer, little endian
- toInt16LE
	- RET: <NUM>
	- ATR: <NUM>
	- convert to signed 16bit integer, little endian
- toInt24
	- RET: <NUM>
	- ATR: <NUM>
	- convert to signed 24bit integer
- toUInt24LE
	- RET: <NUM>
	- ATR: <NUM>
	- convert to unsigned 24bit integer, little endian
- toInt24LE
	- RET: <NUM>
	- ATR: <NUM>
	- convert to signed 24bit integer, little endian
- toInt32
	- RET: <NUM>
	- ATR: <NUM>
	- convert to signed 32bit integer
- toUInt32LE
	- RET: <NUM>
	- ATR: <NUM>
	- convert to unsigned 32bit integer, little endian
- toInt32LE
	- RET: <NUM>
	- ATR: <NUM>
	- convert to signed 32bit integer, little endian
- toFloat16
	- RET: <NUM>
	- ATR: <NUM>
	- convert to 16bit float
- toFloat16LE
	- RET: <NUM>
	- ATR: <NUM>
	- convert to 16bit float, little endian order
- toFloat
	- RET: <NUM>
	- ATR: <NUM>
	- convert to 32bit float
- toFloatLE
	- RET: <NUM>
	- ATR: <NUM>
	- convert to 32bit float, little endian order
- toIntBCD2Digit
	- RET: <NUM>
	- ATR: <NUM>
	- convert to integer from 2 digit BCD (8bit number)
- toIntBCD4Digit
	- RET: <NUM>
	- ATR: <NUM>
	- convert to integer from 4 digit BCD (16bit number)
- toIntBCD6Digit
	- RET: <NUM>
	- ATR: <NUM>
	- convert to integer from 6 digit BCD (24bit number)
- toIntBCD8Digit
	- RET: <NUM>
	- ATR: <NUM>
	- convert to integer from 8 digit BCD (32bit number)
- toIntBCD10Digit
	- RET: <NUM>
	- ATR: <NUM>
	- convert to integer from 10 digit BCD (40bit number)
- toIntBCD12Digit
	- RET: <NUM>
	- ATR: <NUM>
	- convert to integer from 12 digit BCD (48bit number)
- toUtf8
	- RET: <NUM>
	- ATR: <ANY>
	- convert bin to string (if binary do not have whole number of bits pass **end** with zeros)
- mask
	- RET: <NUM>
	- ATR: <MASK_EXP>, <BIN>
	- apply mask to binary and returns number
- maskB
	- RET: <BIN>
	- ATR: <MASK_EXP>, <BIN>
	- apply mask to binary and returns binary
- getAtr
	- RET: <ANY>
	- ATR: <JSON_PATH>
	- **not implemented**
	- get atribute from *out_json*
- twoComplement2Byte
	- RET: <NUM>
	- ATR: <NUM>
	- convert to two complement 2 byte number
- twoComplement3Byte
	- RET: <NUM>
	- ATR: <NUM>
	- convert to two complement 3 byte number
- twoComplement4Byte
	- RET: <NUM>
	- ATR: <NUM>
	- convert to two complement 4 byte number
- parseUTC_5b
	- RET: <STRING>
	- ATR: <STRING>
	- std conversion
- toHex
	- RET: <STRING>
	- ATR: <MASK_EXP> <BIN>
	- convert binary in ranges specified by mask to hex string
	- WARN: alway pick length in mask divisible by 8
- parseMBUS
	- RET: <STRING>
	- ATR: <MASK_EXP> <BIN>
	- parse given part of message as MBUS message, only long frame is supported and header must be included
- toIMEI
  - RET: <STRING>
	- ATR: <MASK_EXP> <BIN>
	- interprets given sector as IMEI number
- toMBUSManufacturerID
  - RET: <STRING>
	- ATR: <NUM>
	- convert manufacturer ID to it's string form
- toAscii
	- RET: <STRING>
	- ATR: <MASK_EXP> <BIN>
	- convert binary in ranges specified by mask to ascii string
	- WARN: alway pick length in mask divisible by 8
- clearArray
	- RET: <0>
	- ATR: <STRING>
	- clears given global array with given name
	- NOTE: as arrays are internally stored in global scope they will not be cleared after each message
- pushToArray
	- RET: <0>
	- ATR: <STRING> <ANY>
	- push given value to global array with given name
	- NOTE: as arrays are internally stored in global scope they will not be cleared after each message


## Custom variable functions
WARN use with caution and responsibly

- setCustomVar
	- RET: <INT>
	- ATR: <STRING> <INT>
	- set custom variable to given integer value
	- NOTE: as custom variables are internally stored in global scope they will not be cleared after each message
- clearCustomVar
	- RET: <0>
	- ATR: <STRING>
	- clear custom variable with given name
	- NOTE: as custom variables are internally stored in global scope they will not be cleared after each message
- clearCustomVariables
	- RET: <0>
	- ATR: <0>
	- clear all custom variables
	- NOTE: as custom variables are internally stored in global scope they will not be cleared after each message
- getLength
	- RET: <INT>
	- ATR: <STRING> <STRING> <BIN>
	- get length of binary with given mask (argument 1) applied, output is stored in custom variable with given name (argument 2)
	- NOTE: as arrays are internally stored in global scope they will not be cleared after each message
- loadLastArrayElementToCustomVar
	- RET: <0>
	- ATR: <STRING> <STRING>
	- load last element of global array (name in first argument) with given name to custom variable
	- element is removed from array
	- NOTE: as arrays are internally stored in global scope they will not be cleared after each message
- removeLastArrayElement
	-	RET: <ANY>
	- ATR: <STRING>
	- returns last element in array and removes it from array
	- NOTE: as arrays are internally stored in global scope they will not be cleared after each message
- loadFirstArrayElementToCustomVar
	- RET: <0>
	- ATR: <STRING> <STRING>
	- load first element of global array (name in first argument) with given name to custom variable
	- element is removed from array
	- NOTE: as arrays are internally stored in global scope they will not be cleared after each message
	- if you are using arrays withing your parsing schema reset it right in the beginning as the array will not be cleared after each message
- removeFirstArrayElement
	-	RET: <ANY>
	- ATR: <STRING>
	- returns first element in given array and removes it from array
	- NOTE: as arrays are internally stored in global scope they will not be cleared after each message
