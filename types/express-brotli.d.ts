import { RequestHandler } from "express";

/**
 * Returns an RequestHandler to compress the Express.js response stream.
 * It work only for text-ish `Content-Type`s which includes `/^text|json|javascript|svg|xml|utf-8/i` per default.
 */

export declare function compress(contentType?: RegExp): RequestHandler;

/**
 * Returns an RequestHandler to decompress the Express.js response stream.
 * It work for any `Content-Type`s if `contentType` parameter is not given.
 */

export declare function decompress(contentType?: RegExp): RequestHandler;
