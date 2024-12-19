// src/firebaseAdmin.ts
import admin from "firebase-admin";

import * as serviceAccount from "./certificates/config.json";

const ServiceAccountPARAMS = {
    type: serviceAccount.type,
    projectId: serviceAccount.project_id,
    privateKeyId: serviceAccount.private_key_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
    clientId: serviceAccount.client_id,
    authUri: serviceAccount.auth_uri,
    tokenUri: serviceAccount.token_uri,
    authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
    clientC509CertUrl: serviceAccount.client_x509_cert_url,
    universeDomain: serviceAccount.universe_domain,
};

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(ServiceAccountPARAMS),
    databaseURL: `https://${ServiceAccountPARAMS.projectId}.firebaseio.com`,
    storageBucket: `${ServiceAccountPARAMS.projectId}.appspot.com`,
});

export const firebaseAdmin = admin;
export const auth = admin.auth();
export const firestoreRef = admin.firestore();
export const usersCollectionReference = admin.firestore().collection("users");
export const storageRef = admin.storage().bucket();
