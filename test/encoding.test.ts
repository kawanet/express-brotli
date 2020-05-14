#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as express from "express";
import {requestHandler} from "express-intercept";
import {mwsupertest} from "middleware-supertest";

import {compress, compressTE, decompress, decompressTE} from "../lib/express-brotli";

const TITLE = __filename.split("/").pop();

const responseHeader = (key: string) => requestHandler().use((req, res) => res.type("html").send(req.headers[key] || "-"));

describe(TITLE, () => {
    testFormat("gzip", false);
    testFormat("gzip", true);

    testFormat("deflate", false);
    testFormat("deflate", true);

    testFormat("br", false);
    testFormat("br", true);
});

function testFormat(format: string, TE: boolean) {

    const incoming = TE ? "te" : "accept-encoding";
    const removing = TE ? "accept-encoding" : "te";
    const outgoing = TE ? "transfer-encoding" : "content-encoding";
    const compressHandler = TE ? compressTE() : compress();
    const decompressHandler = TE ? decompressTE() : decompress();

    const router = express.Router();
    router.use(requestHandler().getRequest(req => req.headers[incoming] = format));
    router.use(requestHandler().getRequest(req => delete req.headers[removing]));
    router.use(compressHandler);
    router.use(responseHeader(incoming));

    it(outgoing + ": " + format + " compression", async () => {
        const app = express().use(router);

        await mwsupertest(app)
            .getString(body => assert.equal(body, format))
            .getResponse(res => assert.equal(res.getHeader(outgoing), format))
            .get("/")
            // .set({"Accept-Encoding": "gzip, deflate"})
            .expect(200)
            .expect(outgoing, format);
    });

    it(outgoing + ": " + format + " decompression", async () => {
        const app = express().use(decompressHandler, router);

        await mwsupertest(app)
            .getString(body => assert.equal(body, format))
            .getResponse(res => assert.equal(res.getHeader(outgoing) || "uncompressed", "uncompressed"))
            .get("/")
            // .set({"Accept-Encoding": "identity"})
            .expect(200)
            .expect(format);
    });
}
