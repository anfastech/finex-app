import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email(),
    password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
});