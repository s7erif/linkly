export type NfcCardStatus = "AVAILABLE" | "RESERVED" | "ACTIVATED" | "DISABLED" | "LOST" | "ARCHIVED";

export type NfcCardInventoryItem = {
  id: string;
  activationToken: string;
  status: NfcCardStatus;
  customer: { id: string; displayName: string; email: string | null } | null;
  workspace: { id: string; primaryCard: { slug: string } | null } | null;
  activatedAt: Date | null;
  createdAt: Date;
};

export type NfcCardInventoryQuery = {
  search?: string;
  status?: NfcCardStatus;
  page: number;
  pageSize: number;
  sortDirection: "asc" | "desc";
};

export type NfcCardInventorySummary = Record<NfcCardStatus | "TOTAL", number>;
