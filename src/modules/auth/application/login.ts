import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthUserRepository, AuthUserRecord } from "./ports/auth-user.repository";
import type { LoginInput } from "../presentation/auth.schemas";

// Định nghĩa kết quả trả về THÔ (Internal DTO), chưa bị ép kiểu API
export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUserRecord;
};

export type LoginDependencies = {
  authRepository: AuthUserRepository;
};

/**
 * Use Case: Đăng nhập hệ thống
 */
export async function login(
  { authRepository }: LoginDependencies,
  input: LoginInput
): Promise<LoginResult> {
  // 1. Tìm người dùng
  const user = await authRepository.findByEmail(input.user_email);

  if (!user || !user.userPwd) {
    throw new Error("Sai email hoặc mật khẩu"); 
  }

  // 2. Kiểm tra trạng thái
  if (user.userStatus === "LOCKED") {
    throw new Error("Tài khoản của bạn đã bị khóa");
  }

  // 3. Đối chiếu mật khẩu
  // const isPasswordValid = await bcrypt.compare(input.password, user.userPwd);
  // Tạm thời so sánh text thô để test DB có pass chưa
  const isPasswordValid = input.password === user.userPwd;
  if (!isPasswordValid) {
    throw new Error("Sai email hoặc mật khẩu");
  }

  // 4. Sinh JWT
  const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_key";
  const expiresInSeconds = 15 * 60; // 15 phút

  const tokenPayload = {
    userId: user.userId,
    userEmail: user.userEmail,
    roleCode: user.roleCode, 
  };

  const accessToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: expiresInSeconds });
  const refreshToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "7d" }); 

  // 5. Trả về cục dữ liệu thô (Để file Route và Mapper xử lý tiếp)
  return {
    accessToken,
    refreshToken,
    expiresIn: expiresInSeconds,
    user, // Trả nguyên object user lấy từ DB
  };
}