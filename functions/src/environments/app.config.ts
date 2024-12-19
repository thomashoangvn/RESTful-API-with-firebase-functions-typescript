/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as dotenv from "dotenv";

dotenv.config();

console.log(process.env.NODE_ENV);

export const NODE_ENV = process.env.NODE_ENV ?? "production";
export const PROJECT_USING_THIS_AUTHENTICATION = process.env.PROJECT_USING_THIS_AUTHENTICATION!;
export const BASIC_USERNAME = process.env.BASIC_USERNAME!;
export const BASIC_PASSWORD = process.env.BASIC_PASSWORD!;

export const API_KEY_VALUE = process.env.API_KEY_VALUE!;

export const API_BASE_URL = process.env.API_BASE_URL!;
export const IDENTITY_TOOLKIT_BASE_URL = process.env.IDENTITY_TOOLKIT_BASE_URL!;
export const IDENTITY_TOOLKIT_KEYHOLDER = process.env.IDENTITY_TOOLKIT_KEYHOLDER!;
export const SECURE_API_BASE_URL = process.env.SECURE_API_BASE_URL!;
export const SECURE_API_KEYHOLDER = process.env.SECURE_API_KEYHOLDER!;
export const CUSTOM_TOKEN_KEYHOLDER = process.env.CUSTOM_TOKEN_KEYHOLDER!;
export const RESET_API_KEYHOLDER = process.env.RESET_API_KEYHOLDER!;
export const SALT = process.env.SALT!;

export const FROM_EMAIL_VERIFIED = process.env.FROM_EMAIL_VERIFIED!;
export const MAILING_AUTH_USER = process.env.MAILING_AUTH_USER!;
export const MAILING_AUTH_PASS = process.env.MAILING_AUTH_PASS!;
export const MAILING_HOST = process.env.MAILING_HOST!;
export const MAILING_PORT = Number(process.env.MAILING_PORT!);
export const MAILING_SECURE = process.env.MAILING_SECURE == "false" ? false : true;
export const PHONE_AUTH_BASE_URL = process.env.PHONE_AUTH_BASE_URL!;
