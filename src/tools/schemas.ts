import { z } from "zod";

export const BookHoursSchema = z.object({
  hours: z.number().min(0.1).max(24),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1),
  budgetId: z.number().optional(),
  employeeId: z.number().optional(),
  activityId: z.number().optional(),
  activityName: z.string().optional(),
  projectId: z.number().optional(),
  companyId: z.number().optional(),
  corporationId: z.number().optional(),
  isVacation: z.boolean().optional().default(false),
});

export const BookHoursBulkSchema = z.object({
  hours: z.number().min(0.1).max(24),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1),
  budgetId: z.number().optional(),
  employeeId: z.number().optional(),
  activityId: z.number().optional(),
  activityName: z.string().optional(),
  projectId: z.number().optional(),
  companyId: z.number().optional(),
  corporationId: z.number().optional(),
  isVacation: z.boolean().optional().default(false),
  weekdays: z.object({
    monday: z.boolean().optional().default(true),
    tuesday: z.boolean().optional().default(true),
    wednesday: z.boolean().optional().default(true),
    thursday: z.boolean().optional().default(true),
    friday: z.boolean().optional().default(true),
    saturday: z.boolean().optional().default(false),
    sunday: z.boolean().optional().default(false),
  }).optional().default({})
});

export const UpdateHoursSchema = z.object({
  id: z.number(),
  hours: z.number().min(0.1).max(24).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().min(1).optional(),
  budgetId: z.number().optional(),
  budgetName: z.string().optional(),
  activityId: z.number().optional(),
  activityName: z.string().optional(),
  projectName: z.string().optional(),
  projectId: z.number().optional(),
  companyId: z.number().optional(),
  corporationId: z.number().optional(),
  isVacation: z.boolean().optional().default(false),
});

export const SearchBudgetSchema = z.object({
  term: z.string().min(1),
  corporationId: z.number().optional(),
});

export const CheckBookedHoursSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employeeId: z.number().optional(),
  id: z.number().optional(),
});

export const DeleteHoursSchema = z.object({
  id: z.number(),
});

export const SearchInternalBudgetsSchema = z.object({
  searchTerm: z.string().min(1),
});