import { z } from "zod";

// Dùng z.coerce.number() để tự động chuyển chuỗi từ query URL sang số
export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10), // Tránh limit quá lớn
  search: z.string().optional(),
  role_id: z.coerce.number().int().optional(),
  user_status: z.string().optional(),
});