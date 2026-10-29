import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StockMovesPage() {
  const moves = await prisma.stockMove.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { include: { uom: true } },
      sourceLocation: { include: { warehouse: true } },
      destLocation: { include: { warehouse: true } },
      createdBy: true,
    },
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
            สมุดบันทึกการเคลื่อนไหวสต็อก (Stock Movement Ledger)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            บันทึกประวัติการรับเข้า จ่ายออก และโอนย้ายสต็อกทั้งหมดอย่างละเอียด (Audit Trail)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">วันที่ / เวลา</th>
                <th className="px-5 py-3.5">เลขที่รายการ (Move #)</th>
                <th className="px-5 py-3.5">สินค้า (Product)</th>
                <th className="px-5 py-3.5">ประเภท</th>
                <th className="px-5 py-3.5">จาก (Source)</th>
                <th className="px-5 py-3.5">ไปที่ (Destination)</th>
                <th className="px-5 py-3.5 text-right">จำนวน</th>
                <th className="px-5 py-3.5 text-right">ต้นทุน/หน่วย</th>
                <th className="px-5 py-3.5">เอกสารอ้างอิง / หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {moves.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    ยังไม่มีรายการเคลื่อนไหวสต็อกในระบบ
                  </td>
                </tr>
              ) : (
                moves.map((m) => {
                  const isReceipt = m.moveType === "RECEIPT" || (m.destLocationId && !m.sourceLocationId);
                  const isDelivery = m.moveType === "DELIVERY" || (m.sourceLocationId && !m.destLocationId);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                        {m.moveNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{m.product.name}</div>
                        <div className="font-mono text-[11px] text-slate-400">{m.product.sku}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isReceipt
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isDelivery
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isReceipt && <ArrowDownRight className="w-3 h-3" />}
                          {isDelivery && <ArrowUpRight className="w-3 h-3" />}
                          {!isReceipt && !isDelivery && <ArrowLeftRight className="w-3 h-3" />}
                          {m.moveType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {m.sourceLocation ? (
                          <span>
                            {m.sourceLocation.warehouse.name} ({m.sourceLocation.name})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">ผู้ผลิต / จัดซื้อภายนอก</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {m.destLocation ? (
                          <span>
                            {m.destLocation.warehouse.name} ({m.destLocation.name})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">ลูกค้า / ตัดจ่ายออก</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        <span className={isReceipt ? "text-emerald-600" : isDelivery ? "text-rose-600" : ""}>
                          {isReceipt ? "+" : isDelivery ? "-" : ""}
                          {formatNumber(m.quantity)} {m.product.uom.code}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-700">
                        {formatCurrency(m.unitCost)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        <div className="font-medium text-slate-700">{m.referenceDoc || "-"}</div>
                        {m.note && <div className="text-[11px] text-slate-400">{m.note}</div>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
