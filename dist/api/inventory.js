"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryRouter = void 0;
const express_1 = __importDefault(require("express"));
//import { isAuthenticated } from "./middleware/authentication-middleware";
const inventory_1 = require("../application/inventory");
exports.inventoryRouter = express_1.default.Router();
exports.inventoryRouter
    .route("/:productId/stock")
    .patch(inventory_1.updateStock);
//# sourceMappingURL=inventory.js.map