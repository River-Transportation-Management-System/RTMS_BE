import jwt from "jsonwebtoken";

/**
 * Use Case: Đăng xuất hệ thống (Client-side)
 */
export async function logout(token: string): Promise<{ revokedAt: Date }> {
  // 1. Chỉ giải mã token để kiểm tra tính hợp lệ cơ bản
  const decoded = jwt.decode(token) as { exp?: number } | null;

  if (!decoded) {
    throw new Error("Token không hợp lệ hoặc đã bị hỏng");
  }

  // 2. Ghi nhận thời điểm người dùng bấm đăng xuất
  const revokedAt = new Date();

  // 3. Trả về kết quả mà không cần lưu vào Database
  return { revokedAt };
}