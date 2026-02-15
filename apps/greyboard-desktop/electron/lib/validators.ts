import { z } from 'zod'

export const exportBoardPayloadSchema = z.string().min(1, 'Board data cannot be empty')

export const notificationPayloadSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
})

export type ExportBoardPayload = z.infer<typeof exportBoardPayloadSchema>
export type NotificationPayload = z.infer<typeof notificationPayloadSchema>
