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
  tags: z.array(z.string()).optional(),
  salePrice: z.number().positive().nullable().optional(),
  saleEndsAt: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  weightGrams: z.number().int().positive().nullable().optional(),
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
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().nullable().optional(),
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
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED", "RETURNED", "CANCELLED"]),
  trackingNumber: z.string().optional(),
  note: z.string().optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const addressSchema = z.object({
  label: z.string().optional().default("Home"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().optional().default(false),
});

export const questionSchema = z.object({
  question: z.string().min(1, "Question is required"),
});

export const answerSchema = z.object({
  answer: z.string().min(1, "Answer is required"),
});

export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().default(""),
  image: z.string().min(1, "Image URL is required"),
  link: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional().default(""),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().optional().default(""),
  published: z.boolean().optional().default(false),
});

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const flashSaleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  discount: z.number().positive("Discount must be positive").max(100, "Discount cannot exceed 100%"),
  startsAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().min(1, "End date is required"),
  isActive: z.boolean().optional().default(true),
  productIds: z.array(z.string()).min(1, "At least one product is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type AdminReplyInput = z.infer<typeof adminReplySchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type FlashSaleInput = z.infer<typeof flashSaleSchema>;
