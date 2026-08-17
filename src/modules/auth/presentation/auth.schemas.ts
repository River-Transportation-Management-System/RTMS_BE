import { z } from "zod";

export const loginSchema = z
  .object({
    // Cho phép client gửi lên 1 trong 2 trường, hoặc cả 2 (optional)
    email: z.string().email("Định dạng email không hợp lệ").optional(),
    user_email: z.string().email("Định dạng email không hợp lệ").optional(),
    
    // Bắt buộc phải có mật khẩu
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  })
  // 1. Kiểm tra logic: Ít nhất 1 trong 2 trường email phải có dữ liệu
  .refine((data) => data.email || data.user_email, {
    message: "Vui lòng cung cấp email hoặc user_email",
    path: ["user_email"], // Báo lỗi tại trường này nếu thiếu cả 2
  })
  // 2. Chuẩn hóa dữ liệu (Transform): Đưa về 1 định dạng duy nhất cho lớp Application
  .transform((data) => ({
    user_email: (data.user_email || data.email) as string,
    password: data.password,
  }));

/**
 * Trích xuất kiểu dữ liệu từ schema.
 * Nhờ hàm .transform() ở trên, LoginInput sẽ tự động có kiểu là:
 * { user_email: string; password: string }
 * Điều này giúp file logic `login.ts` của chúng ta luôn nhận được một object sạch sẽ, chuẩn xác!
 */
export type LoginInput = z.infer<typeof loginSchema>;