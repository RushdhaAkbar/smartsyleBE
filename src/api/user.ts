// Backend: src/api/user.ts (new)
import express from "express";
import {
  createUser,
  getUser,
} from "../application/user";
//import { isAuthenticated } from "./middleware/authentication-middleware";

export const userRouter = express.Router();

userRouter
  .route("/")
  .post(createUser); 
userRouter
  .route("/:id")
  .get(getUser);