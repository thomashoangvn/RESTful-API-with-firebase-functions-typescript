/* eslint-disable curly */
/* eslint-disable require-jsdoc */

import { NextFunction, Request, Response } from "express";

import * as ENVIRONMENT_VARIABLES from "../environments/app.config";
import * as VALIDATION_INTERCEPTOR from "../middleware/validators/ingress.validators";

import { auth, firebaseAdmin, usersCollectionReference } from "../firebaseAdmin";
import {
    userAuthPasswordModel,
    userAuthRoleModel,
    userAuthUserModel,
} from "../middleware/interfaces/auth.interface";
import {
    getUserModel,
    getUsersModel,
    mapUser,
    updateUserPhoneModel,
    userCreationWithEmailModel,
} from "../middleware/interfaces/user.interfaces";
import {
    userAuthPasswordSchema,
    userAuthRoleSchema,
    userAuthUserSchema,
} from "../middleware/schema/auth.schema";
import {
    getUserSchema,
    getUsersSchema,
    updateUserPhoneSchema,
    userCreationWithRoleSchema,
} from "../middleware/schema/user.schema";
import { requestValidator } from "../middleware/validators/request.validator";
import { handleError, handleErrorInvalidData, handleResponse } from "../services/handError";

export async function createUser(req: Request, res: Response, next: NextFunction) {
    try {
        const createUserPayload: userCreationWithEmailModel = {
            displayName: req.body.displayName,
            role: req.body.role,
            email: req.body.email,
            phone: req.body.phone,
        };

        // Validate the request payload
        await requestValidator(createUserPayload, userCreationWithRoleSchema, res, next);

        // Create the user in Firebase Auth
        const userRecordResponse = await auth.createUser({
            displayName: createUserPayload.displayName,
            email: createUserPayload.email,
            phoneNumber: createUserPayload.phone,
        });

        // Set custom user claims
        await auth.setCustomUserClaims(userRecordResponse.uid, {
            role: createUserPayload.role,
            accountType: createUserPayload.email.length > 0 ? "email" : createUserPayload.phone.length > 0 ? "phone" : "anyone",
        });

        const userID = userRecordResponse.uid;

        // Get user record
        const userRecord = await auth.getUser(userID);
        const user = mapUser(userRecord);

        // Save user data in Firestore
        await usersCollectionReference.doc(userID).set({
            uid: user.uid ?? userID,
            email: user.email ?? "",
            displayName: user.displayName ?? "",
            role: user.role ?? "",
            accountType: user.accountType ?? "",
            photoURL: user.photoURL ?? "",
            lastSignInTime: user.lastSignInTime ?? "",
            creationTime: user.creationTime ?? "",
            phone: user.phoneNumber ?? "",
            projectName: ENVIRONMENT_VARIABLES.PROJECT_USING_THIS_AUTHENTICATION ?? "",
            createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        });

        // Send a response
        return handleResponse(res, {
            response: userRecordResponse,
            user_data: userRecord,
            user: user,
        });
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const getUserInput: getUserModel = {
            id: req.params.id,
        };

        await requestValidator(getUserInput, getUserSchema, res, next);

        // Check if user document exists
        const userID = getUserInput.id;
        const userDocument = await usersCollectionReference.doc(userID).get();
        if (!userDocument.exists) {
            // Fetch the updated user data
            const userRecord = await auth.getUser(getUserInput.id);
            const user = mapUser(userRecord);
            // Save user data in Firestore
            await usersCollectionReference.doc(userID).set({
                uid: user.uid ?? userID,
                email: user.email ?? "",
                displayName: user.displayName ?? "",
                role: user.role ?? "user",
                accountType: user.accountType ?? "",
                photoURL: user.photoURL ?? "",
                lastSignInTime: user.lastSignInTime ?? "",
                creationTime: user.creationTime ?? "",
                phone: user.phoneNumber ?? "",
                projectName: ENVIRONMENT_VARIABLES.PROJECT_USING_THIS_AUTHENTICATION ?? "",
                createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            });
            return handleErrorInvalidData(res, "User not found");
        }
        // Send a response
        return handleResponse(res, userDocument.data());
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function updateUserPhoneNumber(req: Request, res: Response, next: NextFunction) {
    try {
        const getUserInput: updateUserPhoneModel = {
            id: req.params.id,
            phone: req.body.phone,
        };

        // Validate the input
        await requestValidator(getUserInput, updateUserPhoneSchema, res, next);

        // Validate phone number format
        if (!VALIDATION_INTERCEPTOR.newPhoneReg.test(getUserInput.phone)) {
            return handleErrorInvalidData(res, "Invalid phone");
        }

        // Update phone number in Firebase Auth
        const userRecord = await auth.updateUser(getUserInput.id, {
            phoneNumber: getUserInput.phone,
        });
        const user = mapUser(userRecord);
        // Check if user document exists
        const userID = getUserInput.id;
        const userDocument = await usersCollectionReference.doc(userID).get();
        if (!userDocument.exists) {
            // Save user data in Firestore
            await usersCollectionReference.doc(userID).set({
                uid: user.uid ?? userID,
                email: user.email ?? "",
                displayName: user.displayName ?? "",
                role: user.role ?? "user",
                accountType: user.accountType ?? "email",
                photoURL: user.photoURL ?? "",
                lastSignInTime: user.lastSignInTime ?? "",
                creationTime: user.creationTime ?? "",
                phone: user.phoneNumber ?? "",
                projectName: ENVIRONMENT_VARIABLES.PROJECT_USING_THIS_AUTHENTICATION ?? "",
                createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            });
            return handleErrorInvalidData(res, "User not found");
        }
        // Update phone number in Firestore
        await usersCollectionReference.doc(userID).update({
            role: getUserInput.phone,
        });

        return handleResponse(res, user, "User phone number updated successfully");
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function patchUserPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const patchUserPasswordPayload: userAuthPasswordModel = {
            id: req.params.id,
            password: req.body.password,
        };

        // Validate the input
        await requestValidator(patchUserPasswordPayload, userAuthPasswordSchema, res, next);

        // Validate password format
        if (!VALIDATION_INTERCEPTOR.passwordReg.test(patchUserPasswordPayload.password)) {
            return handleErrorInvalidData(res, "Invalid password format");
        }

        // Update password in Firebase Auth
        await auth.updateUser(patchUserPasswordPayload.id, {
            password: patchUserPasswordPayload.password,
        });

        // Fetch updated user data
        const userRecord = await auth.getUser(patchUserPasswordPayload.id);
        return handleResponse(res, mapUser(userRecord), "Update successful");
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function patchUserRole(req: Request, res: Response, next: NextFunction) {
    try {
        const patchUserRolePayload: userAuthRoleModel = {
            id: req.params.id,
            role: req.body.role,
        };

        // Validate the request payload
        await requestValidator(patchUserRolePayload, userAuthRoleSchema, res, next);

        // Update the user's role in Firebase Auth
        await auth.setCustomUserClaims(patchUserRolePayload.id, {
            role: patchUserRolePayload.role,
        });

        // Fetch the updated user data
        const userRecord = await auth.getUser(patchUserRolePayload.id);
        const user = mapUser(userRecord);
        // Check if user document exists
        const userID = patchUserRolePayload.id;
        const userDocument = await usersCollectionReference.doc(userID).get();
        if (!userDocument.exists) {
            // Save user data in Firestore
            await usersCollectionReference.doc(userID).set({
                uid: user.uid ?? userID,
                email: user.email ?? "",
                displayName: user.displayName ?? "",
                role: user.role ?? "user",
                accountType: user.accountType ?? "email",
                photoURL: user.photoURL ?? "",
                lastSignInTime: user.lastSignInTime ?? "",
                creationTime: user.creationTime ?? "",
                phone: user.phoneNumber ?? "",
                projectName: ENVIRONMENT_VARIABLES.PROJECT_USING_THIS_AUTHENTICATION ?? "",
                createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            });
            return handleErrorInvalidData(res, "User not found");
        }
        // Update phone number in Firestore
        await usersCollectionReference.doc(userID).update({
            role: patchUserRolePayload.role,
        });

        return handleResponse(res, user, "Update successful");
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function signOutUser(req: Request, res: Response, next: NextFunction) {
    try {
        const signOutUserPayload: userAuthUserModel = {
            id: req.params.id,
        };

        // Validate the request payload
        await requestValidator(signOutUserPayload, userAuthUserSchema, res, next);

        // Revoke the user's refresh tokens
        await auth.revokeRefreshTokens(signOutUserPayload.id);

        return handleResponse(res, signOutUserPayload.id, `User with ID: ${signOutUserPayload.id} revoked tokens`);
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function removeUser(req: Request, res: Response, next: NextFunction) {
    try {
        const removeUserPayload: userAuthUserModel = {
            id: req.params.id,
        };

        // Validate the request payload
        await requestValidator(removeUserPayload, userAuthUserSchema, res, next);

        // Delete user in Firebase Auth
        await auth.deleteUser(removeUserPayload.id);

        // Remove user document in Firestore
        await usersCollectionReference.doc(removeUserPayload.id).delete();

        return handleResponse(res, removeUserPayload.id, `User with ID: ${removeUserPayload.id} removed`);
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const getUsersParams: getUsersModel = {
            startNumber: Number(req.query.startNumber),
            pageSize: Number(req.query.pageSize),
        };

        // Validate the request parameters
        await requestValidator(getUsersParams, getUsersSchema, res, next);

        // Lấy tài liệu người dùng với phân trang
        const querySnapshot = await usersCollectionReference
            .orderBy("createdAt")
            .limit(getUsersParams.pageSize || 10)
            .offset(getUsersParams.startNumber || 0)
            .get();

        const usersDataDocumentArray = querySnapshot.docs.map((doc) => doc.data());
        return handleResponse(res, usersDataDocumentArray);
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}
