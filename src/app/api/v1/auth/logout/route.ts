import { NextResponse } from "next/server";
import { logout } from "@/modules/auth/application/logout";
import { toLogoutResponse } from "@/modules/auth/presentation/auth.mapper";
import { CORS_HEADERS } from "@/shared/http/api-response";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    // 1. Trích xuất token từ Header Authorization
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy token xác thực" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const token = authHeader.split(" ")[1];

    // 2. Thực thi nghiệp vụ Đăng xuất (Chỉ xử lý code, không chạm DB)
    const result = await logout(token);

    // 3. Chuẩn hóa dữ liệu đầu ra
    const responseData = toLogoutResponse(result.revokedAt);

    // 4. Trả về kết quả thành công (HTTP 200)
    return NextResponse.json(
      {
        success: true,
        message: responseData.message,
        revoked_at: responseData.revoked_at,
      },
      { status: 200, headers: CORS_HEADERS }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Đã có lỗi xảy ra" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}