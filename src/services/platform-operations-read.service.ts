import type { AdminDashboardReadModel } from "@/types/admin-read";
import type { PageRequest, PageResponse } from "@/types/pagination";
import type { AdminReadRepository } from "@/repositories/admin-read.repository";
import { normalizePageRequest } from "@/types/pagination";
export class PlatformOperationsReadService {
  constructor(private readonly repository: AdminReadRepository) {}
  async dashboard(): Promise<AdminDashboardReadModel> { return this.repository.dashboard(new Date(new Date().setHours(0,0,0,0)), new Date()); }
  async notifications(_request?: Partial<PageRequest>): Promise<PageResponse<never>> { const request=normalizePageRequest(_request); return {items:[],page:request.page,pageSize:request.pageSize,total:0,totalPages:0}; }
  async auditLogs(_request?: Partial<PageRequest>): Promise<PageResponse<never>> { const request=normalizePageRequest(_request); return {items:[],page:request.page,pageSize:request.pageSize,total:0,totalPages:0}; }
  async systemSettings(): Promise<Readonly<Record<string, unknown>>> { return {}; }
  async storage(): Promise<{usedBytes:number;availableBytes:number;uploadCount:number}> { return {usedBytes:0,availableBytes:0,uploadCount:0}; }
}
