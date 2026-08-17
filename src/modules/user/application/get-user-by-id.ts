import type { UserRepository, UserDetailRecord } from "./ports/user.repository";

export type GetUserByIdDependencies = {
  userRepository: UserRepository;
};

export async function getUserById(
  { userRepository }: GetUserByIdDependencies,
  id: number
): Promise<UserDetailRecord> {
  const user = await userRepository.getUserById(id);

  if (!user) {
    // Đặt tên lỗi rõ ràng để route.ts có thể bắt và trả về 404
    const error = new Error("Không tìm thấy người dùng này");
    error.name = "USER_NOT_FOUND";
    throw error;
  }

  return user;
}