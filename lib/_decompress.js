"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompress = void 0;
const express_intercept_1 = require("express-intercept");
const zlib = require("zlib");
const transforms = {
    br: zlib.createBrotliDecompress,
    gzip: zlib.createGunzip,
    deflate: zlib.createInflate,
};
function decompress(contentType) {
    return express_intercept_1.responseHandler()
        .if(res => +res.statusCode === 200)
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))
        .if(res => !!(res.getHeader("content-encoding") || res.getHeader("transfer-encoding")))
        .interceptStream((upstream, req, res) => {
        const contentEncoding = match(res.getHeader("content-encoding"));
        const transferEncoding = match(res.getHeader("transfer-encoding"));
        const transform = transforms[contentEncoding] || transforms[transferEncoding];
        if (!transform)
            return;
        res.removeHeader("content-encoding");
        res.removeHeader("transfer-encoding");
        res.removeHeader("content-length");
        return upstream.pipe(transform());
    });
}
exports.decompress = decompress;
function match(str) {
    if (/br/.test(str))
        return "br";
    if (/gzip/.test(str))
        return "gzip";
    if (/deflate/.test(str))
        return "deflate";
}
