"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SubcategorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
});
const CategorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    subcategories: [SubcategorySchema], // Array of subcategories
});
exports.default = mongoose_1.default.model("Category", CategorySchema);
//# sourceMappingURL=Category.js.map