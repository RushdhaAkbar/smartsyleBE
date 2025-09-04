import express from 'express';
import "dotenv/config";
/* import { clerkMiddleware } from "@clerk/express"; */
import { productRouter } from './api/product';
import { categoryRouter } from './api/category';
import { inventoryRouter } from './api/inventory';
import { userRouter } from './api/user';
import globalErrorHandlingMiddleware from './api/middlewares/global-error-handling-middleware';
import connectDB from './infrastructure/db';
import cors from "cors";

import bodyParser from 'body-parser';



const app = express();

app.use(cors({ origin: [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:8080","http://localhost:5173"] }));
/* app.use(clerkMiddleware()); */

app.use(express.json());
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/inventories', inventoryRouter);
app.use('/api/users', userRouter);
app.use(bodyParser.json());
app.use(globalErrorHandlingMiddleware);

connectDB();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));