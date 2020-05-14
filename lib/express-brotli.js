"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompressTE = exports.decompress = exports.compressTE = exports.compress = void 0;
const _compress_1 = require("./_compress");
const _decompress_1 = require("./_decompress");
const textTypes = /^text|json|javascript|svg|xml|utf-8/i;
function compress(contentType) {
    if (!arguments.length)
        contentType = textTypes;
    return _compress_1._compress(contentType, "accept-encoding", "content-encoding");
}
exports.compress = compress;
function compressTE(contentType) {
    if (!arguments.length)
        contentType = textTypes;
    return _compress_1._compress(contentType, "te", "transfer-encoding");
}
exports.compressTE = compressTE;
function decompress(contentType) {
    return _decompress_1._decompress(contentType, "accept-encoding", "content-encoding");
}
exports.decompress = decompress;
function decompressTE(contentType) {
    return _decompress_1._decompress(contentType, "te", "transfer-encoding");
}
exports.decompressTE = decompressTE;
