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

export function _decompress(contentType: RegExp, requestKey: string, responseKey: string): RequestHandler {
    return responseHandler()

        // decompress only for types specified
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))

        // decompress only when compressed
        .if(res => !!(matchFirst(transforms, res.getHeader(responseKey))))

        // perform decompress
        .interceptStream((upstream, req, res) => {
            const encoding = matchFirst(transforms, res.getHeader(responseKey));
            const transform = transforms[encoding];
            res.removeHeader(responseKey);
            res.removeHeader("content-length");
            return upstream.pipe(transform());
        });
}

function matchFirst<T>(map: { [key: string]: T }, key: any): string {
    return String(key).split(/\W+/).filter(e => !!map[e]).shift();
}
