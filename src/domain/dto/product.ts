import { z } from "zod";

export const ProductDTO = z.object({
    categoryId: z.string(),
    image: z.string(),
    name: z.string(),
    price: z.number(),
    description: z.string(),
    sizes: z.array(z.string()).optional(), 
    colors: z.array(z.string()).optional(), 
    stock: z.number().optional().default(0), 
    availability: z.boolean().optional().default(true),
   
});