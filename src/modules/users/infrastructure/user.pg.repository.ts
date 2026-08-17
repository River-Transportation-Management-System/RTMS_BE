import type { AuthUserProfile } from "@/modules/auth/application/ports/auth-user.repository";
import type { AuthUserRecord, AuthUserRepository } from "@/modules/auth";
import { database } from "@/infrastructure/database/postgres";

export class UserPgRepository implements AuthUserRepository {
  
  // Nếu dự án của bạn truyền db connection qua constructor (Dependency Injection)
  // constructor(private readonly db: any) {}

  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    // 1. Viết câu lệnh SQL JOIN để lấy dữ liệu User và Role
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
      WHERE u.user_email = $1 
        AND u.deleted_at IS NULL -- Bỏ qua các tài khoản đã bị xóa mềm (Soft Delete)
      LIMIT 1;
    `;

    try {
      const result = await database.query(sql, [email]);
      const row = result.rows[0];

      if (!row) {
        return null;
      }

      // 3. Map (Chuyển đổi) dữ liệu từ Database (snake_case) sang TypeScript (camelCase)
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
      // Bắt lỗi database và ném ra ngoài để hệ thống log lại
      console.error("[UserPgRepository - findByEmail] Lỗi truy vấn DB:", error);
      throw new Error("Lỗi hệ thống khi truy xuất dữ liệu người dùng");
    }
  }

  async getProfileById(userId: string | number): Promise<AuthUserProfile | null> {
    const sql = `
      SELECT 
        u.user_id, u.user_name, u.user_phone, u.user_email, u.user_status, u.created_at, u.updated_at,
        r.role_id, r.role_name, r.role_code
      FROM "user" u
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE u.user_id = $1 AND u.deleted_at IS NULL;
    `;

    try {
      const result = await database.query(sql, [userId]);
      const row = result.rows[0];

      if (!row || !row.role_id || !row.role_code || !row.role_name) {
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
        }
      };
    } catch (error) {
      console.error("[AuthUserRepository] Lỗi getProfileById:", error);
      throw new Error("Lỗi hệ thống khi truy xuất profile người dùng");
    }
  }

}
