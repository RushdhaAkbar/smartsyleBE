// File: src/application/inventory.ts
import NotFoundError from '../domain/errors/not-found-error';
import Product from '../infrastructure/schemas/Product';
import ValidationError from '../domain/errors/validation-error';
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const StockUpdateDTO = z.object({
  stock: z.number(),
});

export const updateStock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.productId;
    const result = StockUpdateDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid stock data");
    }
    const product = await Product.findByIdAndUpdate(productId, { stock: result.data.stock }, { new: true });
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