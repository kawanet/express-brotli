"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompress = exports.compress = void 0;
const express_intercept_1 = require("express-intercept");
const textTypes = /^text|json|javascript|svg|xml|utf-8/i;
const contentEncoding = /(^|\W)(br|gzip|deflate)(\W|$)/;
const contentLengthNotZero = { test: length => length !== "0" };
const statusCodeOK = /^(200)$/;
function compress(options) {
    let { contentLength, contentType, statusCode } = options || {};
    if (!contentLength)
        contentLength = contentLengthNotZero;
    if (!contentType)
        contentType = textTypes;
    if (!statusCode)
        statusCode = statusCodeOK;
    return express_intercept_1.responseHandler()
        .if(res => !statusCode || statusCode.test(String(res.statusCode)))
        .if(res => !contentLength || contentLength.test(String(res.getHeader("content-length"))))
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))
        .if(res => !contentEncoding.test(String(res.getHeader("content-encoding"))))
        .compressResponse();
}
exports.compress = compress;
function decompress(options) {
    let { contentLength, contentType, statusCode } = options || {};
    return express_intercept_1.responseHandler()
        .if(res => !statusCode || statusCode.test(String(res.statusCode)))
        .if(res => !contentLength || contentLength.test(String(res.getHeader("content-length"))))
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))
        .if(res => contentEncoding.test(String(res.getHeader("content-encoding"))))
        .decompressResponse();
}
exports.decompress = decompress;
