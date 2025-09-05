
import { z } from "zod";

export const SubcategoryDTO = z.object({
  name: z.string().min(1, "Subcategory name is required"),
});

export const CategoryDTO = z.object({
  name: z.string().min(1, "Category name is required"),
  subcategories: z.array(SubcategoryDTO).optional(), 
});