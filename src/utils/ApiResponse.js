class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;  // e.g., 200, 201, etc.
        this.data = data;              // actual payload (user info, list, etc.)
        this.message = message;        // message string (default is "Success")
        this.success = statusCode < 400;  // sets true/false depending on statusCode
    }
}
