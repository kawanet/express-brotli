// express-brotli.ts

import {RequestHandler} from "express";
import {responseHandler} from "express-intercept";

const textTypes = /^text|json|javascript|svg|xml|utf-8/i;

const encodings = /(^|\W)(br|gzip|deflate)(\W|$)/;

/**
 * Returns an RequestHandler to compress the Express.js response stream.
 * It performs compression only for text-ish `Content-Type`s which includes `/^text|json|javascript|svg|xml|utf-8/i` per default.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response header.
 */

export function compress(contentType?: RegExp): RequestHandler {
    if (!arguments.length) contentType = textTypes;

    return responseHandler()

        // Accept-Encoding: required
        .for(req => encodings.test(String(req.header("accept-encoding"))))

        // compress only when OK
        .if(res => +res.statusCode === 200)

        // skip when Content-Length: 0 specified
        .if(res => +res.getHeader("content-length") !== 0)

        // comppress only for types specified
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))

        // skip when the response is already compressed
        .if(res => !encodings.test(String(res.getHeader("content-encoding"))))

        .compressResponse();
}

/**
 * Returns an RequestHandler to decompress the Express.js response stream.
 * It performs decompression for any `Content-Type`s if `contentType` parameter is not specified.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response header.
 */

export function decompress(contentType?: RegExp): RequestHandler {
    return responseHandler()

        // decompress only for types specified
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))

        // decompress only when compressed
        .if(res => encodings.test(String(res.getHeader("content-encoding"))))

        // perform decompress
        .decompressResponse();
}
