
import basicAuth from "basic-auth";
import { NextFunction, Request, Response } from "express";

import * as ENVIRONMENT_VARIABLES from "../environments/app.config";
import { handleErrorUnauthenticated } from "./handError";

/**
 * Middleware to authenticate requests using Basic Auth.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
export async function isBaseAuthenticated(req: Request, res: Response, next: NextFunction) {
    const credentials = basicAuth(req);
    const username = ENVIRONMENT_VARIABLES.BASIC_USERNAME;
    const password = ENVIRONMENT_VARIABLES.BASIC_PASSWORD;

    if (!credentials || credentials.name !== username || credentials.pass !== password) {
        return handleErrorUnauthenticated(res);
    }

    return next();
}
