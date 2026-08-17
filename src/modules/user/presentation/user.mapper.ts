import type { PaginatedUsers, UserRecord, UserDetailRecord } from "../application/ports/user.repository";

function toUserItemResponse(user: UserRecord) {
  return {
    user_id: user.userId,
    user_name: user.userName,
    user_email: user.userEmail,
    user_phone: user.userPhone,
    user_status: user.userStatus,
    role_id: user.roleId,
    created_at: user.createdAt?.toISOString() || null,
    updated_at: user.updatedAt?.toISOString() || null,
    deleted_at: user.deletedAt?.toISOString() || null,
  };
}

export function toGetUsersResponse(result: PaginatedUsers) {
  return {
    data: result.data.map(toUserItemResponse),
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      total_pages: Math.ceil(result.total / result.limit),
    }
  };
}

export function toUserDetailResponse(user: UserDetailRecord) {
  return {
    user_id: user.userId,
    user_name: user.userName,
    user_email: user.userEmail,
    user_phone: user.userPhone,
    user_status: user.userStatus,
    role: user.role ? {
      role_id: user.role.roleId,
      role_name: user.role.roleName,
      role_code: user.role.roleCode,
    } : null,
    timestamps: {
      created_at: user.createdAt?.toISOString() || null,
      updated_at: user.updatedAt?.toISOString() || null,
    }
  };
}