"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import {
  Plus,
  FileSpreadsheet,
  Truck,
  Receipt,
  CheckCircle,
  Clock,
  X,
  Trash2,
  Send,
} from "lucide-react";

interface SalesClientProps {
  salesOrders: any[];
  customers: any[];
  products: any[];
  locations: any[];
}

export function SalesClient({
  salesOrders,
  customers,
  products,
  locations,
}: SalesClientProps) {
  const router = useRouter();

  // Create SO Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<any[]>([
    { productId: products[0]?.id || "", quantity: 1, unitPrice: products[0]?.sellingPrice || 0 },
  ]);

  // Deliver Modal State
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [targetSO, setTargetSO] = useState<any>(null);
  const [deliverLocationId, setDeliverLocationId] = useState(locations[0]?.id || "");
  const [trackingNo, setTrackingNo] = useState("");
  const [deliverNote, setDeliverNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      if (prod) updated[index].unitPrice = prod.sellingPrice;
    }
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { productId: products[0]?.id || "", quantity: 1, unitPrice: products[0]?.sellingPrice || 0 },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const soSubtotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
    0
  );
  const soTax = (soSubtotal * 7) / 100;
  const soTotal = soSubtotal + soTax;

  const handleCreateSO = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/sales/so", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          dueDate,
          note,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setCreateModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverSO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSO || !deliverLocationId) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/sales/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salesOrderId: targetSO.id,
          locationId: deliverLocationId,
          trackingNo,
          note: deliverNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setDeliverModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ระบบงานขายและออกบิล (Sales & Invoicing)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ออกใบสั่งขาย (SO), จัดส่งสินค้า (DO) ตัดสต็อกจริง, และออกใบกำกับภาษี VAT 7%
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg("");
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          สร้างใบสั่งขายใหม่ (New SO)
        </button>
      </div>

      {/* SO List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">เลขที่ SO</th>
                <th className="px-5 py-3.5">ลูกค้า (Customer)</th>
                <th className="px-5 py-3.5">วันที่สั่งซื้อ</th>
                <th className="px-5 py-3.5 text-right">ยอดรวม (Inc. VAT)</th>
                <th className="px-5 py-3.5 text-center">สถานะ</th>
                <th className="px-5 py-3.5">ใบส่งของ / ใบกำกับภาษี</th>
                <th className="px-5 py-3.5 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    ยังไม่มีรายการใบสั่งขายในระบบ
                  </td>
                </tr>
              ) : (
                salesOrders.map((so) => {
                  const isDelivered = so.status === "DELIVERED";
                  const latestInvoice = so.invoices?.[0];

                  return (
                    <tr key={so.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-blue-600">{so.orderNumber}</div>
                        <div className="text-[11px] text-slate-400">
                          {so.items.length} รายการสินค้า
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{so.customer.name}</div>
                        <div className="text-[11px] text-slate-400">
                          Tax ID: {so.customer.taxId || "-"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{formatDate(so.orderDate)}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        {formatCurrency(so.totalAmount)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isDelivered
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isDelivered ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isDelivered ? "ส่งของแล้ว" : "รอดำเนินการจัดส่ง"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {latestInvoice ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-mono text-[11px] font-bold">
                            <Receipt className="w-3.5 h-3.5" />
                            {latestInvoice.invoiceNumber}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">รอเปิดบิลส่งของ</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {!isDelivered ? (
                          <button
                            onClick={() => {
                              setTargetSO(so);
                              setErrorMsg("");
                              setDeliverModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          >
                            <Send className="w-3.5 h-3.5" />
                            ส่งของ & ออกบิล
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">ตัดสต็อกแล้ว</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create New SO */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                ออกใบสั่งขายใหม่ (Create Sales Order)
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSO} className="flex-1 overflow-y-auto p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ลูกค้า (Customer)
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    กำหนดส่งมอบสินค้า
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">รายการสินค้า</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">สินค้า</th>
                        <th className="p-2.5 w-24 text-right">จำนวน</th>
                        <th className="p-2.5 w-32 text-right">ราคาขาย/หน่วย</th>
                        <th className="p-2.5 w-32 text-right">รวมเงิน</th>
                        <th className="p-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <select
                              value={item.productId}
                              onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                              className="w-full p-1.5 text-xs border border-slate-200 rounded"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.sku} - {p.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                              className="w-full p-1.5 text-xs text-right border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="any"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                              className="w-full p-1.5 text-xs text-right border border-slate-200 rounded"
                            />
                          </td>
                          <td className="p-2 text-right font-medium text-slate-700">
                            {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                          </td>
                          <td className="p-2 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItemRow(idx)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>มูลค่าสินค้าก่อนภาษี:</span>
                  <span>{formatCurrency(soSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                  <span>{formatCurrency(soTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
                  <span>ยอดสุทธิรวมภาษี:</span>
                  <span className="text-blue-600">{formatCurrency(soTotal)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น ส่งของที่สาขาใหญ่ วางบิลรอบสิ้นเดือน"
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
                >
                  {loading ? "กำลังสร้าง..." : "ยืนยันการออกใบสั่งขาย (SO)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Deliver & Generate Invoice */}
      {deliverModalOpen && targetSO && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50">
              <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                จัดส่งสินค้า & ออกใบกำกับภาษี
              </h3>
              <button
                onClick={() => setDeliverModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeliverSO} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">ใบสั่งขาย: </span>
                  <span className="font-mono font-bold text-blue-600">{targetSO.orderNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">ลูกค้า: </span>
                  <span className="font-semibold text-slate-800">{targetSO.customer.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">ยอดรวมบิล: </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(targetSO.totalAmount)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  เลือกคลังที่ต้องการตัดจ่ายสินค้าออก
                </label>
                <select
                  value={deliverLocationId}
                  onChange={(e) => setDeliverLocationId(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.warehouse.name} ({loc.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  เลขพัสดุ / ทะเบียนรถขนส่ง (Tracking No.)
                </label>
                <input
                  type="text"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  placeholder="เช่น TH123456789 หรือ ทะเบียน 1กข-9999"
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  หมายเหตุการส่งของ
                </label>
                <input
                  type="text"
                  value={deliverNote}
                  onChange={(e) => setDeliverNote(e.target.value)}
                  placeholder="เช่น จัดส่งผ่าน Flash Express, ส่งถึงคุณสมชาย"
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeliverModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
                >
                  {loading ? "กำลังตัดสต็อก..." : "ยืนยันตัดสต็อก & ออกใบกำกับภาษี"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
