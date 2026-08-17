import { NextResponse } from "next/server";
import { getUserById } from "@/modules/user/application/get-user-by-id";
import { toUserDetailResponse } from "@/modules/user/presentation/user.mapper";
import { UserPgRepository } from "@/modules/user/infrastructure/user.pg.repository";

export const dynamic = "force-dynamic";

const userRepository = new UserPgRepository();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Lấy ID từ URL và kiểm tra xem có phải là số hợp lệ không
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: "ID người dùng không hợp lệ" },
        { status: 400 }
      );
    }

    // 2. Chạy Use Case với repository thật
    const userDetail = await getUserById({ userRepository }, userId);

    // 3. Chuẩn hóa dữ liệu trả về
    const responseData = toUserDetailResponse(userDetail);

    return NextResponse.json(
      { 
        success: true, 
        timestamp: new Date().toISOString(),
        data: responseData 
      },
      { status: 200 }
    );

  } catch (error: any) {
    // 4. Bắt lỗi: Nếu là lỗi "USER_NOT_FOUND", trả về 404 đúng thiết kế
    if (error.name === "USER_NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    // Các lỗi hệ thống khác trả về 400
    return NextResponse.json(
      { success: false, message: error.message || "Lấy thông tin thất bại" },
      { status: 400 }
    );
  }
}