import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import { Warehouse, MapPin, Boxes, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WarehousesPage() {
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    include: {
      locations: {
        include: {
          stockQuants: {
            include: { product: true },
          },
        },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/inventory"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> กลับหน้าคลังสินค้า
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ผังคลังสินค้าและตำแหน่งจัดเก็บ (Warehouses & Locations)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            จัดการคลังหลัก สาขา และตำแหน่งจัดวางสินค้า (Bins / Shelves)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((wh) => {
          const totalStockInWarehouse = wh.locations.reduce(
            (sum, loc) => sum + loc.stockQuants.reduce((s, q) => s + q.quantity, 0),
            0
          );

          return (
            <div key={wh.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {wh.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{wh.name}</h3>
                  </div>
                  {wh.address && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {wh.address}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">สต็อกคงเหลือรวม</span>
                  <div className="font-bold text-slate-900 text-lg">
                    {formatNumber(totalStockInWarehouse)} <span className="text-xs font-normal text-slate-500">ชิ้น</span>
                  </div>
                </div>
              </div>

              {/* Locations / Shelves */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-600">ตำแหน่งจัดเก็บ (Storage Locations / Bins)</h4>
                <div className="space-y-2">
                  {wh.locations.map((loc) => {
                    const locTotal = loc.stockQuants.reduce((s, q) => s + q.quantity, 0);

                    return (
                      <div
                        key={loc.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                            <span className="font-mono text-slate-500 font-bold">{loc.code}</span>
                            <span>- {loc.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {loc.stockQuants.length} SKU ในตำแหน่งนี้
                          </div>
                        </div>
                        <div className="font-bold text-xs text-slate-800">
                          {formatNumber(locTotal)} ชิ้น
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
