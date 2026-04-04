import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string(),
  price: z.number().positive("Price must be a positive number"),
  costPrice: z.number().optional().default(0),
  brand: z.string().optional(),
  model: z.string().optional(),
  sku: z.string().optional(),
  warranty: z.string().optional(),
  categoryId: z.string(),
  images: z.array(z.string()).optional(),
  // Tech attributes
  processor: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  display: z.string().optional(),
  battery: z.string().optional(),
  os: z.string().optional(),
  connectivity: z.string().optional(),
  camera: z.string().optional(),
  // Clothing attributes
  material: z.string().optional(),
  fit: z.string().optional(),
  gender: z.string().optional(),
  season: z.string().optional(),
  careInstructions: z.string().optional(),
  // Variants
  variants: z
    .array(
      z.object({
        size: z.string().optional(),
        color: z.string().optional(),
        stock: z.number().optional(),
      })
    )
    .optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      size: z.string().optional(),
      color: z.string().optional(),
    })
  ),
});

export const messageSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export const adminReplySchema = z.object({
  adminReply: z.string().min(1, "Reply is required"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "RETURNED"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type AdminReplyInput = z.infer<typeof adminReplySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
