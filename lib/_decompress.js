"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._decompress = void 0;
const express_intercept_1 = require("express-intercept");
const zlib = require("zlib");
const transforms = {
    br: zlib.createBrotliDecompress,
    gzip: zlib.createGunzip,
    deflate: zlib.createInflate,
};
function _decompress(contentType, requestKey, responseKey) {
    return express_intercept_1.responseHandler()
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))
        .if(res => !!(matchFirst(transforms, res.getHeader(responseKey))))
        .interceptStream((upstream, req, res) => {
        const encoding = matchFirst(transforms, res.getHeader(responseKey));
        const transform = transforms[encoding];
        res.removeHeader(responseKey);
        res.removeHeader("content-length");
        return upstream.pipe(transform());
    });
}
exports._decompress = _decompress;
function matchFirst(map, key) {
    return String(key).split(/\W+/).filter(e => !!map[e]).shift();
}
