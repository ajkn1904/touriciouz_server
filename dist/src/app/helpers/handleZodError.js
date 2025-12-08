"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = void 0;
const handleZodError = (err) => {
    const errorSources = [];
    err.issues.forEach((issue) => {
        errorSources.push({
            // path: issue.path.length > 1 && issue.path.reverse().join(" inside "),
            name: issue.path[issue.path.length - 1],
            message: issue.message
        });
    });
    return {
        statusCode: 400,
        message: "Zod Error",
        errorSources
    };
};
exports.handleZodError = handleZodError;
