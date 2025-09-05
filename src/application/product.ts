import { ProductDTO } from '../domain/dto/product';
import NotFoundError from '../domain/errors/not-found-error';
import ValidationError from '../domain/errors/validation-error';
import Product from '../infrastructure/schemas/Product';
import { Request, Response, NextFunction } from "express";
import mongoose from 'mongoose';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.query;
    let data: any[] = [];
    if (!categoryId) {
      data = await Product.find();
    } else {
      data = await Product.find({ categoryId }).populate('categoryId', 'name');
    }
    console.log('Fetched products:', data); // Debug log
    data = data.map(p => ({ ...p.toObject(), price: p.price.toString() }));
    res.status(200).json(data);
    return;
 } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Received product data:', req.body); // Debug log
    const result = ProductDTO.safeParse(req.body);
    if (!result.success) {
      console.error('Validation error:', result.error);
      throw new ValidationError("Invalid product data: " + result.error.message);
    }
    const productData = {
      ...result.data,
      subcategory: result.data.subcategory || '',
    };
    const product = await Product.create(productData);
    console.log('Created product:', product); // Debug log
    res.status(201).json(product);
    return;
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate('categoryId', 'name');
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    const productObj = { ...product.toObject(), price: product.price.toString() };
    res.status(200).json(productObj);
    return;
  } catch (error) {
    console.error('Error fetching product:', error);
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(204).send();
    return;
  } catch (error) {
    console.error('Error deleting product:', error);
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    console.log('Received update data:', req.body); // Debug log
    const partialData = ProductDTO.partial().safeParse(req.body);
    if (!partialData.success) {
      console.error('Validation error:', partialData.error);
      throw new ValidationError("Invalid update data: " + partialData.error.message);
    }
    if (partialData.data.price !== undefined) {
      (partialData.data as any).price = partialData.data.price;
    }
    const product = await Product.findByIdAndUpdate(id, partialData.data, { new: true });
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    const productObj = { ...product.toObject(), price: product.price.toString() };
    res.status(200).json(productObj);
    return;
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};