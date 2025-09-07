"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryDTO = exports.SubcategoryDTO = void 0;
const zod_1 = require("zod");
exports.SubcategoryDTO = zod_1.z.object({
    name: zod_1.z.string().min(1, "Subcategory name is required"),
});
exports.CategoryDTO = zod_1.z.object({
    name: zod_1.z.string().min(1, "Category name is required"),
    subcategories: zod_1.z.array(exports.SubcategoryDTO).optional(),
});
//# sourceMappingURL=category.js.map