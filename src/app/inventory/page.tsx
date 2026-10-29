import { StockService } from "@/lib/stock-service";
import { prisma } from "@/lib/prisma";
import { StockTable } from "./stock-table";
import Link from "next/link";
import { ArrowLeftRight, Warehouse } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [products, locations] = await Promise.all([
    StockService.getProductStockSummary(),
    prisma.stockLocation.findMany({
      include: { warehouse: true },
      orderBy: { warehouse: { code: "asc" } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ระบบจัดการสต็อกสินค้าคงคลัง (Inventory Management)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ยอดคงเหลือจริงแบบ Real-time คำนวณจากสมุดบันทึกการเคลื่อนไหวสต็อก (Double-Entry Ledger)
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/inventory/moves"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition"
          >
            <ArrowLeftRight className="w-4 h-4 text-slate-500" />
            สมุดบันทึกความเคลื่อนไหว (Moves Log)
          </Link>
          <Link
            href="/warehouses"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm transition"
          >
            <Warehouse className="w-4 h-4 text-slate-500" />
            ผังคลังและตำแหน่งจัดเก็บ
          </Link>
        </div>
      </div>

      <StockTable products={products} locations={locations} />
    </div>
  );
}
