 // src/application/product.ts
import { ProductDTO } from '../domain/dto/product';
import NotFoundError from '../domain/errors/not-found-error';
import ValidationError from '../domain/errors/validation-error';
import Product from '../infrastructure/schemas/Product';
import { Request, Response, NextFunction } from "express";
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import sharp from 'sharp';
import * as tf from '@tensorflow/tfjs';
import fs from 'fs';




export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId, code } = req.query;
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

export const getRecommendations = async (
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
    const minPrice = product.price - 5;
    const maxPrice = product.price + 5;
    const query = {
      _id: { $ne: id },
      price: { $gte: minPrice, $lte: maxPrice },
      availability: true,
      subcategory: product.subcategory || '',
    };
    const dbData = await Product.find(query).populate('categoryId', 'name');
    const dbRecommendations = dbData.map(p => ({ ...p.toObject(), price: p.price.toString() }));
    const aiSuggestions = await fetchOpenRouterRecommendations(id, product.price, product.subcategory); // AI enhancement
    res.status(200).json({ dbRecommendations, aiSuggestions });
    return;
  } catch (error) {
    next(error);
  }
};

export const getBudgetRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { budget, types } = req.query;
    if (!budget) {
      throw new ValidationError("Budget is required");
    }
    const parsedBudget = parseFloat(budget as string);
    const typeArray = (types as string)?.split(' and ') || [];
    let query: any = { price: { $lte: parsedBudget }, availability: true };
    if (typeArray.length > 0) {
      const orConditions: any[] = [];
      typeArray.forEach(type => {
        orConditions.push({ subcategory: { $regex: new RegExp(type.trim(), 'i') } });
        orConditions.push({ name: { $regex: new RegExp(type.trim(), 'i') } });
      });
      query.$or = orConditions;
      console.log('OR conditions created:', orConditions.length);
      console.log('OR conditions details:', orConditions);
    }
    console.log('Type array:', typeArray); // Log the types being searched
    console.log('Types parameter:', types); // Log the original types parameter
    console.log('Parsed budget:', parsedBudget); // Log the budget
    console.log('Query object keys:', Object.keys(query)); // Log query structure
    const dbData = await Product.find(query).populate('categoryId', 'name');
    console.log('MongoDB results for budget:', dbData); // Log the fetched data
    console.log('Number of results found:', dbData.length); // Log count

    // Test the regex patterns
    if (typeArray.length > 0) {
      console.log('Testing regex patterns:');
      typeArray.forEach(type => {
        const regex = new RegExp(type.trim(), 'i');
        console.log(`Type: "${type.trim()}", Regex: ${regex}`);
        console.log(`  Test subcategory "Casual": ${regex.test('Casual')}`);
        console.log(`  Test name "Men's Casual T-Shirt": ${regex.test("Men's Casual T-Shirt")}`);
      });
    }
    const dbRecommendations = dbData.map(p => ({ ...p.toObject(), price: p.price.toString() }));
    const aiSuggestions = await fetchOpenRouterBudgetRecommendations(parsedBudget, types as string); // AI enhancement
    res.status(200).json({ dbRecommendations, aiSuggestions });
    return;
  } catch (error) {
    next(error);
  }
};

