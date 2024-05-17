"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mbusDecoder = void 0;
/*

MBUS Payload JavaScript Decoder

Copyright (C) 2019 by AllWize
Copyright (C) 2019 by Xose Pérez <xose at allwize dot io>
Copyright (C) 2024 by Havrak

The MBUSPayload library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The MBUSPayload library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the MBUSPayload library.  If not, see <http://www.gnu.org/licenses/>.
*/

// ----------------------------------------------------------------------------


// definitions with XXX have been commented out in the original code
let definitions = [
    { "name": "energy", "units": "Wh", "base": 0x00 , "size": 8, "scalar": -3},
    { "name": "energy", "units": "J", "base": 0x08, "size": 8, "scalar": 0},
    { "name": "volume", "units": "m3", "base": 0x10, "size": 8, "scalar": -6},
    { "name": "mass", "units": "kg", "base": 0x18, "size": 8, "scalar": -3},
    { "name": "on_time", "units": "s", "base": 0x20, "size": 1, "scalar": 0},
    { "name": "on_time", "units": "min", "base": 0x21, "size": 1, "scalar": 0},
    { "name": "on_time", "units": "h", "base": 0x22, "size": 1, "scalar": 0},
    { "name": "on_time", "units": "days", "base": 0x23, "size": 1, "scalar": 0},
    { "name": "operating_time", "units": "s", "base": 0x24, "size": 1, "scalar": 0},
    { "name": "operating_time", "units": "min", "base": 0x25, "size": 1, "scalar": 0},
    { "name": "operating_time", "units": "h", "base": 0x26, "size": 1, "scalar": 0},
    { "name": "operating_time", "units": "days", "base": 0x27, "size": 1, "scalar": 0},
    { "name": "power", "units": "W", "base": 0x28, "size": 8, "scalar": -3},
    { "name": "power", "units": "J/h", "base": 0x30, "size": 8, "scalar": 0},
    { "name": "volume_flow", "units": "m3/h", "base": 0x38, "size": 8, "scalar": -6},
    { "name": "volume_flow", "units": "m3/min", "base": 0x40, "size": 8, "scalar": -7},
    { "name": "volume_flow", "units": "m3/s", "base": 0x48, "size": 8, "scalar": -9},
    { "name": "mass_flow", "units": "kg/h", "base": 0x50, "size": 8, "scalar": -3},
    { "name": "flow_temperature", "units": "C", "base": 0x58, "size": 4, "scalar": -3},
    { "name": "return_temperature", "units": "C", "base": 0x5C, "size": 4, "scalar": -3},
    { "name": "temperature_difference", "units": "K", "base": 0x60, "size": 4, "scalar": -3},
    { "name": "external_temperature", "units": "C", "base": 0x64, "size": 4, "scalar": -3},
    { "name": "pressure", "units": "bar", "base": 0x68, "size": 4, "scalar": -3},
    { "name": "date", "units": "", "base": 0x6C, "size": 1, "scalar": 0}, // XXX
    { "name": "datetime", "units": "", "base": 0x6D, "size": 1, "scalar": 0}, // XXX
    { "name": "hca", "units": "", "base": 0x6E, "size": 1, "scalar": 0}, // XXX
    { "name": "avg_duration", "units": "s", "base": 0x70, "size": 1, "scalar": 0},
    { "name": "avg_duration", "units": "min", "base": 0x71, "size": 1, "scalar": 0},
    { "name": "avg_duration", "units": "h", "base": 0x72, "size": 1, "scalar": 0},
    { "name": "avg_duration", "units": "days", "base": 0x73, "size": 1, "scalar": 0},
    { "name": "actual_duration", "units": "s", "base": 0x74, "size": 1, "scalar": 0},
    { "name": "actual_duration", "units": "min", "base": 0x75, "size": 1, "scalar": 0},
    { "name": "actual_duration", "units": "h", "base": 0x76, "size": 1, "scalar": 0},
    { "name": "actual_duration", "units": "days", "base": 0x77, "size": 1, "scalar": 0},
    { "name": "fabrication_number", "units": "", "base": 0x78, "size": 1, "scalar": 0},
    { "name": "bus_address", "units": "", "base": 0x7A, "size": 1, "scalar": 0},
    { "name": "credit", "units": "", "base": 0xFD00, "size": 4, "scalar": -3},
    { "name": "debit", "units": "", "base": 0xFD04, "size": 4, "scalar": -3},
    { "name": "access_number", "units": "", "base": 0xFD08, "size": 1, "scalar": 0},
    { "name": "medium", "units": "", "base": 0xFD09, "size": 1, "scalar": 0}, // XXX
    { "name": "manufacturer", "units": "", "base": 0xFD0A, "size": 1, "scalar": 0},
    { "name": "parameter_set_id", "units": "", "base": 0xFD0B, "size": 1, "scalar": 0}, // XXX
    { "name": "model_version", "units": "", "base": 0xFD0C, "size": 1, "scalar": 0},
    { "name": "hardware_version", "units": "", "base": 0xFD0D, "size": 1, "scalar": 0},
    { "name": "firmware_version", "units": "", "base": 0xFD0E, "size": 1, "scalar": 0},
    { "name": "software_version", "units": "", "base": 0xFD0F, "size": 1, "scalar": 0}, // XXX
    { "name": "customer_location", "units": "", "base": 0xFD10, "size": 1, "scalar": 0}, // XXX
    { "name": "customer", "units": "", "base": 0xFD11, "size": 1, "scalar": 0},
    { "name": "access_code_user", "units": "", "base": 0xFD12, "size": 1, "scalar": 0},  // XXX
    { "name": "access_code_operator", "units": "", "base": 0xFD13, "size": 1, "scalar": 0},  // XXX
    { "name": "access_code_sysop", "units": "", "base": 0xFD14, "size": 1, "scalar": 0},  // XXX
    { "name": "access_code_developer", "units": "", "base": 0xFD15, "size": 1, "scalar": 0},  // XXX
    { "name": "password", "units": "", "base": 0xFD16, "size": 1, "scalar": 0},  // XXX
    { "name": "error_flags", "units": "", "base": 0xFD17, "size": 1, "scalar": 0},
    { "name": "error_mask", "units": "", "base": 0xFD18, "size": 1, "scalar": 0},
    { "name": "digital_output", "units": "", "base": 0xFD1A, "size": 1, "scalar": 0},
    { "name": "digital_input", "units": "", "base": 0xFD1B, "size": 1, "scalar": 0},
    { "name": "baudrate", "units": "bps", "base": 0xFD1C, "size": 1, "scalar": 0},
    { "name": "response_delay_time", "units": "", "base": 0xFD1D, "size": 1, "scalar": 0},
    { "name": "retry", "units": "", "base": 0xFD1E, "size": 1, "scalar": 0},
    { "name": "generic", "units": "", "base": 0xFD3C, "size": 1, "scalar": 0},
    { "name": "volts", "units": "V", "base": 0xFD40, "size": 16, "scalar": -9},
    { "name": "amperes", "units": "A", "base": 0xFD50, "size": 16, "scalar": -12},
    { "name": "reset_counter", "units": "", "base": 0xFD60, "size": 16, "scalar": -12},
    { "name": "cumulation_counter", "units": "", "base": 0xFD61, "size": 16, "scalar": -12},
    { "name": "energy", "units": "Wh", "base": 0xFB00, "size": 2, "scalar": 5},
    { "name": "energy", "units": "J", "base": 0xFB08, "size": 2, "scalar": 8},
    { "name": "volume", "units": "m3", "base": 0xFB10, "size": 2, "scalar": 2},
    { "name": "mass", "units": "kg", "base": 0xFB18, "size": 2, "scalar": 5},
    { "name": "volume", "units": "ft3", "base": 0xFB21, "size": 1, "scalar": -1},
    { "name": "volume", "units": "gal", "base": 0xFB22, "size": 2, "scalar": -1},
    { "name": "volume_flow", "units": "gal/min", "base": 0xFB24, "size": 1, "scalar": -3},
    { "name": "volume_flow", "units": "gal/min", "base": 0xFB25, "size": 1, "scalar": 0},
    { "name": "volume_flow", "units": "gal/h", "base": 0xFB26, "size": 1, "scalar": 0},
    { "name": "power", "units": "W", "base": 0xFB28, "size": 2, "scalar": 5},
    { "name": "power", "units": "J/h", "base": 0xFB30, "size": 2, "scalar": 8},
    { "name": "flow_temperature", "units": "F", "base": 0xFB58, "size": 4, "scalar": -3},
    { "name": "return_temperature", "units": "F", "base": 0xFB5C, "size": 4, "scalar": -3},
    { "name": "temperature_difference", "units": "F", "base": 0xFB60, "size": 4, "scalar": -3},
    { "name": "external_temperature", "units": "F", "base": 0xFB64, "size": 4, "scalar": -3},
    { "name": "temperature_limit", "units": "F", "base": 0xFB70, "size": 4, "scalar": -3},
    { "name": "temperature_limit", "units": "C", "base": 0xFB74, "size": 4, "scalar": -3},
    { "name": "max_power", "units": "W", "base": 0xFB78, "size": 8, "scalar": -3},

];

