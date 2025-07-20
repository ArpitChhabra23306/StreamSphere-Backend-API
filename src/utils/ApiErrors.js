class ApiErrors extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message); // ✅ call base class constructor to set the message

        this.statusCode = statusCode;     // 🔴 HTTP error code (e.g., 400, 404, 500)
        this.data = null;                 // optional: can be used if you want to attach data
        this.message = message;          // human-readable error message
        this.success = false;            // set to false to indicate an error occurred
        this.errors = errors;            // 🔴 detailed error info (e.g., array of validation errors)

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor); 
            // ✅ captures where the error actually occurred
        }
    }
}
