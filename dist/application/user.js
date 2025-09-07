"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.createUser = void 0;
// Backend: src/application/user.ts (new)
const user_1 = require("../domain/dto/user");
const not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
const validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
const User_1 = __importDefault(require("../infrastructure/schemas/User"));
const createUser = async (req, res, next) => {
    try {
        const result = user_1.UserDTO.safeParse(req.body);
        if (!result.success) {
            throw new validation_error_1.default("Invalid user data");
        }
        const user = await User_1.default.create(result.data);
        res.status(201).json(user);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
const getUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User_1.default.findById(id);
        if (!user) {
            throw new not_found_error_1.default("User not found");
        }
        res.status(200).json(user);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getUser = getUser;
//# sourceMappingURL=user.js.map