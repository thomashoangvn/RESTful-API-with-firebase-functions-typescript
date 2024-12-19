import { Schema } from "../validators/ingress.validators";

export const userCreationWithRoleSchema: Schema = {
    fields: {
        displayName: "string",
        role: "string",
        email: "string",
        phone: "string",
    },
    required: [
        "role",
    ],
};

export const getUsersSchema: Schema = {
    fields: {
        startNumber: "number",
        pageSize: "number",
    },
    required: [],
};

export const getUserSchema: Schema = {
    fields: {
        id: "string",
    },
    required: [
        "id",
    ],
};

export const updateUserPhoneSchema: Schema = {
    fields: {
        id: "string",
        phone: "string",
    },
    required: [
        "id",
        "phone",
    ],
};
