import jwt from "jsonwebtoken";
import type { AuthUserRepository, AuthUserProfile } from "./ports/auth-user.repository";

export type GetMeDependencies = {
  authRepository: AuthUserRepository;
};

export async function getMe(
  { authRepository }: GetMeDependencies,
  token: string
): Promise<AuthUserProfile> {
  const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_key";

  try {
    // 1. Xác thực và giải mã token
    // Hàm verify sẽ tự động ném ra lỗi nếu token hết hạn hoặc sai chữ ký
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    // 2. Lấy thông tin người dùng từ DB
    const profile = await authRepository.getProfileById(decoded.userId);

    if (!profile) {
      throw new Error("Không tìm thấy thông tin người dùng");
    }

    if (profile.userStatus === "LOCKED" || profile.userStatus === "INACTIVE") {
      throw new Error("Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa");
    }

    return profile;
  } catch (error: any) {
    // Tùy chỉnh lại thông báo lỗi của JWT cho thân thiện
    if (error.name === "TokenExpiredError") throw new Error("Phiên đăng nhập đã hết hạn");
    if (error.name === "JsonWebTokenError") throw new Error("Token không hợp lệ");
    throw error;
  }
}