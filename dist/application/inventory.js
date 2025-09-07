"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStock = void 0;
const not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
const Product_1 = __importDefault(require("../infrastructure/schemas/Product"));
const validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
const zod_1 = require("zod");
const StockUpdateDTO = zod_1.z.object({
    stock: zod_1.z.number(),
});
const updateStock = async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const result = StockUpdateDTO.safeParse(req.body);
        if (!result.success) {
            throw new validation_error_1.default("Invalid stock data");
        }
        const stockDelta = result.data.stock;
        const product = await Product_1.default.findById(productId);
        if (!product) {
            throw new not_found_error_1.default("Product not found");
        }
        if (stockDelta < 0 &&
            typeof product.stock === "number" &&
            product.stock < Math.abs(stockDelta)) {
            throw new validation_error_1.default("Not enough stock");
        }
        const updatedProduct = await Product_1.default.findByIdAndUpdate(productId, { $inc: { stock: stockDelta } }, { new: true });
        if (!updatedProduct) {
            throw new not_found_error_1.default("Product not found after update");
        }
        const productObj = { ...updatedProduct.toObject(), price: updatedProduct.price.toString() };
        res.status(200).json(productObj);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.updateStock = updateStock;
//# sourceMappingURL=inventory.js.map