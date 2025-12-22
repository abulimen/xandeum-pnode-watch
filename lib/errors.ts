/**
 * Custom error classes for the pNode Watch Platform
 */

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public retryable: boolean = true
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class NetworkError extends Error {
    constructor(message: string = 'Network connection failed') {
        super(message);
        this.name = 'NetworkError';
    }
}

export class ValidationError extends Error {
    constructor(message: string, public field?: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * User-friendly error message mapping
 */
export const errorMessages: Record<string, string> = {
    NETWORK_ERROR: 'Unable to connect to the network. Please check your connection.',
    API_TIMEOUT: 'The server is taking too long to respond. Retrying...',
    API_ERROR_5XX: 'The server is experiencing issues. Showing cached data.',
    API_ERROR_4XX: 'Unable to retrieve node data. Please try again later.',
    NO_DATA: 'No pNodes found in the network.',
    VALIDATION_ERROR: 'Invalid data received from the server.',
};

/**
 * Get a user-friendly error message based on error type
 */
export function getErrorMessage(error: Error): string {
    if (error instanceof NetworkError) {
        return errorMessages.NETWORK_ERROR;
    }

    if (error instanceof ApiError) {
        if (error.statusCode && error.statusCode >= 500) {
            return errorMessages.API_ERROR_5XX;
        }
        if (error.statusCode && error.statusCode >= 400) {
            return errorMessages.API_ERROR_4XX;
        }
        return error.message;
    }

    if (error instanceof ValidationError) {
        return errorMessages.VALIDATION_ERROR;
    }

    return error.message || 'An unexpected error occurred.';
}
