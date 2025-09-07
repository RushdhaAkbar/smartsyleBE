"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = __importDefault(require("express"));
const product_1 = require("../application/product");
const multer_1 = __importDefault(require("multer"));
//import { isAuthenticated } from "./middleware/authentication-middleware";
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.productRouter = express_1.default.Router();
exports.productRouter
    .route("/:id/recommendations")
    .get(product_1.getRecommendations);
exports.productRouter
    .route("/budget")
    .get(product_1.getBudgetRecommendations);
exports.productRouter
    .route("/")
    .get(product_1.getProducts)
    .post(product_1.createProduct);
exports.productRouter
    .route("/:id")
    .get(product_1.getProduct)
    .delete(product_1.deleteProduct)
    .patch(product_1.updateProduct);
exports.productRouter.post('/recognize-image', upload.single('image'), product_1.recognizeImage);
//# sourceMappingURL=product.js.map