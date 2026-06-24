import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(10, "Password must be at least 10 characters"),
  role: z.enum(["admin", "technician", "client"]),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  role: z.enum(["admin", "technician", "client"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(10, "Password must be at least 10 characters").optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
