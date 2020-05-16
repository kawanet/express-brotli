#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as express from "express";
import {requestHandler} from "express-intercept";
import {mwsupertest} from "middleware-supertest";

import {compress, decompress} from "../lib/express-compress";

const TITLE = __filename.split("/").pop();

const responseBinary = (body: Buffer) => requestHandler().use((req, res) => res.type("application/octet-stream").send(body));

describe(TITLE, () => {
    const content = Buffer.from("BINARY");
    const router = express.Router();
    router.use(decompress({contentType: /^application/}));
    router.use(compress({contentType: /^text/}));
    router.use(responseBinary(content));

    it("binary compression skipped", async () => {
        const app = express().use(router);

        await mwsupertest(app)
            .getBuffer(body => assert.equal(toHEX(body), toHEX(content)))
            .getResponse(res => assert.equal(res.getHeader("content-encoding") || "uncompressed", "uncompressed"))
            .get("/")
            // .set({"Accept-Encoding": "gzip, deflate"})
            .expect(200)
            .expect(res => assert.equal(toHEX(res.body), toHEX(content)));
    });

    it("binary compression", async () => {
        const app = express().use(compress({contentType: /^application/}), router);

        await mwsupertest(app)
            .getResponse(res => assert.ok(res.getHeader("content-encoding"))) // gzip or deflate
            .get("/")
            // .set({"Accept-Encoding": "gzip, deflate"})
            .expect(200)
            .expect(res => assert.equal(toHEX(res.body), toHEX(content)));
    });

    it("binary decompression", async () => {
        const app = express().use(decompress(), router);

        await mwsupertest(app)
            .getResponse(res => assert.equal(res.getHeader("content-encoding") || "uncompressed", "uncompressed"))
            .get("/")
            // .set({"Accept-Encoding": "identity"})
            .expect(200)
            .expect(res => assert.equal(toHEX(res.body), toHEX(content)));

        await mwsupertest(app)
            .getBuffer(body => assert.equal(toHEX(body), toHEX(content)))
            .get("/")
            // .set({"Accept-Encoding": "identity"})
            .expect(200)
            .expect(res => assert.equal(toHEX(res.body), toHEX(content)));
    });
});

function toHEX(buf: Buffer) {
    return Buffer.from(buf).toString("hex");
}
