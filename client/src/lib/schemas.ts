import { z } from 'zod'
import { MOOD_TYPES } from '@/types'

export const registerSchema = z
  .object({
    studentId: z
      .string()
      .trim()
      .regex(/^\d{8}$/, 'Student ID must be 8 digits'),
    email: z
      .string()
      .trim()
      .email('Enter a valid email')
      .refine((v) => v.toLowerCase().endsWith('@kmitl.ac.th'), {
        message: 'Email must be @kmitl.ac.th',
      }),
    faculty: z.string().trim().min(1, 'Select a faculty'),
    major: z.string().trim().min(2, 'Major is required'),
    year: z
      .number()
      .int()
      .min(1, 'Year must be 1–8')
      .max(8, 'Year must be 1–8'),
  })
  .refine(
    (data) => data.email.toLowerCase().startsWith(`${data.studentId}@`),
    {
      message: 'Email should be <studentId>@kmitl.ac.th',
      path: ['email'],
    },
  )

export const composeMoodSchema = z.object({
  moodType: z.enum(MOOD_TYPES),
  message: z
    .string()
    .trim()
    .min(1, 'Write something on your note')
    .max(280, 'Keep it under 280 characters'),
  emoji: z.string().trim().min(1).max(8).optional(),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
export type ComposeMoodFormValues = z.infer<typeof composeMoodSchema>
