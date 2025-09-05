import { z } from "zod";

export const VariantDTO = z.object({
  color: z.string().min(1, "Color is required"),
  image: z.string().min(1, "Image is required for each color"),
});

export const ProductDTO = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  subcategory: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be non-negative"),
  description: z.string().min(1, "Description is required"),
  sizes: z.array(z.string()).optional(),
  variants: z.array(VariantDTO).min(1, "At least one variant (color with image) is required"),
  stock: z.number().optional().default(0),
  availability: z.boolean().optional().default(true),
  qrCode: z.string().min(1, "QR code is required"),
  barcode: z.string().min(1, "Barcode is required"),
});