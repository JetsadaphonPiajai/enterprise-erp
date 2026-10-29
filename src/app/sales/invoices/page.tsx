import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Receipt, CheckCircle, Clock, ArrowLeft, Printer } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await prisma.taxInvoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      salesOrder: {
        include: {
          items: { include: { product: { include: { uom: true } } } },
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
              <ArrowLeft className="w-3.5 h-3.5" /> กลับหน้ารายการสั่งขาย
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ใบกำกับภาษี / ใบเสร็จรับเงิน (Tax Invoices)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            เอกสารภาษีมูลค่าเพิ่มตามมาตรฐานกรมสรรพากร (VAT 7%) พร้อมบันทึกสถานะการรับชำระ
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">เลขที่ใบกำกับภาษี</th>
                <th className="px-5 py-3.5">อ้างอิง SO</th>
                <th className="px-5 py-3.5">ลูกค้า (Customer)</th>
                <th className="px-5 py-3.5">เลขประจำตัวผู้เสียภาษี</th>
                <th className="px-5 py-3.5">วันที่ออกเอกสาร</th>
                <th className="px-5 py-3.5 text-right">มูลค่าก่อน VAT</th>
                <th className="px-5 py-3.5 text-right">VAT 7%</th>
                <th className="px-5 py-3.5 text-right">ยอดรวมทั้งสิ้น</th>
                <th className="px-5 py-3.5 text-center">สถานะชำระ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                    ยังไม่มีรายการใบกำกับภาษี (จะถูกสร้างอัตโนมัติเมื่อจัดส่งสินค้าจาก SO)
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-600 flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-slate-400" />
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {inv.salesOrder?.orderNumber || "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{inv.customer.name}</div>
                      <div className="text-[11px] text-slate-400">
                        สาขา: {inv.customer.branchCode === "00000" ? "สำนักงานใหญ่" : inv.customer.branchCode}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      {inv.customer.taxId || "-"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(inv.subtotal)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(inv.taxAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {inv.status === "PAID" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {inv.status === "PAID" ? "ชำระเงินแล้ว" : "รอรับชำระ"}
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
