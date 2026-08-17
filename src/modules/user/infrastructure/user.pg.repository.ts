import { database } from "@/infrastructure/database/postgres";

// 1. Import từ Module Auth 
import type { AuthUserProfile, AuthUserRepository, AuthUserRecord } from "@/modules/auth/application/ports/auth-user.repository";

// 2. Import thêm từ Module User
import type { UserRepository, GetUsersFilter, PaginatedUsers, UserDetailRecord } from "../application/ports/user.repository";

// Cho class implements cả 2 Interface
export class UserPgRepository implements AuthUserRepository, UserRepository {
  
  // =========================================================
  // PHẦN 1: PHỤC VỤ CHO MODULE AUTH 
  // =========================================================
  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    const sql = `
      SELECT
        u.user_id,
        u.user_name,
        u.user_email,
        u.user_pwd,
        u.user_status,
        r.role_id,
        r.role_name,
        r.role_code
      FROM "user" u
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE u.user_email = $1 AND u.deleted_at IS NULL
      LIMIT 1;
    `;
    try {
      const result = await database.query(sql, [email]);
      const row = result.rows[0];

      if (!row) return null;

      return {
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        userPwd: row.user_pwd,
        userStatus: row.user_status,
        roleId: row.role_id,
        roleName: row.role_name,
        roleCode: row.role_code,
      };
    } catch (error) {
      console.error("[UserPgRepository - findByEmail] Lỗi:", error);
      throw new Error("Lỗi hệ thống khi truy xuất dữ liệu");
    }
  }

  async getProfileById(userId: string | number): Promise<AuthUserProfile | null> {
    const sql = `
      SELECT
        u.user_id,
        u.user_name,
        u.user_phone,
        u.user_email,
        u.user_status,
        u.created_at,
        u.updated_at,
        r.role_id,
        r.role_name,
        r.role_code
      FROM "user" u
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE u.user_id = $1
        AND u.deleted_at IS NULL
      LIMIT 1;
    `;

    try {
      const result = await database.query(sql, [userId]);
      const row = result.rows[0];

      if (!row || !row.role_id || !row.role_name || !row.role_code) {
        return null;
      }

      return {
        userId: row.user_id,
        userName: row.user_name,
        userPhone: row.user_phone,
        userEmail: row.user_email,
        userStatus: row.user_status,
        createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
        updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
        role: {
          roleId: row.role_id,
          roleName: row.role_name,
          roleCode: row.role_code,
        },
      };
    } catch (error) {
      console.error("[UserPgRepository - getProfileById] Lỗi:", error);
      throw new Error("Lỗi hệ thống khi truy xuất profile người dùng");
    }
  }

  // =========================================================
  // PHẦN 2: PHỤC VỤ CHO MODULE USER 
  // =========================================================
  async getUsers(filter: GetUsersFilter): Promise<PaginatedUsers> {
    const offset = (filter.page - 1) * filter.limit;

    const sql = `
      SELECT 
        COUNT(*) OVER() AS total_count,
        u.user_id, u.user_name, u.user_email, u.user_phone, u.user_status, u.role_id,
        u.created_at, u.updated_at, u.deleted_at
      FROM "user" u
      WHERE u.deleted_at IS NULL
        AND ($1::text IS NULL OR u.user_name ILIKE '%' || $1 || '%' OR u.user_email ILIKE '%' || $1 || '%')
        AND ($2::int IS NULL OR u.role_id = $2)
        AND ($3::text IS NULL OR u.user_status = $3)
      ORDER BY u.created_at DESC
      LIMIT $4 OFFSET $5;
    `;

    const values = [
      filter.search || null, filter.roleId || null, filter.userStatus || null, filter.limit, offset
    ];

    try {
      const result = await database.query(sql, values);
      const rows = result.rows;

      if (rows.length === 0) {
        return { data: [], total: 0, page: filter.page, limit: filter.limit };
      }

      const total = parseInt(rows[0].total_count, 10);
      const data = rows.map((row) => ({
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        userPhone: row.user_phone,
        userStatus: row.user_status,
        roleId: row.role_id,
        createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
        updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
        deletedAt: row.deleted_at ? (row.deleted_at instanceof Date ? row.deleted_at : new Date(row.deleted_at)) : null,
      }));

      return { data, total, page: filter.page, limit: filter.limit };

    } catch (error) {
      console.error("[UserPgRepository - getUsers] Lỗi:", error);
      throw new Error("Lỗi hệ thống khi lấy danh sách người dùng");
    }
  }

  async getUserById(id: number): Promise<UserDetailRecord | null> {
    const sql = `
      SELECT 
        u.user_id, u.user_name, u.user_email, u.user_phone, u.user_status, 
        u.created_at, u.updated_at,
        r.role_id, r.role_name, r.role_code
      FROM "user" u
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE u.user_id = $1 
        AND u.deleted_at IS NULL -- YÊU CẦU: Bỏ qua tài khoản đã xóa mềm
      LIMIT 1;
    `;

    try {
      const result = await database.query(sql, [id]);
      const row = result.rows[0];

      if (!row) {
        return null; // Trả về null nếu không tìm thấy
      }

      return {
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        userPhone: row.user_phone,
        userStatus: row.user_status,
        createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
        updatedAt: row.updated_at instanceof Date ? row.updated_at : new Date(row.updated_at),
        role: row.role_id ? {
          roleId: row.role_id,
          roleName: row.role_name,
          roleCode: row.role_code,
        } : null,
      };
    } catch (error) {
      console.error("[UserPgRepository - getUserById] Lỗi:", error);
      throw new Error("Lỗi hệ thống khi lấy thông tin chi tiết người dùng");
    }
  }
}