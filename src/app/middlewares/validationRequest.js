"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationRequest = void 0;
const zod_1 = require("zod");
const handleZodError_1 = require("../helpers/handleZodError");
const validationRequest = (zodSchema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body = yield zodSchema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const simplifiedError = (0, handleZodError_1.handleZodError)(error);
            return res.status(simplifiedError.statusCode).json({
                success: false,
                message: simplifiedError.message,
                err: simplifiedError.errorSources,
            });
        }
        next(error);
    }
});
exports.validationRequest = validationRequest;
