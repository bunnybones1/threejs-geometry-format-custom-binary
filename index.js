var TextEncoder = require('text-encoding');
	zlib = require('jszlib'),
	bufferArrayTypes = require('enum-buffer-array-types');

var utf8Decoder = new TextDecoder('utf-8');

function enumName(val) {
	var typeName = 'unknown';
	Object.keys(bufferArrayTypes).forEach(function(key){
		if(bufferArrayTypes[key] === val) typeName = key;
	});
	return typeName;
}

function decodeToGeometry(buffer, inflate) {
	var lastCursor = 0;
	var cursor = 0;
	function advanceCursor(bytes) {
		lastCursor = cursor;
		cursor += bytes;
		size = cursor - lastCursor;
	}
	function sliceBuffer() {
		return buffer.slice(lastCursor, cursor);
	}

	if(inflate) buffer = zlib.inflateBuffer(buffer);
	bufferElementCountLegend = {
		'index' : 1,
		'position' : 3,
		'normal' : 3,
		'uv' : 2,
		'color' : 3,
	}
	var buffers = {};
	while(cursor < buffer.byteLength) {
		advanceCursor(4);

		var nameLengthBuffer = new Uint32Array(sliceBuffer());
		var nameLength = nameLengthBuffer[0];

		advanceCursor(nameLength);

		var nameBuffer = new Uint8Array(sliceBuffer());
		var name = utf8Decoder.decode(nameBuffer);
		if(debugLevel >= 2) console.group(name);

		advanceCursor(4);

		var payloadTypeBuffer = new Uint32Array(sliceBuffer());
		var payloadType = payloadTypeBuffer[0];
		var ArrayConstructor = bufferArrayTypes.getConstructor(payloadType);
		if(debugLevel >= 2) console.log(enumName(payloadType));

		advanceCursor(4);

		var payloadLengthBuffer = new Uint32Array(sliceBuffer());
		var payloadLength = payloadLengthBuffer[0];
		if(debugLevel >= 2) console.log('bytes', payloadLength);

		advanceCursor(payloadLength);


		var payloadBuffer = new ArrayConstructor(sliceBuffer());

		buffers[name] = payloadBuffer;
		if(debugLevel >= 2) console.groupEnd();
	}
	// interfaceUint32.read
	
	var geometry = new THREE.BufferGeometry();
	Object.keys(buffers).forEach(function(bufferName){
		var buffer = buffers[bufferName];
		var elementCount = bufferElementCountLegend[bufferName];
		if(!elementCount) throw new Error('attribute '+bufferName+' not listed in bufferElementCountLegend! Please add it.');
		geometry.addAttribute( bufferName, new THREE.BufferAttribute( buffer, elementCount ) );
	});
	// var geometry = new THREE.SphereGeometry(1, 32, 16);
	return geometry;
}
var debugLevel = 0;

decodeToGeometry.setDebugLevel = function(level) {
	debugLevel = level;
}

module.exports = decodeToGeometry;