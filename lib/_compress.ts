// _compress.ts

import {RequestHandler} from "express";
import {responseHandler} from "express-intercept";
import {Transform} from "stream";
import * as zlib from "zlib";

const transforms = {
    br: zlib.createBrotliCompress,
    gzip: zlib.createGzip,
    deflate: zlib.createDeflate,
} as { [encoding: string]: () => Transform };

export function _compress(contentType: RegExp): RequestHandler {
    return responseHandler()

        // Accept-Encoding: or TE: required
        .for(req => !!matchFirst(transforms, req.header("accept-encoding")))

        // compress only when OK
        .if(res => +res.statusCode === 200)

        // skip when Content-Length: 0 specified
        .if(res => +res.getHeader("content-length") !== 0)

        // comppress only for types specified
        .if(res => !contentType || contentType.test(String(res.getHeader("content-type"))))

        // ignore when the response is already compressed
        .if(res => !(matchFirst(transforms, res.getHeader("content-encoding"))))

        .interceptStream((upstream, req, res) => {
            const encoding = matchFirst(transforms, req.header("accept-encoding"));
            const transform = transforms[encoding];
            res.setHeader("content-encoding", encoding);
            res.removeHeader("content-length");
            return upstream.pipe(transform());
        });
}

function matchFirst<T>(map: { [key: string]: T }, key: any): string {
    return String(key).split(/\W+/).filter(e => !!map[e]).shift();
}
