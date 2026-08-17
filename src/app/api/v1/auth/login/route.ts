import { NextResponse } from "next/server";
import { login, loginSchema, toLoginResponse } from "@/modules/auth";
import { UserPgRepository } from "@/modules/user/infrastructure/user.pg.repository";
import { fail, ok, parseOrThrow, readJsonBody } from "@/shared";

// Ép Next.js không được cache API này (bắt buộc gọi lại mỗi lần request)
export const dynamic = "force-dynamic";

// Khởi tạo Repository 1 lần ở ngoài cùng để tái sử dụng (Singleton)
const authRepository = new UserPgRepository();

export async function POST(request: Request) {
  try {
    // 1. Đọc Body từ Request
    const body = await readJsonBody(request);

    // 2. Validate dữ liệu đầu vào (Zod Schema)
    // Nếu client gửi sai (thiếu password, sai định dạng email), hàm parseOrThrow sẽ tự động ném lỗi
    const input = parseOrThrow(loginSchema, body);

    // 3. Thực thi Logic nghiệp vụ (Use Case)
    // Gọi hàm login và truyền Dependency (authRepository) vào
    const rawResult = await login({ authRepository }, input);

    // 4. Chuẩn hóa dữ liệu đầu ra (Mapper)
    // (Lưu ý: Nếu ở file login.ts bạn chưa sửa lại để trả về dữ liệu thô, 
    // mà đang trả về thẳng JSON, thì bạn chỉ cần dùng: const responseData = rawResult;)
    const responseData = toLoginResponse(
      rawResult.accessToken,
      rawResult.refreshToken,
      rawResult.expiresIn,
      rawResult.user
    );

    // 5. Trả về thành công với HTTP 200 OK (theo form chuẩn của project)
    return ok(responseData);

  } catch (error: any) {
    // 6. Xử lý lỗi đặc thù của chức năng Đăng nhập
    const isAuthError = 
      error.message === "Sai email hoặc mật khẩu" || 
      error.message === "Tài khoản của bạn đã bị khóa";

    if (isAuthError) {
      // Trả về mã lỗi HTTP 401 Unauthorized theo đúng yêu cầu thiết kế
      return NextResponse.json(
        { 
          success: false, 
          message: error.message 
        }, 
        { status: 401 }
      );
    }

    // Các lỗi khác (ví dụ: Zod validation error) sẽ được hàm fail() mặc định của dự án xử lý
    return fail(error);
  }
}