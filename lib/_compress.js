"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compress = void 0;
const express_intercept_1 = require("express-intercept");
const zlib = require("zlib");
const transforms = {
    br: zlib.createBrotliCompress,
    gzip: zlib.createGzip,
    deflate: zlib.createDeflate,
};
const textTypes = /^text|json|javascript|svg|xml|utf-8/i;
function compress(contentType) {
    if (!contentType)
        contentType = textTypes;
    return express_intercept_1.responseHandler()
        .for(req => !!(req.header("accept-encoding") || req.header("te")))
        .if(res => +res.statusCode === 200)
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))
        .if(res => !(res.getHeader("content-encoding") || res.getHeader("transfer-encoding")))
        .interceptStream((upstream, req, res) => {
        const acceptEncoding = match(req.header("accept-encoding"));
        const transferEncoding = match(req.header("te"));
        const transform = transforms[acceptEncoding] || transforms[transferEncoding];
        if (!transform)
            return;
        if (transforms[acceptEncoding]) {
            res.setHeader("content-encoding", acceptEncoding);
            res.removeHeader("transfer-encoding");
        }
        else if (transforms[transferEncoding]) {
            res.removeHeader("content-encoding");
            res.setHeader("transfer-encoding", transferEncoding);
        }
        res.removeHeader("content-length");
        return upstream.pipe(transform());
    });
}
exports.compress = compress;
function match(str) {
    if (/br/.test(str))
        return "br";
    if (/gzip/.test(str))
        return "gzip";
    if (/deflate/.test(str))
        return "deflate";
}
