import { z } from "zod";

export const loginSchema = z.object({
    email: z.string({ message: "Email is required" }).email({ message: "Invalid email address" }),
    password: z.string({ message: "Password is required" }),
});

export const registerSchema = z.object({
    name: z.string({ message: "Name is required" }).min(1, { message: "Name must be at least 1 character long" }),
    email: z.string({ message: "Email is required" }).email({ message: "Invalid email address" }),
    password: z
        .string({ message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" }),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export type RegisterSchemaType = z.infer<typeof registerSchema>;
