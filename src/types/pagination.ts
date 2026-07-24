export type SortDirection = "asc" | "desc";
export interface PageRequest { page: number; pageSize: number; sortBy?: string; sortDirection?: SortDirection; search?: string; filters?: Readonly<Record<string, string | number | boolean | undefined>>; cursor?: string; }
export interface PageResponse<T> { items: readonly T[]; page: number; pageSize: number; total: number; totalPages: number; nextCursor?: string; }
export const normalizePageRequest = (input?: Partial<PageRequest>): PageRequest => ({ page: Math.max(1, input?.page ?? 1), pageSize: Math.min(100, Math.max(1, input?.pageSize ?? 25)), sortBy: input?.sortBy, sortDirection: input?.sortDirection ?? "desc", search: input?.search?.trim() || undefined, filters: input?.filters, cursor: input?.cursor });
