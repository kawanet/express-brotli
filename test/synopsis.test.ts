#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {Request, Response} from "express";
import {mwsupertest} from "middleware-supertest";
import * as zlib from "zlib";
import {requestHandler} from "express-intercept";

// ## SYNOPSIS

const express = require("express");
const brotli = require("../lib/express-brotli");

const app = express();

app.use(requestHandler().getRequest(req => delete req.headers["accept-encoding"]));

app.use(brotli.compress(/html/));

app.use(brotli.decompress(/html/));

app.use((req: Request, res: Response) => res.type("html").send("<html>your content</html>"));

//

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    it("SYNOPSIS", async () => {
        await mwsupertest(app)
            .getResponse(res => {
                assert.equal(res.statusCode, 200);
                assert.equal(res.getHeader("transfer-encoding"), "br");
            })
            .get("/")
            .set({te: "br"})
            .responseType("blob")
            .then(res => {
                assert.equal(res.status, 200);
                assert.equal(res.header["transfer-encoding"], "br");
                const body = zlib.brotliDecompressSync(res.body);
                assert.equal(String(body), "<html>your content</html>");
            });
    });
});
