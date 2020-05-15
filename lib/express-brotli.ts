// express-brotli.ts

import {RequestHandler} from "express";
import {responseHandler} from "express-intercept";
import {Transform} from "stream";
import * as zlib from "zlib";

const textTypes = /^text|json|javascript|svg|xml|utf-8/i;

const decompressers = {
    br: zlib.createBrotliDecompress,
    gzip: zlib.createGunzip,
    deflate: zlib.createInflate,
} as { [encoding: string]: () => Transform };

const compressers = {
    br: zlib.createBrotliCompress,
    gzip: zlib.createGzip,
    deflate: zlib.createDeflate,
} as { [encoding: string]: () => Transform };

/**
 * Returns an RequestHandler to compress the Express.js response stream.
 * It performs compression only for text-ish `Content-Type`s which includes `/^text|json|javascript|svg|xml|utf-8/i` per default.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response headers.
 */

export function compress(contentType?: RegExp): RequestHandler {
    if (!arguments.length) contentType = textTypes;

    return responseHandler()

        // Accept-Encoding: or TE: required
        .for(req => !!matchFirst(compressers, req.header("accept-encoding")))

        // compress only when OK
        .if(res => +res.statusCode === 200)

        // skip when Content-Length: 0 specified
        .if(res => +res.getHeader("content-length") !== 0)

        // comppress only for types specified
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))

        // ignore when the response is already compressed
        .if(res => !(matchFirst(compressers, res.getHeader("content-encoding"))))

        .interceptStream((upstream, req, res) => {
            const encoding = matchFirst(compressers, req.header("accept-encoding"));
            const transform = compressers[encoding];
            res.setHeader("content-encoding", encoding);
            res.removeHeader("content-length");
            return upstream.pipe(transform());
        });
}

/**
 * Returns an RequestHandler to decompress the Express.js response stream.
 * It performs decompression for any `Content-Type`s if `contentType` parameter is not specified.
 * It supports `Accept-Encoding` request header and `Content-Encoding` response headers.
 */

export function decompress(contentType?: RegExp): RequestHandler {
    return responseHandler()

        // decompress only for types specified
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))

        // decompress only when compressed
        .if(res => !!(matchFirst(decompressers, res.getHeader("content-encoding"))))

        // perform decompress
        .interceptStream((upstream, req, res) => {
            const encoding = matchFirst(decompressers, res.getHeader("content-encoding"));
            const transform = decompressers[encoding];
            res.removeHeader("content-encoding");
            res.removeHeader("content-length");
            return upstream.pipe(transform());
        });
}

function matchFirst<T>(map: { [key: string]: T }, key: any): string {
    return String(key).split(/\W+/).filter(e => !!map[e]).shift();
}
