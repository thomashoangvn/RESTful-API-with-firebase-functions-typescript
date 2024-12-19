/* eslint-disable require-jsdoc */

import { Application } from "express";
import {
    createUser,
    getAllUsers,
    getUser,
    patchUserPassword,
    patchUserRole,
    removeUser,
    signOutUser,
    updateUserPhoneNumber,
} from "../controllers/user.controller";

import { isAuthenticated } from "../services/authenticated";
import { isAuthorized } from "../services/authorized";


export function userRoutes(app: Application) {
    /**
    * Create user
    **/
    app.post("/users/create/:id",
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "manager"] }),
        createUser
    );

    /**
    * Get all users
    **/
    app.get("/users/getAll/:id", [
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "manager"] }),
        getAllUsers,
    ]);

    /**
    * GET user :id user
    **/
    app.get("/users/:id", [
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "user", "manager"], allowSameUser: true }),
        getUser,
    ]);

    /**
    * Update user phone number :id user
    **/
    app.patch("/users/updatePhoneNumber/:id", [
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "user", "manager"], allowSameUser: true }),
        updateUserPhoneNumber,
    ]);

    /**
    * Patch user password :user id
    **/
    app.patch("/users/updatePassword/:id", [
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "user", "manager"], allowSameUser: true }),
        patchUserPassword,
    ]);

    /**
    * Patch user role :user id
    **/
    app.patch("/users/updateRole/:id", [
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "manager"] }),
        patchUserRole,
    ]);

    /**
    * signOut user :user id
    **/
    app.post("/users/signOut/:id", [
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "user", "manager"] }),
        signOutUser,
    ]);

    /**
    * Delete user :user id
    **/
    app.delete("/users/remove/:id", [
        isAuthenticated,
        isAuthorized({ hasRole: ["admin", "user", "manager"] }),
        removeUser,
    ]);
}
