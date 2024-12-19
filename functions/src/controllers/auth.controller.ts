/* eslint-disable curly */
/* eslint-disable require-jsdoc */

import { NextFunction, Request, Response } from "express";
import nodemailer from "nodemailer";

import axios from "axios";

import * as ENVIRONMENT_VARIABLES from "../environments/app.config";
import * as INGRESS_VALIDATOR from "../middleware/validators/ingress.validators";

import { auth, firebaseAdmin, usersCollectionReference } from "../firebaseAdmin";
import {
    customTokenModel,
    emailPasswordSignInModel,
    emailPasswordSignUpModel,
    emailUserModel,
    iDTokensModel,
    reAuthenticationModel,
} from "../middleware/interfaces/auth.interface";
import { mapUser } from "../middleware/interfaces/user.interfaces";
import {
    customTokenSchema,
    emailPasswordSignInSchema,
    emailPasswordSignUpSchema,
    iDTokensSchema,
    reAuthenticationSchema,
    resetEmailSchema,
} from "../middleware/schema/auth.schema";
import { requestValidator } from "../middleware/validators/request.validator";
import { handleError, handleErrorInvalidData, handleResponse } from "../services/handError";

export async function forgotPasswordUserWithEmail(req: Request, res: Response, next: NextFunction) {
    try {
        const emailForgotPasswordPayload: emailUserModel = req.body;

        // Validate the request payload
        await requestValidator(emailForgotPasswordPayload, resetEmailSchema, res, next);

        // Validate the email format
        if (!INGRESS_VALIDATOR.emailReg.test(emailForgotPasswordPayload.email)) {
            return handleErrorInvalidData(res, "Invalid email address");
        }

        // Generate the password reset link
        const resetLink = await auth.generatePasswordResetLink(emailForgotPasswordPayload.email);

        // Email options
        const mailOptions = {
            from: ENVIRONMENT_VARIABLES.FROM_EMAIL_VERIFIED, // sender address
            to: emailForgotPasswordPayload.email, // list of receivers
            subject: "Password Reset", // Subject line
            text: `You requested a password reset. Click the following link to reset your password: ${resetLink}`, // plain text body
            html: `<p>You requested a password reset. Click the following link to reset your password:</p><a href="${resetLink}">| Reset Your Password |</a>`, // html body
        };

        // Create the transporter
        const transporter = nodemailer.createTransport({
            host: ENVIRONMENT_VARIABLES.MAILING_HOST,
            port: ENVIRONMENT_VARIABLES.MAILING_PORT,
            secure: ENVIRONMENT_VARIABLES.MAILING_SECURE,
            auth: {
                user: ENVIRONMENT_VARIABLES.MAILING_AUTH_USER,
                pass: ENVIRONMENT_VARIABLES.MAILING_AUTH_PASS,
            },
        });

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log("Message sent: %s", info.messageId);

        // Send a response
        return handleResponse(res, info);
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function signUpAnonymously(req: Request, res: Response) {
    try {
        const uri = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${ENVIRONMENT_VARIABLES.API_KEY_VALUE}`;

        // Gửi yêu cầu đăng ký ẩn danh
        const signUpResponse = await axios.post(uri, {
            returnSecureToken: true,
        });

        const userID: string = signUpResponse.data.localId;

        // Đặt quyền tùy chỉnh cho người dùng
        await auth.setCustomUserClaims(userID, {
            role: "user",
            accountType: "anyone",
        });

        // Lấy thông tin người dùng
        const userRecord = await auth.getUser(userID);
        const user = mapUser(userRecord);

        // Lưu thông tin người dùng vào Firestore
        await usersCollectionReference.doc(userID).set({
            uid: user.uid ?? userID,
            email: user.email ?? "",
            displayName: user.displayName ?? "",
            role: user.role ?? "user",
            accountType: user.accountType ?? "anyone",
            photoURL: user.photoURL ?? "",
            lastSignInTime: user.lastSignInTime ?? "",
            creationTime: user.creationTime ?? "",
            phone: user.phoneNumber ?? "",
            projectName: ENVIRONMENT_VARIABLES.PROJECT_USING_THIS_AUTHENTICATION ?? "",
            createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("Done adding document: ", userID);

        return handleResponse(res, {
            response: signUpResponse.data,
            user_data: userRecord,
            user: user,
        });
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function signUpUserWithEmailPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const uri = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${ENVIRONMENT_VARIABLES.API_KEY_VALUE}`;
        const emailPasswordSignUpPayload: emailPasswordSignUpModel = req.body;

        // Validate the request payload
        await requestValidator(emailPasswordSignUpPayload, emailPasswordSignUpSchema, res, next);

        // Validate email format
        if (!INGRESS_VALIDATOR.emailReg.test(emailPasswordSignUpPayload.email)) {
            return handleErrorInvalidData(res, "Invalid email address");
        }

        // Validate password format
        if (!INGRESS_VALIDATOR.passwordReg.test(emailPasswordSignUpPayload.password)) {
            return handleErrorInvalidData(res, "Invalid password");
        }

        const role: string = emailPasswordSignUpPayload.role ?? "user";

        // Create user in Firebase Auth
        const signUpResponse = await axios.post(uri, {
            email: emailPasswordSignUpPayload.email,
            password: emailPasswordSignUpPayload.password,
            returnSecureToken: true,
        });

        const userID: string = signUpResponse.data.localId;

        // Set custom user claims
        await auth.setCustomUserClaims(userID, {
            role: role,
            accountType: "email",
        });

        // Get user record
        const userRecord = await auth.getUser(userID);
        const user = mapUser(userRecord);

        // Save user data in Firestore
        await usersCollectionReference.doc(userID).set({
            uid: user.uid ?? userID,
            email: user.email ?? "",
            displayName: user.displayName ?? "",
            role: user.role ?? role ?? "user",
            accountType: user.accountType ?? "email",
            photoURL: user.photoURL ?? "",
            lastSignInTime: user.lastSignInTime ?? "",
            creationTime: user.creationTime ?? "",
            phone: user.phoneNumber ?? "",
            projectName: ENVIRONMENT_VARIABLES.PROJECT_USING_THIS_AUTHENTICATION ?? "",
            createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("Done adding document: ", userID);

        return handleResponse(res, {
            response: signUpResponse.data,
            user_data: userRecord,
            user: user,
        });
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function signUserInWithEmailPassword(req: Request, res: Response, next: NextFunction) {
    try {
        const uri = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${ENVIRONMENT_VARIABLES.API_KEY_VALUE}`;
        const emailPasswordSignInPayload: emailPasswordSignInModel = req.body;

        // Validate the request payload
        await requestValidator(emailPasswordSignInPayload, emailPasswordSignInSchema, res, next);

        // Validate email and password formats
        if (!INGRESS_VALIDATOR.emailReg.test(emailPasswordSignInPayload.email)) {
            return handleErrorInvalidData(res, "Invalid email address");
        }

        if (!INGRESS_VALIDATOR.passwordReg.test(emailPasswordSignInPayload.password)) {
            return handleErrorInvalidData(res, "Invalid password");
        }

        // Sign in the user with email and password
        const signInResponse = await axios.post(uri, {
            email: emailPasswordSignInPayload.email,
            password: emailPasswordSignInPayload.password,
            returnSecureToken: true,
        });

        const userID = signInResponse.data.localId;

        // Get user record
        const userRecord = await auth.getUser(userID);
        const user = mapUser(userRecord);

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

        return handleResponse(res, {
            response: signInResponse.data,
            user_data: userRecord,
            user: user,
        });
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function refreshIdToken(req: Request, res: Response, next: NextFunction) {
    try {
        const uri = `https://securetoken.googleapis.com/v1/token?key=${ENVIRONMENT_VARIABLES.API_KEY_VALUE}`;
        const refreshTokenPayload: reAuthenticationModel = req.body;

        // Validate the request payload
        await requestValidator(refreshTokenPayload, reAuthenticationSchema, res, next);

        // Refresh the ID token
        const response = await axios.post(uri, {
            grant_type: "refresh_token",
            refresh_token: refreshTokenPayload.refresh_token,
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const userID = response.data.user_id;

        // Get user record
        const userRecord = await auth.getUser(userID);
        const user = mapUser(userRecord);
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

        return handleResponse(res, {
            response: response.data,
            user_data: userRecord,
            user: user,
        });
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function GETIdTokens(req: Request, res: Response, next: NextFunction) {
    try {
        const uri = `${ENVIRONMENT_VARIABLES.IDENTITY_TOOLKIT_BASE_URL}${ENVIRONMENT_VARIABLES.CUSTOM_TOKEN_KEYHOLDER}${ENVIRONMENT_VARIABLES.API_KEY_VALUE}`;
        const iDTokensPayload: iDTokensModel = req.body;

        // Validate the request payload
        await requestValidator(iDTokensPayload, iDTokensSchema, res, next);

        // Make a request to get ID tokens
        const signInResponse = await axios.post(uri, {
            token: iDTokensPayload.token,
            returnSecureToken: true,
        });

        return handleResponse(res, signInResponse.data);
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function reAuthenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const reAuthenticatePayload: reAuthenticationModel = req.body;
        const uri = `${ENVIRONMENT_VARIABLES.SECURE_API_BASE_URL}${ENVIRONMENT_VARIABLES.SECURE_API_KEYHOLDER}${ENVIRONMENT_VARIABLES.API_KEY_VALUE}`;

        // Validate the request payload
        await requestValidator(reAuthenticatePayload, reAuthenticationSchema, res, next);

        // Make a request to refresh the token
        const reAuthResponse = await axios.post(uri, {
            grant_type: "refresh_token",
            refresh_token: reAuthenticatePayload.refresh_token,
        });

        // Send success response
        return handleResponse(res, reAuthResponse.data);
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}

export async function GETCustomToken(req: Request, res: Response, next: NextFunction) {
    try {
        const customTokenPayload: customTokenModel = req.body;

        // Validate the request payload
        await requestValidator(customTokenPayload, customTokenSchema, res, next);

        // Create a custom token
        const customToken = await auth.createCustomToken(customTokenPayload.uid);

        return handleResponse(res, customToken);
    } catch (error) {
        return handleError(res, Error(`error: ${error}`));
    }
}
