import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import {
  Boxes,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  PackagePlus,
  Truck,
  Plus,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch real-time dashboard statistics
  const [
    products,
    stockMoves,
    purchaseOrders,
    salesOrders,
    warehousesCount,
    partnersCount,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        uom: true,
        category: true,
        stockQuants: { include: { location: true } },
      },
    }),
    prisma.stockMove.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        product: { include: { uom: true } },
        sourceLocation: { include: { warehouse: true } },
        destLocation: { include: { warehouse: true } },
      },
    }),
    prisma.purchaseOrder.findMany({
      where: { status: { in: ["DRAFT", "CONFIRMED", "PARTIAL"] } },
      include: { vendor: true },
    }),
    prisma.salesOrder.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.warehouse.count({ where: { isActive: true } }),
    prisma.partner.count({ where: { isActive: true } }),
  ]);

  // Calculate KPIs
  let totalInventoryValue = 0;
  let totalItemUnits = 0;
  const lowStockItems = [];

  for (const p of products) {
    const onHand = p.stockQuants.reduce((sum, q) => sum + q.quantity, 0);
    totalItemUnits += onHand;
    totalInventoryValue += onHand * p.costPrice;

    if (p.minStockAlert > 0 && onHand <= p.minStockAlert) {
      lowStockItems.push({
        ...p,
        totalOnHand: onHand,
      });
    }
  }

  const pendingPOValue = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const totalSalesValue = salesOrders.reduce((sum, so) => sum + so.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ระบบบริหารจัดการทรัพยากรองค์กร (ERP Dashboard)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ภาพรวมสต็อกสินค้า การจัดซื้อ การขาย และการเคลื่อนไหวทางธุรกิจแบบ Real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/inventory"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition"
          >
            ตรวจสอบสต็อกรวม ({products.length} รายการ)
          </Link>
          <Link
            href="/purchasing"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> ออกใบสั่งซื้อ (PO)
          </Link>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Inventory Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              มูลค่าสินค้าคงคลังรวม
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalInventoryValue)}
            </h2>
            <div className="mt-1 flex items-center text-xs text-slate-500">
              <span>รวม {formatNumber(totalItemUnits)} ชิ้น ใน {warehousesCount} คลัง</span>
            </div>
          </div>
        </div>

        {/* Card 2: Low Stock Alert */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              สินค้าใกล้หมด (Reorder Point)
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className={`text-2xl font-bold ${lowStockItems.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {lowStockItems.length} รายการ
            </h2>
            <div className="mt-1 text-xs text-slate-500">
              {lowStockItems.length > 0 ? "ต้องเร่งออก PO สั่งซื้อด่วน" : "สต็อกทุกรายการอยู่ในระดับปกติ"}
            </div>
          </div>
        </div>

        {/* Card 3: Pending PO */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              PO รอรับของเข้า (Incoming)
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900">
              {purchaseOrders.length} ฉบับ
            </h2>
            <div className="mt-1 text-xs text-slate-500">
              มูลค่าสั่งซื้อ {formatCurrency(pendingPOValue)}
            </div>
          </div>
        </div>

        {/* Card 4: Sales Activity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              คู่ค้าในระบบ (Partners)
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900">
              {partnersCount} ราย
            </h2>
            <div className="mt-1 text-xs text-slate-500">
              ลูกค้า & ผู้ผลิต/ผู้จัดจำหน่าย
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert & Recent Moves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Warning Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <h3 className="font-bold text-slate-800 text-base">
                รายการสินค้าที่ต้องเติมสต็อก (จุดสั่งซื้อซ้ำ)
              </h3>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              ไม่มีสินค้าที่สต็อกต่ำกว่าเกณฑ์
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-3">รหัส SKU</th>
                    <th className="pb-3">ชื่อสินค้า</th>
                    <th className="pb-3 text-right">คงเหลือจริง</th>
                    <th className="pb-3 text-right">เกณฑ์เตือน</th>
                    <th className="pb-3 text-right">ต้นทุน/หน่วย</th>
                    <th className="pb-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-mono font-medium text-slate-900">{item.sku}</td>
                      <td className="py-3 font-medium text-slate-800">{item.name}</td>
                      <td className="py-3 text-right font-bold text-amber-600">
                        {formatNumber(item.totalOnHand)} {item.uom.code}
                      </td>
                      <td className="py-3 text-right text-slate-500">
                        {formatNumber(item.minStockAlert)} {item.uom.code}
                      </td>
                      <td className="py-3 text-right text-slate-700">
                        {formatCurrency(item.costPrice)}
                      </td>
                      <td className="py-3 text-center">
                        <Link
                          href={`/purchasing?productId=${item.id}`}
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition"
                        >
                          ออก PO ทันที
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Recent Stock Ledger Moves */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">การเคลื่อนไหวสต็อกล่าสุด</h3>
            <Link
              href="/inventory/moves"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="space-y-3">
            {stockMoves.map((move) => {
              const isReceipt = move.moveType === "RECEIPT" || (move.destLocationId && !move.sourceLocationId);
              const isDelivery = move.moveType === "DELIVERY" || (move.sourceLocationId && !move.destLocationId);

              return (
                <div
                  key={move.id}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition bg-slate-50/50 flex items-start gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isReceipt
                        ? "bg-emerald-100 text-emerald-700"
                        : isDelivery
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isReceipt ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : isDelivery ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <Boxes className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {move.product.name}
                      </p>
                      <span className={`text-xs font-bold ${isReceipt ? "text-emerald-600" : isDelivery ? "text-rose-600" : "text-blue-600"}`}>
                        {isReceipt ? "+" : isDelivery ? "-" : ""}{formatNumber(move.quantity)} {move.product.uom.code}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{move.referenceDoc || move.moveNumber}</span>
                      <span>{formatDate(move.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Business Workflow Pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 text-base mb-4">
          ผังวงจรการทำงานมาตรฐานธุรกิจซื้อมาขายไป (Trading Operations Flow)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
          <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-100">
            <div className="text-xs font-bold text-blue-600 mb-1">สเต็ป 1</div>
            <div className="font-semibold text-slate-800 text-sm">ใบสั่งซื้อ (PO)</div>
            <p className="text-[11px] text-slate-500 mt-1">ส่งรายการให้ซัพพลายเออร์</p>
          </div>
          <div className="p-4 rounded-lg bg-indigo-50/70 border border-indigo-100">
            <div className="text-xs font-bold text-indigo-600 mb-1">สเต็ป 2</div>
            <div className="font-semibold text-slate-800 text-sm">รับของเข้าคลัง (GRN)</div>
            <p className="text-[11px] text-slate-500 mt-1">บันทึก Stock In อัตโนมัติ</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-100">
            <div className="text-xs font-bold text-amber-600 mb-1">สเต็ป 3</div>
            <div className="font-semibold text-slate-800 text-sm">ใบสั่งขาย (SO)</div>
            <p className="text-[11px] text-slate-500 mt-1">ลูกค้ายืนยันคำสั่งซื้อ</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50/70 border border-purple-100">
            <div className="text-xs font-bold text-purple-600 mb-1">สเต็ป 4</div>
            <div className="font-semibold text-slate-800 text-sm">ใบส่งของ (DO)</div>
            <p className="text-[11px] text-slate-500 mt-1">ตัดจ่ายสินค้า Stock Out</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-100">
            <div className="text-xs font-bold text-emerald-600 mb-1">สเต็ป 5</div>
            <div className="font-semibold text-slate-800 text-sm">ใบกำกับภาษี (INV)</div>
            <p className="text-[11px] text-slate-500 mt-1">VAT 7% & ใบเสร็จรับเงิน</p>
          </div>
        </div>
      </div>
    </div>
  );
}
