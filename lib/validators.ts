import { z } from 'zod'

export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/)
export const projectCreateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
})
export const projectUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
})
export const taskCreateSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(1).max(140),
  description: z.string().max(2000).optional(),
})
export const taskUpdateSchema = z.object({
  name: z.string().min(1).max(140).optional(),
  description: z.string().max(2000).optional(),
})
export const startSchema = z.object({ taskId: z.string().cuid() })
export const stopSchema = z.object({ taskId: z.string().cuid() })
export const manualEntrySchema = z.object({
  taskId: z.string().cuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  manual: z.literal(true),
})
export const entryPatchSchema = z
  .object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
  })
  .refine((d) => d.startTime || d.endTime, 'Provide at least one field')

export type ProjectDTO = {
  id: string
  name: string
  description?: string | null
  status: 'ACTIVE' | 'ARCHIVED'
  monthTotalMs: number
  createdAt: string
}
export type TaskDTO = {
  id: string
  name: string
  description?: string | null
  totalMs: number
  monthTotalMs: number
  activeEntry?: { id: string; startTime: string }
}
export type TimeEntryDTO = {
  id: string
  taskId: string
  startTime: string
  endTime?: string | null
  manual: boolean
}