// ----------------------------------------------------------------------------

function bin2dec(stream) {
	let value = 0;
  for (let i = 0; i < stream.length; i++) {
		let byte = stream[stream.length - i - 1] & 0xFF;
		value = (value << 8) | byte;
  }
	return value;
};

function bcd2dec(stream) {
  let value = 0;
  for (let i = 0; i < stream.length; i++) {
		let byte = stream[stream.length - i - 1] & 0xFF;
		value = (value * 100) + ((byte >> 4) * 10) + (byte & 0x0F);
	}
	return value;
};


// NOTE: only long frames are parsed
function mbusDecoder(bytes) {

	// header specified on page 22
	let toReturn = {
		"l_field" : 0,
		"c_field" : 0,
		"a_field" : 0,
		"ci_field" : 0,
		"ident_number" : 0,
		"version" : 0,
		"medium" : 0,
		"access_number" : 0,
		"status" : 0,
		"signature" : 0,
		"manufacturer" : "",
		"fields": [],

	}
	if(bytes[0] != 0x68 && bytes[3] != 0x68 && bytes[bytes.length - 1] != 0x16) {
		console.log("Invalid M-Bus frame");
		return {"parsing_error": true, "error_message": "Invalid M-Bus frame"};
	}
	if(bytes[1] == 3 ){ // we are dealing with short frame
		console.log("Short frame detected");
		return {"parsing_error": true, "error_message": "Control frames parsing not supported yet"};
	}

	toReturn.l_field = bytes[1];
	toReturn.c_field = bytes[4];
	toReturn.a_field = bytes[5];
	toReturn.ci_field = bytes[6];

	// Fixed part of user data (12 bytes) as specified on page 36
	toReturn.ident_number = (bytes[7] | (bytes[8] << 8) | (bytes[9] << 16) | (bytes[10] << 24)).toString(16);

	let number = ((bytes[12] << 8)  | (bytes[11])) & 0x7FFF;
	let arr = [ (number>>10)+64,((number>>5)&31)+64,(number&31)+64];
	toReturn.manufacturer = String.fromCharCode.apply(null, arr);
	toReturn.version = bytes[13];
	toReturn.medium = bytes[14];
	toReturn.access_number = bytes[15];
	toReturn.status = bytes[16];
	toReturn.signature = bytes[17] | (bytes[18] << 8);

	let value = 0;
	// start at 0x13, skip header
	let index = 19;

	// Iterate the M-Bus Data Information Blocks, based on their Data
	while (index < bytes.length-2) { // -2 to skip checksum and stop byte
		// Decode DIF
		let dif = bytes[index++];

		/*
		Length in Bit	Code	    Meaning	        Code	Meaning
		0	            0000	    No data	        1000	Selection for Readout
		8	            0001	    8 Bit Integer	  1001	2 digit BCD
		16	          0010	    16 Bit Integer	1010	4 digit BCD
		24	          0011	    24 Bit Integer	1011	6 digit BCD
		32	          0100	    32 Bit Integer	1100	8 digit BCD
		32 / N	      0101	    32 Bit Real	    1101	variable length
		48	          0110	    48 Bit Integer	1110	12 digit BCD
		64	          0111	    64 Bit Integer	1111	Special Functions
		*/
		let bcd = ((dif & 0x08) === 0x08);
		let len = (dif & 0x07);

		if ((len < 1) || (4 < len)) { // TODO: Extend parsing to all formats
			console.log("Unsupported coding: " + (dif & 0x0F));
			//return {"parsing_error": true, "error_message": "Unsupported coding: " + (dif & 0x0F)};
		}

		// Get VIF(E)
		let vif = 0;
		do {
			if (index === bytes.length) {
				console.log("Buffer overflow");
				return {"parsing_error": true, "error_message": "Buffer overflow"};
			}
			vif = (vif << 8) | bytes[index++];
		} while ((vif & 0x80) === 0x80);

		// Find definition
		let def = -1;
		for (let i = 0; i < definitions.length; i++) {
			let tmp = definitions[i];
			if ((tmp.base <= vif) && (vif < (tmp.base + tmp.size))) {
				def = i;
				break;
			}
		}

		if (def < 0){
			console.log("Unsupported VIF: " + vif.toString(16));
			toReturn.fields.push({
				"index": toReturn.fields.length + 1,
				"vif": vif.toString(16),
				"name": "Unsupported VIF",
				"units":  "err",
				"value": 0
			});
			continue;
		}

		let definition = definitions[def];

		// Check buffer overflow
		if (index + len > bytes.length){
			console.log("Buffer overflow");
			return {"parsing_error": true, "error_message": "Buffer overflow"};
		}

		// Read value
		switch (true) {
			case (definition.base == 0xFD0A): // convert Manufacturer ID to ASCII
				break;
			case (bcd == true):
				value = bcd2dec(bytes.slice(index, index + len));
				break;
			default:
				value = bin2dec(bytes.slice(index, index + len));
				break;
		}
		index += len;

		// Scaled value
		let scalar = definition.scalar + vif - definition.base;
		let scaled = value * Math.pow(10, scalar);

		// Add field
		toReturn.fields.push({
			"index": toReturn.fields.length + 1,
			"vif": vif.toString(16),
			"name": definition.name,
			"units":  definition.units,
			"value": scaled
		});

	}
	console.log("mbusDecoder: ", toReturn);
	return toReturn;
};


exports.mbusDecoder = mbusDecoder;

//# sourceMappingURL=mbus.js.map

