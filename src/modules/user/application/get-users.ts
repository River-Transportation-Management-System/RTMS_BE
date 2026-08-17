import type { UserRepository, GetUsersFilter, PaginatedUsers } from "./ports/user.repository";

export type GetUsersDependencies = {
  userRepository: UserRepository;
};

export async function getUsers(
  { userRepository }: GetUsersDependencies,
  filter: GetUsersFilter
): Promise<PaginatedUsers> {
  // Bạn có thể thêm các logic kiểm tra quyền (Authorization) ở đây nếu cần
  // Ví dụ: Kiểm tra user đang đăng nhập có phải Admin không trước khi cho xem danh sách
  
  return await userRepository.getUsers(filter);
}