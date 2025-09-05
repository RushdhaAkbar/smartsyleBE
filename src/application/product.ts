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
    const { categoryId, code } = req.query; // Extract code from query params
    let data: any[] = [];
    if (code) {
      data = await Product.find({
        $or: [{ qrCode: code }, { barcode: code }],
      }).populate('categoryId', 'name');
    } else if (categoryId) {
      data = await Product.find({ categoryId }).populate('categoryId', 'name');
    } else {
      data = await Product.find().populate('categoryId', 'name');
    }
    data = data.map(p => ({ ...p.toObject(), price: p.price.toString() }));
    res.status(200).json(data);
    return;
 } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = ProductDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid product data");
    }
    const productData = {
      ...result.data,
      subcategory: result.data.subcategory || '', // Default to empty if not provided
    };
    const product = await Product.create(productData);
    res.status(201).json(product);
    return;
  } catch (error) {
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
    // Partial update: validate only provided fields
    const partialData = ProductDTO.partial().safeParse(req.body);
    if (!partialData.success) {
      throw new ValidationError("Invalid update data");
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
    next(error);
  }
};