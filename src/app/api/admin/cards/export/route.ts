import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getNfcCardService } from "@/lib/composition-root";
import { nfcCardQuerySchema } from "@/validation/nfc-card";

const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions as AuthOptions);
  if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const parsed = nfcCardQuerySchema.safeParse({ search: url.searchParams.get("search") || undefined, status: url.searchParams.get("status") || undefined, page: 1, pageSize: 100, sortDirection: url.searchParams.get("sortDirection") || undefined });
  if (!parsed.success) return NextResponse.json({ message: "Invalid export filters" }, { status: 400 });
  const rows = await getNfcCardService().listForExport(parsed.data);
  const output = [
    ["Activation Token", "Activation URL", "Status", "Customer", "Workspace", "Created", "Activated"],
    ...rows.map((row) => [row.activationToken, getNfcCardService().activationUrl(row.activationToken), row.status, row.customer?.displayName ?? "", row.workspace?.primaryCard?.slug ?? "", row.createdAt.toISOString(), row.activatedAt?.toISOString() ?? ""]),
  ].map((row) => row.map(csv).join(",")).join("\r\n");
  return new Response(`\uFEFF${output}`, { headers: { "Content-Disposition": 'attachment; filename="nfc-cards.csv"', "Content-Type": "text/csv; charset=utf-8" } });
}
