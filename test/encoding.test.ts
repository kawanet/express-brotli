#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import * as express from "express";
import {requestHandler} from "express-intercept";
import {mwsupertest} from "middleware-supertest";

import {compress, decompress} from "../lib/express-compress";

const TITLE = __filename.split("/").pop();

const responseHeader = (key: string) => requestHandler().use((req, res) => res.type("html").send(req.headers[key] || "-"));

describe(TITLE, () => {
    testFormat("gzip");
    testFormat("deflate");
    testFormat("br");
});

function testFormat(format: string) {

    const router = express.Router();
    router.use(requestHandler().getRequest(req => req.headers["accept-encoding"] = format));
    router.use(requestHandler().getRequest(req => delete req.headers["te"]));
    router.use(compress());
    router.use(responseHeader("accept-encoding"));

    it("content-encoding" + ": " + format + " compression", async () => {
        const app = express().use(router);

        await mwsupertest(app)
            .getString(body => assert.equal(body, format))
            .getResponse(res => assert.equal(res.getHeader("content-encoding"), format))
            .get("/")
            // .set({"Accept-Encoding": "gzip, deflate"})
            .expect(200)
            .expect("content-encoding", format);
    });

    it("content-encoding" + ": " + format + " decompression", async () => {
        const app = express().use(decompress(), router);

        await mwsupertest(app)
            .getString(body => assert.equal(body, format))
            .getResponse(res => assert.equal(res.getHeader("content-encoding") || "uncompressed", "uncompressed"))
            .get("/")
            // .set({"Accept-Encoding": "identity"})
            .expect(200)
            .expect(format);
    });
}
