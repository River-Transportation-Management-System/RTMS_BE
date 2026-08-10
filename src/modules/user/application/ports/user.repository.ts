export type UserRecord = {
  userId: number;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  userStatus: string;
  roleId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type GetUsersFilter = {
  page: number;
  limit: number;
  search?: string;
  roleId?: number;
  userStatus?: string;
};

export type PaginatedUsers = {
  data: UserRecord[];
  total: number;
  page: number;
  limit: number;
};

export interface UserRepository {
  getUsers(filter: GetUsersFilter): Promise<PaginatedUsers>;
}

// Định nghĩa cấu trúc dữ liệu trả về cho 1 User chi tiết (có kèm Role)
export type UserDetailRecord = {
  userId: number;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  userStatus: string;
  createdAt: Date;
  updatedAt: Date;
  role: {
    roleId: number;
    roleName: string;
    roleCode: string;
  } | null;
};

// Cập nhật Interface
export interface UserRepository {
  getUsers(filter: GetUsersFilter): Promise<PaginatedUsers>;
  // Thêm hàm này:
  getUserById(id: number): Promise<UserDetailRecord | null>;
}