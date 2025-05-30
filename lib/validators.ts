import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "prime must have exactly 2 decimal places"
  );

//schema for inserting the products

export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters "),
  category: z.string().min(3, "Category must be at least 3 characters "),
  brand: z.string().min(3, "Brand must be at least 3 characters "),
  description: z.string().min(3, "Description must be at least 3 characters "),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "product must have atleast one image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

//schema for signin
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
