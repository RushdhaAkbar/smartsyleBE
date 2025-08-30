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
    const stockDelta = result.data.stock;

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (
      stockDelta < 0 &&
      typeof product.stock === "number" &&
      product.stock < Math.abs(stockDelta)
    ) {
      throw new ValidationError("Not enough stock");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: stockDelta } },
      { new: true }
    );

    if (!updatedProduct) {
      throw new NotFoundError("Product not found after update");
    }

    const productObj = { ...updatedProduct.toObject(), price: updatedProduct.price.toString() };
    res.status(200).json(productObj);
    return;
  } catch (error) {
    next(error);
  }
};