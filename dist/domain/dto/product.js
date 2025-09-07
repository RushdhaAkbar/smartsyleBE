"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductDTO = exports.VariantDTO = void 0;
const zod_1 = require("zod");
exports.VariantDTO = zod_1.z.object({
    color: zod_1.z.string().min(1, "Color is required"),
    image: zod_1.z.string().min(1, "Image is required for each color"),
});
exports.ProductDTO = zod_1.z.object({
    categoryId: zod_1.z.string().min(1, "Category ID is required"),
    subcategory: zod_1.z.string().optional(),
    name: zod_1.z.string(),
    price: zod_1.z.number(),
    description: zod_1.z.string(),
    sizes: zod_1.z.array(zod_1.z.string()).optional(),
    variants: zod_1.z.array(exports.VariantDTO).min(1, "At least one variant (color with image) is required"),
    stock: zod_1.z.number().optional().default(0),
    availability: zod_1.z.boolean().optional().default(true),
    qrCode: zod_1.z.string().optional(),
    barcode: zod_1.z.string().optional(),
});
//# sourceMappingURL=product.js.map