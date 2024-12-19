/* eslint-disable require-jsdoc */

import { NextFunction, Request, Response } from "express";
import { auth } from "../firebaseAdmin";
import { handleError, handleErrorUnauthenticated } from "./handError";

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
        return handleErrorUnauthenticated(res, "Unauthenticated: No auth headers");
    }

    if (!authorization.startsWith("Bearer")) {
        return handleErrorUnauthenticated(res, "Unauthenticated: No bearer in header");
    }

    const split = authorization.split("Bearer ");
    if (split.length !== 2) {
        return handleErrorUnauthenticated(res);
    }

    const token = split[1];

    try {
        const decodedToken = await auth.verifyIdToken(token);
        console.log("decodedToken", JSON.stringify(decodedToken));
        res.locals = { ...res.locals, uid: decodedToken.uid, role: decodedToken.role, email: decodedToken.email };
        return next();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(`${error.code} -  ${error.message}`);
        return handleError(res, error);
    }
}
