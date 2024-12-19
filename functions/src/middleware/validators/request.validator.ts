/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Response } from "express";
import * as INGRESS_VALIDATOR from "../../middleware/validators/ingress.validators";
import { handleError, handleErrorInvalidData } from "../../services/handError";

export const requestValidator = async (body: object, schema: any, res: Response, next: NextFunction) => {
    await INGRESS_VALIDATOR.validateRequiredFields(body, schema).then(async (returnedRequiredValidation) => {
        if (returnedRequiredValidation === true) {
            await INGRESS_VALIDATOR.validateDataTypes(body, schema).then(async (returnedTypeValidation) => {
                if (returnedTypeValidation === true) return true;

                return handleErrorInvalidData(res, returnedTypeValidation);
            }).catch((error) => {
                return handleError(res, Error(`error: ${error}`));
            });

            return;
        }

        return handleErrorInvalidData(res, returnedRequiredValidation);
    }).catch((error) => {
        return handleError(res, Error(`error: ${error}`));
    });
};
