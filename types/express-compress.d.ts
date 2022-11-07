import type {RequestHandler} from "express";

declare interface CompressOptions {
    contentLength?: RegExp | { test: (str: string) => boolean };
    contentType?: RegExp | { test: (str: string) => boolean };
    statusCode?: RegExp | { test: (str: string) => boolean };
}

/**
 * Returns an RequestHandler to compress the Express.js response stream.
 * It performs compression only for text-ish `Content-Type`s which includes `/^text|json|javascript|svg|xml|utf-8/i` per default.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response header.
 */
export declare const compress: (options?: CompressOptions) => RequestHandler;

/**
 * Returns an RequestHandler to decompress the Express.js response stream.
 * It performs decompression for any `Content-Type`s if `contentType` parameter is not specified.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response header.
 */
export declare const decompress: (options?: CompressOptions) => RequestHandler;
