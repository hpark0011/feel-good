import { z } from 'zod'

export const notificationPayloadSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
})

export const readFilePayloadSchema = z.object({
  name: z
    .string()
    .min(1, 'File name cannot be empty')
    .refine((name) => !name.includes('/') && !name.includes('\\'), {
      message: 'File name must not contain path separators',
    })
    .refine((name) => !name.includes('..'), {
      message: 'File name must not contain path traversal',
    }),
})

export const documentFileSchema = z.object({
  name: z.string(),
  lastModified: z.string(),
  sizeBytes: z.number(),
})

export const documentFileListSchema = z.array(documentFileSchema)

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>
export type ReadFilePayload = z.infer<typeof readFilePayloadSchema>
