class CustomError extends Error {
    /**
     * Custom error class to handle application-specific errors.
     * @param {string} message - The error message.
     * @param {number} [statusCode=400] - The HTTP status code for
     * the error.
     **/
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'CustomError';
    }
}

module.exports = CustomError;
