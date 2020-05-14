"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._compress = void 0;
const express_intercept_1 = require("express-intercept");
const zlib = require("zlib");
const transforms = {
    br: zlib.createBrotliCompress,
    gzip: zlib.createGzip,
    deflate: zlib.createDeflate,
};
function _compress(contentType, requestKey, responseKey) {
    return express_intercept_1.responseHandler()
        .for(req => !!matchFirst(transforms, req.header(requestKey)))
        .if(res => +res.statusCode === 200)
        .if(res => +res.getHeader("content-length") !== 0)
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))
        .if(res => !(matchFirst(transforms, res.getHeader(responseKey))))
        .if(res => !(matchFirst(transforms, res.getHeader("content-encoding"))))
        .if(res => !(matchFirst(transforms, res.getHeader("transfer-encoding"))))
        .interceptStream((upstream, req, res) => {
        const encoding = matchFirst(transforms, req.header(requestKey));
        const transform = transforms[encoding];
        res.setHeader(responseKey, encoding);
        res.removeHeader("content-length");
        return upstream.pipe(transform());
    });
}
exports._compress = _compress;
function matchFirst(map, key) {
    return String(key).split(/\W+/).filter(e => !!map[e]).shift();
}
