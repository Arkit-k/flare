import {z} from "zod"

export const createUserSchema = z.object({
      username:z.string().min(3).max(20),
      password: z.string().min(6, "Password must be at least 6 characters long"),
      name: z.string()
})

export const SigninSchema = z.object({
      username:z.string().min(3).max(20),
      password: z.string(),
})

export const CreateRoomSchema = z.object({
      name: z.string().min(3).max(20),
})