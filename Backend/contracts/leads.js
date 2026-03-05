"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webinarRegisterResponseSchema = exports.webinarRegisterBodySchema = exports.registerCphqResponseSchema = exports.registerCphqBodySchema = exports.leadSubmitResponseSchema = exports.legacyLeadCreateBodySchema = exports.leadCreateBodySchema = void 0;
const zod_1 = require("zod");
exports.leadCreateBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(5),
    specialty: zod_1.z.string().optional(),
});
exports.legacyLeadCreateBodySchema = exports.leadCreateBodySchema.extend({
    specialty: zod_1.z.string().min(1),
});
exports.leadSubmitResponseSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    message: zod_1.z.string().optional(),
    errors: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
exports.registerCphqBodySchema = exports.legacyLeadCreateBodySchema;
exports.registerCphqResponseSchema = exports.leadSubmitResponseSchema;
exports.webinarRegisterBodySchema = exports.legacyLeadCreateBodySchema;
exports.webinarRegisterResponseSchema = exports.leadSubmitResponseSchema;
//# sourceMappingURL=leads.js.map