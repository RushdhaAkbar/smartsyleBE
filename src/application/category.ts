// src/application/category.ts (debugged)
import { CategoryDTO, SubcategoryDTO } from "../domain/dto/category";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import Category from "../infrastructure/schemas/Category";
import { Request, Response, NextFunction } from "express";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await Category.find().lean();
    res.status(200).json(data);
    return;
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Received body:', req.body); // Debug input
    const inputData = req.body;

    if (Array.isArray(inputData)) {
      // Bulk creation
      const validationResults = inputData.map(item => CategoryDTO.safeParse(item));
      console.log('Validation results:', validationResults); // Debug validation
      const invalidItems = validationResults.filter(result => !result.success);
      if (invalidItems.length > 0) {
        throw new ValidationError("Invalid category data: " + invalidItems.map(r => r.error.message).join("; "));
      }
      const categoriesToCreate = validationResults
        .filter(result => result.success)
        .map(result => ({
          name: result.data.name,
          subcategories: result.data.subcategories || [],
        }));
      await Category.insertMany(categoriesToCreate);
      res.status(201).json({ message: 'Categories created successfully', count: categoriesToCreate.length });
    } else {
      // Single category creation
      const result = CategoryDTO.safeParse(inputData);
      console.log('Single validation result:', result); // Debug result
      if (!result.success) {
        throw new ValidationError("Invalid category data: " + result.error.message);
      }
      const data = result.data; // TypeScript now knows data is defined
      const category = {
        name: data.name,
        subcategories: data.subcategories || [],
      };
      await Category.create(category);
      res.status(201).json({ message: 'Category created successfully', count: 1 });
    }
    return;
  } catch (error) {
    console.error('Error in createCategory:', error);
    next(error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id).lean();
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    res.status(200).json(category);
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    res.status(204).send();
    return;
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const updateData = CategoryDTO.safeParse(req.body);
    console.log('Update data result:', updateData); // Debug update
    if (!updateData.success) {
      throw new ValidationError("Invalid category data: " + updateData.error.message);
    }
    const data = updateData.data; // TypeScript now knows data is defined

    const category = await Category.findByIdAndUpdate(id, {
      name: data.name,
      subcategories: data.subcategories || [],
    }, { new: true, runValidators: true });

    if (!category) {
      throw new NotFoundError("Category not found");
    }
    res.status(200).json(category);
    return;
  } catch (error) {
    next(error);
  }
};
