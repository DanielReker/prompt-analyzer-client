import axios from 'axios';

export interface UserFriendlyError {
    message: string;
    shouldRetry: boolean;
    isUserError: boolean;
}

export const getAuthErrorMessage = (error: unknown): UserFriendlyError => {
    // Handle rate limiting errors (from our custom rate limiter)
    if (error instanceof Error && error.message.includes('Too many failed login attempts')) {
        return {
            message: error.message,
            shouldRetry: false,
            isUserError: true
        };
    }

    // Handle Axios errors
    if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        // Try to extract meaningful error message from response
        let extractedMessage = '';
        if (responseData?.error?.message) {
            extractedMessage = responseData.error.message;
        } else if (responseData?.message) {
            extractedMessage = responseData.message;
        }

        // Map status codes to user-friendly messages
        switch (status) {
            case 400:
                // Bad request - usually validation errors
                if (extractedMessage) {
                    return {
                        message: extractedMessage,
                        shouldRetry: false,
                        isUserError: true
                    };
                }
                return {
                    message: 'Invalid email or password. Please check your credentials.',
                    shouldRetry: false,
                    isUserError: true
                };

            case 401:
                return {
                    message: 'Invalid email or password. Please try again.',
                    shouldRetry: false,
                    isUserError: true
                };

            case 403:
                return {
                    message: 'Access denied. Your account may be suspended.',
                    shouldRetry: false,
                    isUserError: true
                };

            case 404:
                return {
                    message: 'Account not found. Please check your email or create a new account.',
                    shouldRetry: false,
                    isUserError: true
                };

            case 429:
                return {
                    message: 'Too many login attempts. Please wait a moment before trying again.',
                    shouldRetry: true,
                    isUserError: false
                };

            case 500:
            case 502:
            case 503:
                return {
                    message: 'Our servers are experiencing issues. Please try again in a few minutes.',
                    shouldRetry: true,
                    isUserError: false
                };

            default:
                if (extractedMessage) {
                    return {
                        message: extractedMessage,
                        shouldRetry: false,
                        isUserError: true
                    };
                }
                return {
                    message: 'Something went wrong. Please try again.',
                    shouldRetry: true,
                    isUserError: false
                };
        }
    }

    // Handle network errors
    if (axios.isAxiosError(error) && !error.response) {
        return {
            message: 'Unable to connect to our servers. Please check your internet connection.',
            shouldRetry: true,
            isUserError: false
        };
    }

    // Handle other Error instances
    if (error instanceof Error) {
        return {
            message: error.message,
            shouldRetry: false,
            isUserError: true
        };
    }

    // Fallback for unknown errors
    return {
        message: 'An unexpected error occurred. Please try again.',
        shouldRetry: true,
        isUserError: false
    };
};

export const getRegistrationErrorMessage = (error: unknown): UserFriendlyError => {
    // Handle Axios errors
    if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        // Try to extract meaningful error message from response
        let extractedMessage = '';
        if (responseData?.error?.message) {
            extractedMessage = responseData.error.message;
        } else if (responseData?.message) {
            extractedMessage = responseData.message;
        }

        switch (status) {
            case 400:
                if (extractedMessage.toLowerCase().includes('email')) {
                    return {
                        message: 'This email is already registered. Please try logging in instead.',
                        shouldRetry: false,
                        isUserError: true
                    };
                }
                if (extractedMessage.toLowerCase().includes('username')) {
                    return {
                        message: 'This username is already taken. Please choose a different one.',
                        shouldRetry: false,
                        isUserError: true
                    };
                }
                if (extractedMessage) {
                    return {
                        message: extractedMessage,
                        shouldRetry: false,
                        isUserError: true
                    };
                }
                return {
                    message: 'Please check your information and try again.',
                    shouldRetry: false,
                    isUserError: true
                };

            case 409:
                return {
                    message: 'An account with this email already exists. Please try logging in.',
                    shouldRetry: false,
                    isUserError: true
                };

            case 422:
                return {
                    message: 'Please check that all fields are filled correctly.',
                    shouldRetry: false,
                    isUserError: true
                };

            default:
                return getAuthErrorMessage(error);
        }
    }

    return getAuthErrorMessage(error);
}; 