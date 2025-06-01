import { z } from "zod"

// Login form validation schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
})

// Signup form validation schema
export const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Profile form validation schema
export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
})

// Newsletter subscription validation schema
export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

// Order validation schema
export const orderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().min(1, "Quantity must be at least 1"),
    }),
  ),
  shippingAddress: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    state: z.string().min(2, "State must be at least 2 characters"),
    zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
    country: z.string().min(2, "Country must be at least 2 characters"),
  }),
  paymentMethod: z.enum(["credit_card", "paypal"]),
})
