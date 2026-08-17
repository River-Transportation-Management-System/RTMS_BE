import { NextResponse } from "next/server";
import { getUsers } from "@/modules/user/application/get-users";
import { toGetUsersResponse } from "@/modules/user/presentation/user.mapper";
import { getUsersQuerySchema } from "@/modules/user/presentation/user.schemas";
import { UserPgRepository } from "@/modules/user/infrastructure/user.pg.repository";

export const dynamic = "force-dynamic";

const userRepository = new UserPgRepository();

export async function GET(request: Request) {
  try {
    // 1. Trích xuất query params từ URL
    const { searchParams } = new URL(request.url);
    const rawQuery = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      role_id: searchParams.get("role_id") || undefined,
      user_status: searchParams.get("user_status") || undefined,
    };

    // 2. Validate đầu vào (Zod sẽ tự gán giá trị mặc định page=1, limit=10 nếu thiếu)
    const parsedQuery = getUsersQuerySchema.parse(rawQuery);

    const filter = {
      page: parsedQuery.page,
      limit: parsedQuery.limit,
      search: parsedQuery.search,
      roleId: parsedQuery.role_id,
      userStatus: parsedQuery.user_status,
    };

    // 3. Thực thi Use Case với repository thật
    const result = await getUsers({ userRepository }, filter);

    // 4. Chuẩn hóa và Trả về kết quả
    const responseData = toGetUsersResponse(result);

    return NextResponse.json({ success: true, ...responseData }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Truy vấn thất bại" },
      { status: 400 }
    );
  }
}