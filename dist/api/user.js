"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
// Backend: src/api/user.ts (new)
const express_1 = __importDefault(require("express"));
const user_1 = require("../application/user");
//import { isAuthenticated } from "./middleware/authentication-middleware";
exports.userRouter = express_1.default.Router();
exports.userRouter
    .route("/")
    .post(user_1.createUser);
exports.userRouter
    .route("/:id")
    .get(user_1.getUser);
//# sourceMappingURL=user.js.map