import { z } from 'zod'

export const RegisterSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
    email: z.string().email('Geçerli bir email girin'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
})

export const LoginSchema = z.object({
    email: z.string().email('Geçerli bir email girin'),
    password: z.string().min(1, 'Şifre gerekli'),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>