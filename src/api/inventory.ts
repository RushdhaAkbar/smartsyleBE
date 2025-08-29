import express from "express";
//import { isAuthenticated } from "./middleware/authentication-middleware";
import { updateStock } from "../application/inventory"; 


export const inventoryRouter = express.Router();

inventoryRouter
  .route("/:productId/stock")
  .patch(updateStock);