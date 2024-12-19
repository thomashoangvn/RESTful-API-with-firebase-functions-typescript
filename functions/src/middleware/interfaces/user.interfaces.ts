/* eslint-disable require-jsdoc */

import { UserRecord } from "firebase-admin/lib/auth/user-record";

export function mapUser(user: UserRecord) {
    const customClaims = (user.customClaims || { role: [""] } || { accountType: "" }) as {
        role?: string[] | undefined;
        accountType?: string | undefined;
    };

    const role = customClaims.role ? customClaims.role : ["user"];
    const accountType = customClaims.accountType ? customClaims.accountType : "anyone";
    return {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        role,
        accountType,
        photoURL: user.photoURL || "",
        lastSignInTime: user.metadata.lastSignInTime,
        creationTime: user.metadata.creationTime,
        verified: user.emailVerified,
        phoneNumber: user.phoneNumber || "",
    };
}

export interface userCreationWithEmailModel {
    displayName: string,
    role: string,
    email: string,
    phone: string
}

export interface getUsersModel {
    startNumber: number,
    pageSize: number
}

export interface getUserModel {
    id: string
}

export interface updateUserPhoneModel {
    id: string,
    phone: string
}
