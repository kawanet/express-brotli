// express-brotli.ts

import {RequestHandler} from "express";
import {responseHandler} from "express-intercept";

type Tester = { test: (str: string) => boolean };

const textTypes = /^text|json|javascript|svg|xml|utf-8/i;

const contentEncoding = /(^|\W)(br|gzip|deflate)(\W|$)/;

const contentLength: Tester = {test: length => +length !== 0}; // true when undefined

const statusCode = /^(200)$/;

/**
 * Returns an RequestHandler to compress the Express.js response stream.
 * It performs compression only for text-ish `Content-Type`s which includes `/^text|json|javascript|svg|xml|utf-8/i` per default.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response header.
 */

export function compress(contentType?: RegExp): RequestHandler {
    if (!arguments.length) contentType = textTypes;

    return responseHandler()

        // work only when OK
        .if(res => statusCode.test(String(res.statusCode)))

        // skip when Content-Length: 0 specified
        .if(res => contentLength.test(String(res.getHeader("content-length"))))

        // comppress only for types specified
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))

        // skip when the response is already compressed
        .if(res => !contentEncoding.test(String(res.getHeader("content-encoding"))))

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
        .if(res => contentEncoding.test(String(res.getHeader("content-encoding"))))

        // perform decompress
        .decompressResponse();
}
