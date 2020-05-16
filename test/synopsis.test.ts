#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {Request, Response} from "express";
import {mwsupertest} from "middleware-supertest";
import * as zlib from "zlib";

// ## SYNOPSIS

const express = require("express");
const {compress, decompress} = require("../lib/express-compress");

const app = express();

app.use(compress({contentType: /html/}));

app.use(decompress({contentType: /html/}));

app.use((req: Request, res: Response) => res.type("html").send("<html>your content</html>"));

//

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    it("SYNOPSIS", async () => {
        const test = mwsupertest(app)
            .getRequest(req => {
                assert.equal(req.header("accept-encoding"), "br");
            })
            .getResponse(res => {
                assert.equal(res.statusCode, 200);
                assert.equal(res.getHeader("content-encoding"), "br");
            })
            .get("/");

        // hack to avoid unzip by superagent
        (test as any)._shouldUnzip = () => false;

        await test
            .set({"accept-encoding": "br"})
            .responseType("blob")
            .expect(res => {
                assert.equal(res.status, 200);
                assert.equal(res.header["content-encoding"], "br");
                const body = zlib.brotliDecompressSync(res.body);
                assert.equal(String(body), "<html>your content</html>");
            });
    });
});
