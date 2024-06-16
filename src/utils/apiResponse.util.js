class apiResponse {
    constructor(statusCode, data, message, success = true) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = success;
    }
}
class apiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        success = false,
        stack = ""
    ) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.error = error;
        this.success = success;
        this.data = null;

        if (stack) this.stack = stack;
        else Error.captureStackTrace(this, this.constructor);
    }
}

export { apiError, apiResponse };
