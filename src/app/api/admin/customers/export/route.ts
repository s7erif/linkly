import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { adminReadService } from "@/lib/composition-root";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions as AuthOptions);
  if (!session?.user?.email) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const base = {
    search: url.searchParams.get("search") || undefined,
    status: url.searchParams.get("status") || undefined,
    sortBy: url.searchParams.get("sortBy") || undefined,
    sortDirection: url.searchParams.get("sortDirection") || undefined,
    pageSize: 100,
  };
  const first = await adminReadService.listCustomers({ ...base, page: 1 });
  const pages = await Promise.all(Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, index) => adminReadService.listCustomers({ ...base, page: index + 2 })));
  const rows = [first, ...pages].flatMap((page) => page.items);
  const csv = [
    ["Full Name", "Email", "Phone", "Status", "Created"],
    ...rows.map((customer) => [customer.displayName, customer.email ?? "", customer.phone ?? "", customer.status, customer.createdAt.toISOString()]),
  ].map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Disposition": `attachment; filename="customers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