async function fetchOpenRouterRecommendations(id: string, price: number, subcategory: string | null | undefined) {
  try {
    // Fetch similar products from MongoDB
    const minPrice = price - 5;
    const maxPrice = price + 5;
    const query = {
      _id: { $ne: new mongoose.Types.ObjectId(id) },
      price: { $gte: minPrice, $lte: maxPrice },
      availability: true,
      subcategory: subcategory || { $exists: true },
    };
    console.log('MongoDB query for exchange recommendations:', query); // Log query
    const dbData = await Product.find(query).select('name subcategory price description').limit(5);
    console.log('MongoDB results for exchange:', dbData); // Log results
    const dbSummary = dbData.map(p => `Name: ${p.name}, Subcategory: ${p.subcategory}, Price: ${p.price}, Description: ${p.description}`).join('\n');

    // Build prompt with DB data
    const prompt = `Recommend alternative products for exchange similar to product ID ${id} in subcategory ${subcategory || 'any'}, around price ${price}. Use this inventory data for suggestions:\n${dbSummary || 'No similar products in inventory.'}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-8b-instruct:free',  // Switched to a different free model
        messages: [
          { role: 'system', content: 'You are a helpful product recommendation assistant in a clothing store. Provide alternatives for exchange based on similar category, style, and price from the provided inventory.' },
          { role: 'user', content: prompt },
        ],
      }),
    } as any);
    if (response.ok) {
      const data = await response.json() as any;
      console.log('OpenRouter response for exchange:', data); // Log AI response
      return data.choices[0].message.content;
    } else {
      console.error('OpenRouter API error:', response.status, await response.text()); // Log detailed error
      return 'No AI suggestions available';
    }
  } catch (error) {
    console.error('Error fetching OpenRouter recommendations:', error);
    return 'No AI suggestions available';
  }
}

async function fetchOpenRouterBudgetRecommendations(budget: number, types: string) {
  try {
    // Fetch products from MongoDB within budget and types
    const typeArray = types.split(' and ').map(t => t.trim());
    const query = {
      price: { $lte: budget },
      availability: true,
      $or: typeArray.map(type => ({ subcategory: { $regex: new RegExp(type, 'i') } })),
    };
    console.log('MongoDB query for budget recommendations:', query); // Log query
    const dbData = await Product.find(query).select('name subcategory price description').limit(5);
    console.log('MongoDB results for budget:', dbData); // Log results
    const dbSummary = dbData.map(p => `Name: ${p.name}, Subcategory: ${p.subcategory}, Price: ${p.price}, Description: ${p.description}`).join('\n');

    // Build prompt with DB data
    const prompt = `Suggest clothing products of type ${types} within budget ${budget} USD. Use this inventory data for suggestions:\n${dbSummary || 'No matching products in inventory.'}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-8b-instruct:free',  // Switched to a different free model
        messages: [
          { role: 'system', content: 'You are a helpful product recommendation assistant in a clothing store. Suggest products based on budget and type from the provided inventory.' },
          { role: 'user', content: prompt },
        ],
      }),
    } as any);
    if (response.ok) {
      const data = await response.json() as any;
      console.log('OpenRouter response for budget:', data); // Log AI response
      return data.choices[0].message.content;
    } else {
      console.error('OpenRouter API error:', response.status, await response.text()); // Log detailed error
      return 'No AI suggestions available';
    }
  } catch (error) {
    console.error('Error fetching OpenRouter budget recommendations:', error);
    return 'No AI suggestions available';
  }
}


export const recognizeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new ValidationError("Image file is required");
    }

    // Initialize TensorFlow CPU backend
    await tf.setBackend('cpu');
    await tf.ready();

    // Preprocess image with sharp: resize to 28x28, grayscale
    const processedImage = await sharp(req.file.buffer)
      .resize(28, 28)
      .grayscale()
      .toBuffer();

    // For now, skip model loading and use a simple fallback
    // TODO: Implement proper model loading for Node.js environment
    const model = null;

    // Input tensor (preprocess buffer to Float32 array)
    const input = new Float32Array(28 * 28);
    for (let i = 0; i < processedImage.length; i++) {
      input[i] = processedImage[i] / 255.0; // Normalize
    }

    // Create TensorFlow tensor
    const tensor = tf.tensor(input, [1, 28, 28, 1]);

    // For now, use a fallback since model is not loaded
    // TODO: Implement proper model loading and inference
    const detectedCategory = 'T-shirt/top'; // Default fallback category

    // Dispose tensor to free memory
    tensor.dispose();

    // Fetch products from MongoDB based on detected category
    const query = { subcategory: { $regex: detectedCategory, $options: 'i' }, availability: true };
    const dbData = await Product.find(query).populate('categoryId', 'name');
    const recommendations = dbData.map(p => ({ ...p.toObject(), price: p.price.toString() }));

    res.status(200).json({ detectedCategory, recommendations });
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
      subcategory: result.data.subcategory || '',
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