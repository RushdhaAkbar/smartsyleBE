import express from "express";
import {
  getProducts,
  createProduct,
  getProduct,
  deleteProduct,
  updateProduct,
  getBudgetRecommendations,
  getRecommendations,
  recognizeImage
} from "../application/product";
import multer from 'multer';
//import { isAuthenticated } from "./middleware/authentication-middleware";

const upload = multer({ storage: multer.memoryStorage() });

export const productRouter = express.Router();
productRouter
  .route("/:id/recommendations")
  .get(getRecommendations);
productRouter
  .route("/budget")
  .get(getBudgetRecommendations);
productRouter
  .route("/")
  .get(getProducts)
  .post(createProduct);
productRouter
  .route("/:id")
  .get(getProduct)
  .delete(deleteProduct)
  .patch(updateProduct);
productRouter.post('/recognize-image', upload.single('image'), recognizeImage);
    