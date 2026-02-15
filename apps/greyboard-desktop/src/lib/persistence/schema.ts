import { z } from 'zod'

export const persistedBoardV1Schema = z.object({
  version: z.literal(1),
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  data: z.record(z.string(), z.unknown()),
})

export type PersistedBoardV1 = z.infer<typeof persistedBoardV1Schema>

export const boardListSchema = z.object({
  version: z.literal(1),
  boards: z.array(persistedBoardV1Schema),
})

export type BoardList = z.infer<typeof boardListSchema>
