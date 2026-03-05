"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiOkSchema = exports.apiSuccessSchema = exports.apiErrorSchema = exports.apiIssueSchema = void 0;
const zod_1 = require("zod");
exports.apiIssueSchema = zod_1.z.object({
    path: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])),
    message: zod_1.z.string(),
});
exports.apiErrorSchema = zod_1.z.object({
    message: zod_1.z.string(),
    code: zod_1.z.string().optional(),
    issues: zod_1.z.array(exports.apiIssueSchema).optional(),
});
exports.apiSuccessSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
});
exports.apiOkSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
});
//# sourceMappingURL=common.js.map