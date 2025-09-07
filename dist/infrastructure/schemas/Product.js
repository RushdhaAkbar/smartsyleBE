"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const VariantSchema = new mongoose_1.default.Schema({
    color: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
});
const ProductSchema = new mongoose_1.default.Schema({
    categoryId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subcategory: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    sizes: {
        type: [String],
        required: false,
    },
    variants: [VariantSchema], // Array of variants with color and image
    stock: {
        type: Number,
        required: false,
        default: 0,
    },
    availability: {
        type: Boolean,
        required: false,
        default: true,
    },
    barcode: {
        type: String,
        unique: true,
        required: true,
    },
    qrCode: {
        type: String,
        required: true,
    },
});
exports.default = mongoose_1.default.model("Product", ProductSchema);
//# sourceMappingURL=Product.js.map