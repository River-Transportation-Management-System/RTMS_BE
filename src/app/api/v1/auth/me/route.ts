import { NextResponse } from "next/server";
import { getMe } from "@/modules/auth/application/get-me";
import { toMeResponse } from "@/modules/auth/presentation/auth.mapper";
import { UserPgRepository } from "@/modules/user/infrastructure/user.pg.repository";
import { CORS_HEADERS } from "@/shared/http/api-response";

export const dynamic = "force-dynamic";

const authRepository = new UserPgRepository();

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  try {
    // 1. Trích xuất token từ Header Authorization
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy token xác thực hoặc sai định dạng" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const token = authHeader.split(" ")[1];

    // 2. Chạy Use Case với repository thật
    const profile = await getMe({ authRepository }, token);

    // 3. Map dữ liệu
    const responseData = toMeResponse(profile);

    // 4. Trả về HTTP 200
    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        data: responseData,
      },
      { status: 200, headers: CORS_HEADERS }
    );

  } catch (error: any) {
    // Bắt lỗi Token hết hạn hoặc sai sẽ trả về 401 Unauthorized
    const status = error.message.includes("hết hạn") || error.message.includes("không hợp lệ") ? 401 : 400;
    
    return NextResponse.json(
      { success: false, message: error.message || "Đã có lỗi xảy ra" },
      { status: status, headers: CORS_HEADERS }
    );
  }
}