export type { RoleCode, RoleEntity } from "./domain/role.entity";
export type { UserEntity, UserStatus } from "./domain/user.entity";

// ============================================================================
// APPLICATION LAYER (Lớp Logic Ứng Dụng)
// ============================================================================

// Xuất các Use Case
export { login } from "./application/login";
export type { LoginDependencies } from "./application/login";

// Xuất các Port (Bản hợp đồng Repository)
export type { AuthUserProfile, AuthUserRepository, AuthUserRecord } from "./application/ports/auth-user.repository";


// ============================================================================
// PRESENTATION LAYER (Lớp Giao Tiếp & Biến Đổi Dữ Liệu)
// ============================================================================

// Xuất Schema kiểm duyệt đầu vào
export { loginSchema } from "./presentation/auth.schemas";
export type { LoginInput } from "./presentation/auth.schemas";

// Xuất Mapper định dạng đầu ra
export { toLoginResponse } from "./presentation/auth.mapper";
export type { LoginHttpResponse } from "./presentation/auth.mapper";