/* eslint-disable require-jsdoc */

import { Application } from "express";
import {
    forgotPasswordUserWithEmail,
    GETCustomToken,
    GETIdTokens,
    reAuthenticate,
    refreshIdToken,
    signUpAnonymously,
    signUpUserWithEmailPassword,
    signUserInWithEmailPassword,
} from "../controllers/auth.controller";

import { isAuthenticated } from "../services/authenticated";
import { isAuthorized } from "../services/authorized";
import { isBaseAuthenticated } from "../services/baseAuthenticated";

export function authRoutes(app: Application) {
    /**
    * sign up any
    **/
    app.post("/sign_up_any", [
        isBaseAuthenticated,
        signUpAnonymously,
    ]);

    /**
    * sign up
    **/
    app.post("/sign_up", [
        isBaseAuthenticated,
        signUpUserWithEmailPassword,
    ]);

    /**
    * sign user
    **/
    app.post("/sign_in", [
        isBaseAuthenticated,
        signUserInWithEmailPassword,
    ]);

    /**
    * forgot user
    **/
    app.post("/forgot_password", [
        isBaseAuthenticated,
        forgotPasswordUserWithEmail,
    ]);


    /**
    * refreshToken user
    **/
    app.post("/refreshToken", [
        isBaseAuthenticated,
        refreshIdToken,
    ]);

    /**
    * reAuthenticate user
    **/
    app.post("/reauthenticate/:id", [
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "user", "manager"], allowSameUser: true }),
        reAuthenticate,
    ]);

    /**
    * Create Custom Token for user uid
    **/
    app.post("/custom_token/:id", [
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "user", "manager"], allowSameUser: true }),
        GETCustomToken,
    ]);

    /**
    * Exchange Custom Token for ID Token
    **/
    app.post("/id_token/:id", [
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "user", "manager"], allowSameUser: true }),
        GETIdTokens,
    ]);
}
