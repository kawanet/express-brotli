#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as express from "express";
import {requestHandler} from "express-intercept";
import {mwsupertest} from "middleware-supertest";

import {compress, decompress} from "../";

const TITLE = __filename.split("/").pop();

const responseText = (body: string) => requestHandler().use((req, res) => res.type("text/plain").send(body));

describe(TITLE, () => {
    const content = "TEXT";
    const router = express.Router();
    router.use(decompress({contentType: /^application/}));
    router.use(compress({contentType: /^text/}));
    router.use(responseText(content));

    it("text compression", async () => {
        const app = express().use(router);

        await mwsupertest(app)
            .getResponse(res => assert.ok(res.getHeader("content-encoding"))) // gzip or deflate
            .get("/")
            // .set({"Accept-Encoding": "gzip, deflate"})
            .expect(200)
            .expect(res => assert.equal(res.text, content));

        await mwsupertest(app)
            .getString(body => assert.equal(body, content))
            .get("/")
            // .set({"Accept-Encoding": "gzip, deflate"})
            .expect(200)
            .expect(res => assert.equal(res.text, content));
    });

    it("text decompression", async () => {
        const app = express().use(decompress({contentType: /^text/}), router);

        await mwsupertest(app)
            .getResponse(res => assert.equal(res.getHeader("content-encoding") || "uncompressed", "uncompressed"))
            .get("/")
            // .set({"Accept-Encoding": "identity"})
            .expect(200)
            .expect(res => assert.equal(res.text, content));

        await mwsupertest(app)
            .getString(body => assert.equal(body, content))
            .get("/")
            // .set({"Accept-Encoding": "identity"})
            .expect(200)
            .expect(res => assert.equal(res.text, content));
    });
});
