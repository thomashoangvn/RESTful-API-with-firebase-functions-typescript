/* eslint-disable curly */
/* eslint-disable require-jsdoc */

import { Response } from "express";

/**
 * Handles server internal error responses.
 * @param {Response} res - The response object.
 * @return {Promise<Response>} The response object with status code 500.
 */
export async function handleErrorServerError(res: Response): Promise<Response> {
    return handleErrorCodeMessage(res, 500, "Internal Server Error");
}

/**
 * Handles generic error responses.
 * @param {Response} res - The response object.
 * @param {Error} err - The error object.
 * @return {Promise<Response>} The response object with status code 500 and error details.
 */
export async function handleError(res: Response, err: Error): Promise<Response> {
    return handleErrorCodeMessage(res, 500, `${err.name} - ${err.message}`);
}

/**
 * Handles invalid data error responses.
 * @param {Response} res - The response object.
 * @param {string} message - The error message.
 * @return {Promise<Response>} The response object with status code 400.
 */
export async function handleErrorInvalidData(res: Response, message: string): Promise<Response> {
    return handleErrorCodeMessage(res, 400, message);
}

/**
 * Handles unauthenticated error responses.
 * @param {Response} res - The response object.
 * @param {string} [message] - The optional error message.
 * @return {Promise<Response>} The response object with status code 401.
 */
export async function handleErrorUnauthenticated(res: Response, message?: string): Promise<Response> {
    return handleErrorCodeMessage(res, 401, message ?? "Unauthenticated");
}

/**
 * Handles unauthorized error responses.
 * @param {Response} res - The response object.
 * @param {string} [message] - The optional error message.
 * @return {Promise<Response>} The response object with status code 402.
 */
export async function handleErrorUnauthorized(res: Response, message?: string): Promise<Response> {
    return handleErrorCodeMessage(res, 402, message ?? "Unauthorized");
}

/**
 * Sends an error response with specified code and message.
 * @param {Response} res - The response object.
 * @param {number} code - The status code.
 * @param {string} message - The error message.
 * @return {Promise<Response>} The response object with status code and message.
 */
export async function handleErrorCodeMessage(res: Response, code: number, message: string): Promise<Response> {
    return res.status(code).send({ code: code, message: message });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleResponse(res: Response, data?: any, message?: string, code?: number): Promise<Response> {
    return res.status(code ?? 200).send({ data: data ?? null, message: message ?? "successfully", code: code ?? 200 });
}
