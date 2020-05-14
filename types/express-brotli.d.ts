import { RequestHandler } from "express";
/**
 * Returns an RequestHandler to compress the Express.js response stream.
 * It performs compression only for text-ish `Content-Type`s which includes `/^text|json|javascript|svg|xml|utf-8/i` per default.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response headers.
 */
export declare function compress(contentType?: RegExp): RequestHandler;
/**
 * `TE` and `Transfer-Encoding` version of `compress()` method.
 * Most app developers rarely need to use this.
 */
export declare function compressTE(contentType?: RegExp): RequestHandler;
/**
 * Returns an RequestHandler to decompress the Express.js response stream.
 * It performs decompression for any `Content-Type`s if `contentType` parameter is not specified.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response headers.
 */
export declare function decompress(contentType?: RegExp): RequestHandler;
/**
 * `TE` and `Transfer-Encoding` version of `decompress()` method.
 * Most app developers rarely need to use this.
 */
export declare function decompressTE(contentType?: RegExp): RequestHandler;
