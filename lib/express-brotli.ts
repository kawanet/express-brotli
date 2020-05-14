// express-brotli.ts

import {_compress} from "./_compress";
import {_decompress} from "./_decompress";
import {RequestHandler} from "express";

const textTypes = /^text|json|javascript|svg|xml|utf-8/i;

/**
 * Returns an RequestHandler to compress the Express.js response stream.
 * It performs compression only for text-ish `Content-Type`s which includes `/^text|json|javascript|svg|xml|utf-8/i` per default.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response headers.
 */

export function compress(contentType?: RegExp): RequestHandler {
    if (!arguments.length) contentType = textTypes;
    return _compress(contentType, "accept-encoding", "content-encoding");
}

/**
 * `TE` and `Transfer-Encoding` version of `compress()` method.
 * Most app developers rarely need to use this.
 */

export function compressTE(contentType?: RegExp): RequestHandler {
    if (!arguments.length) contentType = textTypes;
    return _compress(contentType, "te", "transfer-encoding");
}

/**
 * Returns an RequestHandler to decompress the Express.js response stream.
 * It performs decompression for any `Content-Type`s if `contentType` parameter is not specified.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response headers.
 */

export function decompress(contentType?: RegExp): RequestHandler {
    return _decompress(contentType, "accept-encoding", "content-encoding");
}

/**
 * `TE` and `Transfer-Encoding` version of `decompress()` method.
 * Most app developers rarely need to use this.
 */

export function decompressTE(contentType?: RegExp): RequestHandler {
    return _decompress(contentType, "te", "transfer-encoding");
}
