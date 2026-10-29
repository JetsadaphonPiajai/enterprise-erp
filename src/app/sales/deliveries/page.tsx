import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Truck, ArrowLeft, CheckCircle, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage() {
  const deliveries = await prisma.deliveryOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      warehouse: true,
      salesOrder: {
        include: { customer: true },
      },
      items: {
        include: {
          product: { include: { uom: true } },
          location: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/sales"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> กลับหน้าใบสั่งขาย (SO)
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ใบส่งของ / ใบนำส่งสินค้า (Delivery Orders: DO)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            ประวัติการจัดส่งสินค้าให้ลูกค้า และการตัดสต็อกจริงออกจากคลัง
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">เลขที่ใบส่งของ (DO #)</th>
                <th className="px-5 py-3.5">อ้างอิงใบสั่งขาย (SO)</th>
                <th className="px-5 py-3.5">ลูกค้า (Customer)</th>
                <th className="px-5 py-3.5">ตัดจ่ายจากคลัง</th>
                <th className="px-5 py-3.5">เลขพัสดุ (Tracking)</th>
                <th className="px-5 py-3.5">วันที่จัดส่ง</th>
                <th className="px-5 py-3.5">รายการสินค้าที่ส่ง</th>
                <th className="px-5 py-3.5 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    ยังไม่มีรายการจัดส่งสินค้า (สามารถกดส่งของและตัดสต็อกได้จากหน้ารายการสั่งขาย SO)
                  </td>
                </tr>
              ) : (
                deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-600 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-blue-600" />
                      {d.deliveryNumber}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {d.salesOrder?.orderNumber || "-"}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {d.salesOrder?.customer?.name || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {d.warehouse.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {d.trackingNo || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatDate(d.deliveryDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        {d.items.map((item) => (
                          <div key={item.id} className="text-[11px] text-slate-700 flex items-center gap-1">
                            <Package className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">{item.product.name}</span>:{" "}
                            <span className="font-bold text-rose-600">
                              -{item.quantity} {item.product.uom.code}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <CheckCircle className="w-3 h-3" />
                        จัดส่งและตัดสต็อกแล้ว
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
