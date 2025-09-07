"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategory = exports.deleteCategory = exports.getCategory = exports.createCategory = exports.getCategories = void 0;
const category_1 = require("../domain/dto/category");
const not_found_error_1 = __importDefault(require("../domain/errors/not-found-error"));
const validation_error_1 = __importDefault(require("../domain/errors/validation-error"));
const Category_1 = __importDefault(require("../infrastructure/schemas/Category"));
const getCategories = async (req, res, next) => {
    try {
        const data = await Category_1.default.find().lean();
        res.status(200).json(data);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res, next) => {
    try {
        console.log('Received body:', req.body); // Debug input
        const inputData = req.body;
        if (Array.isArray(inputData)) {
            // Bulk creation
            const validationResults = inputData.map(item => category_1.CategoryDTO.safeParse(item));
            console.log('Validation results:', validationResults); // Debug validation
            const invalidItems = validationResults.filter(result => !result.success);
            if (invalidItems.length > 0) {
                throw new validation_error_1.default("Invalid category data: " + invalidItems.map(r => r.error.message).join("; "));
            }
            const categoriesToCreate = validationResults
                .filter(result => result.success)
                .map(result => ({
                name: result.data.name,
                subcategories: result.data.subcategories || [],
            }));
            await Category_1.default.insertMany(categoriesToCreate);
            res.status(201).json({ message: 'Categories created successfully', count: categoriesToCreate.length });
        }
        else {
            // Single category creation
            const result = category_1.CategoryDTO.safeParse(inputData);
            console.log('Single validation result:', result); // Debug result
            if (!result.success) {
                throw new validation_error_1.default("Invalid category data: " + result.error.message);
            }
            const category = {
                name: result.data.name,
                subcategories: result.data.subcategories || [],
            };
            await Category_1.default.create(category);
            res.status(201).json({ message: 'Category created successfully', count: 1 });
        }
        return;
    }
    catch (error) {
        console.error('Error in createCategory:', error);
        next(error);
    }
};
exports.createCategory = createCategory;
const getCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        const category = await Category_1.default.findById(id).lean();
        if (!category) {
            throw new not_found_error_1.default("Category not found");
        }
        res.status(200).json(category);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.getCategory = getCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        const category = await Category_1.default.findByIdAndDelete(id);
        if (!category) {
            throw new not_found_error_1.default("Category not found");
        }
        res.status(204).send();
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
const updateCategory = async (req, res, next) => {
    try {
        const id = req.params.id;
        const updateData = category_1.CategoryDTO.safeParse(req.body);
        console.log('Update data result:', updateData);
        if (!updateData.success) {
            throw new validation_error_1.default("Invalid category data: " + updateData.error.message);
        }
        const data = updateData.data;
        const category = await Category_1.default.findByIdAndUpdate(id, {
            name: data.name,
            subcategories: data.subcategories || [],
        }, { new: true, runValidators: true });
        if (!category) {
            throw new not_found_error_1.default("Category not found");
        }
        res.status(200).json(category);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
//# sourceMappingURL=category.js.map