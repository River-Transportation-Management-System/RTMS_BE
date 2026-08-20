import { NextResponse } from "next/server";
import { login, loginSchema, toLoginResponse } from "@/modules/auth";
import { UserPgRepository } from "@/modules/user/infrastructure/user.pg.repository";
import { fail, ok, parseOrThrow, readJsonBody } from "@/shared";
import { CORS_HEADERS } from "@/shared/http/api-response";

// Ép Next.js không được cache API này (bắt buộc gọi lại mỗi lần request)
export const dynamic = "force-dynamic";

// Khởi tạo Repository 1 lần ở ngoài cùng để tái sử dụng (Singleton)
const authRepository = new UserPgRepository();

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    // 1. Đọc Body từ Request
    const body = await readJsonBody(request);

    // 2. Validate dữ liệu đầu vào (Zod Schema)
    const input = parseOrThrow(loginSchema, body);

    // 3. Thực thi Logic nghiệp vụ (Use Case)
    const rawResult = await login({ authRepository }, input);

    // 4. Chuẩn hóa dữ liệu đầu ra (Mapper)
    const responseData = toLoginResponse(
      rawResult.accessToken,
      rawResult.refreshToken,
      rawResult.expiresIn,
      rawResult.user
    );

    // 5. Trả về thành công với HTTP 200 OK
    return ok(responseData);

  } catch (error: any) {
    // 6. Xử lý lỗi đặc thù của chức năng Đăng nhập
    const isAuthError = 
      error.message === "Sai email hoặc mật khẩu" || 
      error.message === "Tài khoản của bạn đã bị khóa";

    if (isAuthError) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: "UNAUTHORIZED",
            message: error.message,
          },
          message: error.message,
        }, 
        { status: 401, headers: CORS_HEADERS }
      );
    }

    return fail(error);
  }
}