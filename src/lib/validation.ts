import { z } from "zod";

export const billSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["utility", "housing", "insurance", "subscription", "credit"]),
  name: z.string().min(1, "Bill name is required"),
  provider: z.string().min(1, "Provider name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  status: z.enum(["Paid", "Pending", "Overdue"]),
  accountNumber: z.string().optional(),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid due date format",
  }),
  usageSummary: z.string().optional(),
});

export const billSearchParamsSchema = z.object({
  query: z.string().optional(),
  type: z.enum(["all", "utility", "housing", "insurance", "subscription", "credit"]),
  dateRange: z.enum(["all", "month", "quarter", "year"]),
  status: z.enum(["all", "Paid", "Pending", "Overdue"]).optional(),
  sortBy: z.enum(["date", "amount", "name", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type Bill = z.infer<typeof billSchema>;
export type BillSearchParams = z.infer<typeof billSearchParamsSchema>;