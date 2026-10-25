import { z } from "zod";
import { optionalPasswordSchema, passwordSchema } from "@/lib/users/password-policy";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  password: passwordSchema,
  role: z.enum(["admin", "technician", "client"]),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  role: z.enum(["admin", "technician", "client"]).optional(),
  isActive: z.boolean().optional(),
  password: optionalPasswordSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
