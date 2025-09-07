"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const category_1 = require("../application/category");
exports.categoryRouter = express_1.default.Router();
exports.categoryRouter.route('/').get(category_1.getCategories).post(category_1.createCategory);
exports.categoryRouter.route('/:id').get(category_1.getCategory).delete(category_1.deleteCategory).patch(category_1.updateCategory);
//# sourceMappingURL=category.js.map