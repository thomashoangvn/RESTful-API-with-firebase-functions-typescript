import cors from "cors";
import { RequestHandler } from "express";
import * as https from "firebase-functions/v2/https";
import express = require("express");

const app = express();
app.use(express.json() as RequestHandler);
app.use(express.urlencoded({
    extended: true,
}) as RequestHandler);
app.use(cors({ origin: true }));

import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";

userRoutes(app);
authRoutes(app);

const runtimeOpts = {
    timeoutSeconds: 180,
};

// Export API function using Firebase Functions v2
export const api = https.onRequest(
    {
        timeoutSeconds: runtimeOpts.timeoutSeconds,
    },
    app
);
