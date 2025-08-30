import { ProductDTO } from '../domain/dto/product';
import NotFoundError from '../domain/errors/not-found-error';
import ValidationError from '../domain/errors/validation-error';
import Product from '../infrastructure/schemas/Product';
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
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
    // Convert Decimal128 to string for JSON
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
    const barcode = uuidv4();
    const qrCode = await QRCode.toDataURL(barcode);
    const productData = {
      ...result.data,
      barcode,
      qrCode,
      price: mongoose.Types.Decimal128.fromString(result.data.price.toString()),
    };
    const product = await Product.create(productData);
    const productObj = { ...product.toObject(), price: product.price.toString() };
    res.status(201).json(productObj);
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
      // Assign Decimal128 to price, ensuring type compatibility
      (partialData.data as any).price = mongoose.Types.Decimal128.fromString(String(partialData.data.price));
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