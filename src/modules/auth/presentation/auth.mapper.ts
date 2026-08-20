import type { AuthUserRecord } from "../application/ports/auth-user.repository";

/**
 * Định nghĩa cấu trúc dữ liệu JSON chính xác sẽ trả về cho Client
 * (Khớp 100% với yêu cầu Response API)
 */
export type LoginHttpResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    user_id: string;
    user_name: string | null;
    user_email: string | null;
    role_id: string;
    role_name: string | null;
    role_code: string | null;
    user_status: string | null;
  };
};

/**
 * Hàm Mapper: Biến đổi dữ liệu nội bộ thành dữ liệu phản hồi API
 * 
 * @param accessToken Chuỗi JWT truy cập
 * @param refreshToken Chuỗi JWT làm mới
 * @param expiresIn Thời gian hết hạn (tính bằng giây)
 * @param user Thông tin user lấy từ Database (AuthUserRecord)
 * @returns LoginHttpResponse
 */
export function toLoginResponse(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  user: AuthUserRecord
): LoginHttpResponse {
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: expiresIn,
    user: {
      user_id: String(user.userId),
      user_name: user.userName,
      user_email: user.userEmail,
      role_id: String(user.roleId),
      role_name: user.roleName,
      role_code: user.roleCode ?? null,
      user_status: user.userStatus,
    },
  };
}

/**
 * Chuyển đổi dữ liệu thô từ Use Case sang chuẩn API Response cho Logout
 */
export function toLogoutResponse(revokedAt: Date) {
  return {
    message: "Đăng xuất thành công",
    revoked_at: revokedAt.toISOString(),
  };
}

import type { AuthUserProfile } from "../application/ports/auth-user.repository";

/**
 * Chuyển đổi dữ liệu Profile sang chuẩn API Response
 */
export function toMeResponse(profile: AuthUserProfile) {
  return {
    user_id: profile.userId,
    user_name: profile.userName,
    user_phone: profile.userPhone,
    user_email: profile.userEmail,
    user_status: profile.userStatus,
    created_at: profile.createdAt?.toISOString(),
    updated_at: profile.updatedAt?.toISOString(),
    role: {
      role_id: profile.role.roleId,
      role_name: profile.role.roleName,
      role_code: profile.role.roleCode,
    },
  };
}