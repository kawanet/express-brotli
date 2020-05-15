// _decompress.ts

import {RequestHandler} from "express";
import {responseHandler} from "express-intercept";
import {Transform} from "stream";
import * as zlib from "zlib";

const transforms = {
    br: zlib.createBrotliDecompress,
    gzip: zlib.createGunzip,
    deflate: zlib.createInflate,
} as { [encoding: string]: () => Transform };

export function _decompress(contentType: RegExp): RequestHandler {
    return responseHandler()

        // decompress only for types specified
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))

        // decompress only when compressed
        .if(res => !!(matchFirst(transforms, res.getHeader("content-encoding"))))

        // perform decompress
        .interceptStream((upstream, req, res) => {
            const encoding = matchFirst(transforms, res.getHeader("content-encoding"));
            const transform = transforms[encoding];
            res.removeHeader("content-encoding");
            res.removeHeader("content-length");
            return upstream.pipe(transform());
        });
}

function matchFirst<T>(map: { [key: string]: T }, key: any): string {
    return String(key).split(/\W+/).filter(e => !!map[e]).shift();
}
