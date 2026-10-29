import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Truck, ArrowLeft, CheckCircle, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const receipts = await prisma.goodsReceipt.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      warehouse: true,
      purchaseOrder: {
        include: { vendor: true },
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
              href="/purchasing"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> กลับหน้าใบสั่งซื้อ (PO)
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ใบรับสินค้าเข้าคลัง (Goods Receipts: GRN)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            ประวัติการตรวจรับสินค้าจากผู้จัดจำหน่าย และบันทึกยอดสต็อกเข้าคลัง
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">เลขที่ใบรับ (GRN #)</th>
                <th className="px-5 py-3.5">อ้างอิงใบสั่งซื้อ (PO)</th>
                <th className="px-5 py-3.5">ผู้จัดจำหน่าย (Vendor)</th>
                <th className="px-5 py-3.5">คลังสินค้าปลายทาง</th>
                <th className="px-5 py-3.5">วันที่ตรวจรับ</th>
                <th className="px-5 py-3.5">รายการสินค้าที่รับ</th>
                <th className="px-5 py-3.5 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    ยังไม่มีรายการรับสินค้าเข้าคลัง (กดรับของได้จากหน้าใบสั่งซื้อ PO)
                  </td>
                </tr>
              ) : (
                receipts.map((grn) => (
                  <tr key={grn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-600 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      {grn.receiptNumber}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {grn.purchaseOrder?.orderNumber || "-"}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {grn.purchaseOrder?.vendor?.name || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {grn.warehouse.name} ({grn.warehouse.code})
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatDate(grn.receiptDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        {grn.items.map((item) => (
                          <div key={item.id} className="text-[11px] text-slate-700 flex items-center gap-1">
                            <Package className="w-3 h-3 text-slate-400" />
                            <span className="font-medium">{item.product.name}</span>:{" "}
                            <span className="font-bold text-emerald-600">
                              +{item.quantity} {item.product.uom.code}
                            </span>{" "}
                            <span className="text-slate-400">({item.location.name})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        รับของเข้าสต็อกแล้ว
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
