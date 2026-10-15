import { z } from 'zod';

/** `PATCH /users/me`: fullName 2–100; avatar, when set, must be a URL (it can't be cleared). */
export const editProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name')
    .max(100, 'Name must be 100 characters or fewer'),
  avatar: z
    .string()
    .trim()
    .refine((v) => v === '' || z.url().safeParse(v).success, 'Enter a valid image URL'),
});

export type EditProfileValues = z.infer<typeof editProfileSchema>;
