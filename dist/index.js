"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const product_1 = require("./api/product");
const category_1 = require("./api/category");
const inventory_1 = require("./api/inventory");
const user_1 = require("./api/user");
const global_error_handling_middleware_1 = __importDefault(require("./api/middlewares/global-error-handling-middleware"));
const db_1 = __importDefault(require("./infrastructure/db"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:8080",
        "http://192.168.1.100:8080",
        "http://127.0.0.1:59170/1hA9-4-HCdw=/"
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use('/api/products', product_1.productRouter);
app.use('/api/categories', category_1.categoryRouter);
app.use('/api/inventories', inventory_1.inventoryRouter);
app.use('/api/users', user_1.userRouter);
app.use(body_parser_1.default.json());
app.use(global_error_handling_middleware_1.default);
(0, db_1.default)();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=index.js.map