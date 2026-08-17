import type { EntityId, Nullable } from "@/shared/domain/common";
import type { UserStatus } from "../../domain/user.entity";
import type { RoleCode } from "../../domain/role.entity";

/**
 * Kiểu dữ liệu gộp (Aggregated Record) phục vụ riêng cho Auth.
 * Bởi vì Entity User thuần túy không chứa roleName và roleCode,
 * chúng ta yêu cầu Database khi query phải JOIN bảng roles 
 * để trả về đầy đủ các trường này trong một lần gọi.
 */
export type AuthUserRecord = {
  userId: EntityId;
  userName: Nullable<string>;
  userEmail: Nullable<string>;
  userPwd: Nullable<string>;
  userStatus: Nullable<UserStatus>;
  roleId: EntityId;
  roleName: Nullable<string>;
  roleCode: Nullable<RoleCode>;
};

/**
 * Interface Repository dành riêng cho module Auth
 */
export interface AuthUserRepository {
  /**
   * Tìm kiếm người dùng bằng email để thực hiện đăng nhập.
   * Yêu cầu lớp Infrastructure thực thi hàm này (thường bằng câu lệnh SELECT JOIN).
   * 
   * @param email Email do người dùng cung cấp
   * @returns AuthUserRecord nếu tìm thấy, hoặc null nếu không tồn tại
   */
  findByEmail(email: string): Promise<AuthUserRecord | null>;
}

// Định nghĩa kiểu dữ liệu trả về cho Profile
export type AuthUserProfile = {
  userId: string | number;
  userName: string | null;
  userPhone: string | null;
  userEmail: string | null;
  userStatus: string;
  createdAt: Date;
  updatedAt: Date;
  role: {
    roleId: string | number;
    roleName: string;
    roleCode: string;
  };
};

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  // Thêm hàm lấy Profile theo ID
  getProfileById(userId: string | number): Promise<AuthUserProfile | null>;
}