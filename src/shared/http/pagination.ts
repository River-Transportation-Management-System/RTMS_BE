export type PaginationInput = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function normalizePagination(page?: number, limit?: number): PaginationInput {
  const safePage = Math.max(1, page ?? DEFAULT_PAGE);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit ?? DEFAULT_LIMIT));
  return { page: safePage, limit: safeLimit };
}

export function paginationOffset({ page, limit }: PaginationInput): number {
  return (page - 1) * limit;
}

export function toPaginatedResult<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationInput,
): PaginatedResult<T> {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}
