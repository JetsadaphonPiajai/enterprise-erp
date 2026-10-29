"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";
import {
  Plus,
  ShoppingCart,
  Truck,
  CheckCircle,
  Clock,
  X,
  Trash2,
  PackageCheck,
} from "lucide-react";

interface PurchasingClientProps {
  purchaseOrders: any[];
  vendors: any[];
  products: any[];
  locations: any[];
}

export function PurchasingClient({
  purchaseOrders,
  vendors,
  products,
  locations,
}: PurchasingClientProps) {
  const router = useRouter();

  // Create PO Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [vendorId, setVendorId] = useState(vendors[0]?.id || "");
  const [expectedDate, setExpectedDate] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<any[]>([
    { productId: products[0]?.id || "", quantity: 1, unitPrice: products[0]?.costPrice || 0 },
  ]);

  // Receive Modal State
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [targetPO, setTargetPO] = useState<any>(null);
  const [receiveLocationId, setReceiveLocationId] = useState(locations[0]?.id || "");
  const [receiveNote, setReceiveNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handle line item changes
  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      if (prod) updated[index].unitPrice = prod.costPrice;
    }
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { productId: products[0]?.id || "", quantity: 1, unitPrice: products[0]?.costPrice || 0 },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculations for PO modal
  const poSubtotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
    0
  );
  const poTax = (poSubtotal * 7) / 100;
  const poTotal = poSubtotal + poTax;

  // Submit PO
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/purchasing/po", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          expectedDate,
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

  // Submit Receive Goods (GRN)
  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPO || !receiveLocationId) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/purchasing/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseOrderId: targetPO.id,
          locationId: receiveLocationId,
          note: receiveNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setReceiveModalOpen(false);
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
            ระบบจัดซื้อสินค้า (Purchasing Management)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ออกใบสั่งซื้อ (PO) และรับสินค้าเข้าคลัง (Goods Receipt) บันทึกสต็อกเข้าอัตโนมัติ
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
          สร้างใบสั่งซื้อใหม่ (New PO)
        </button>
      </div>

      {/* PO List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">เลขที่ PO</th>
                <th className="px-5 py-3.5">ผู้จัดจำหน่าย (Vendor)</th>
                <th className="px-5 py-3.5">วันที่สั่งซื้อ</th>
                <th className="px-5 py-3.5">กำหนดส่ง</th>
                <th className="px-5 py-3.5 text-right">ยอดรวม (Inc. VAT)</th>
                <th className="px-5 py-3.5 text-center">สถานะ</th>
                <th className="px-5 py-3.5 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    ยังไม่มีรายการใบสั่งซื้อในระบบ
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => {
                  const isCompleted = po.status === "COMPLETED";

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-blue-600">{po.orderNumber}</div>
                        <div className="text-[11px] text-slate-400">
                          {po.items.length} รายการสินค้า
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{po.vendor.name}</div>
                        <div className="text-[11px] text-slate-400">Code: {po.vendor.code}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {formatDate(po.orderDate)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {formatDate(po.expectedDate)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        {formatCurrency(po.totalAmount)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isCompleted ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isCompleted ? "รับของครบแล้ว" : "รอดำเนินการรับของ"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {!isCompleted ? (
                          <button
                            onClick={() => {
                              setTargetPO(po);
                              setErrorMsg("");
                              setReceiveModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            รับเข้าคลัง (GRN)
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">เสร็จสิ้น</span>
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

      {/* Modal 1: Create New PO */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                ออกใบสั่งซื้อใหม่ (Create Purchase Order)
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="flex-1 overflow-y-auto p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ผู้จัดจำหน่าย (Vendor)
                  </label>
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    กำหนดส่งสินค้าโดยประมาณ
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">รายการสินค้าสั่งซื้อ</label>
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
                        <th className="p-2.5 w-32 text-right">ราคา/หน่วย (บาท)</th>
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
                  <span>มูลค่าก่อนภาษี:</span>
                  <span>{formatCurrency(poSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                  <span>{formatCurrency(poTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
                  <span>ยอดรวมทั้งสิ้น:</span>
                  <span className="text-blue-600">{formatCurrency(poTotal)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น สั่งซื้อเพื่อรองรับคำสั่งซื้อลูกค้ารายใหญ่"
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
                  {loading ? "กำลังสร้าง..." : "ยืนยันการออกใบสั่งซื้อ (PO)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Receive Goods (GRN) */}
      {receiveModalOpen && targetPO && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
              <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                รับสินค้าเข้าคลัง (Goods Receipt)
              </h3>
              <button
                onClick={() => setReceiveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReceiveGoods} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">ใบสั่งซื้อ: </span>
                  <span className="font-mono font-bold text-blue-600">{targetPO.orderNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">ผู้ขาย: </span>
                  <span className="font-semibold text-slate-800">{targetPO.vendor.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">จำนวนสินค้าที่รับ: </span>
                  <span className="font-semibold text-slate-800">
                    {targetPO.items.length} รายการ (รับครบตามบิล)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  เลือกคลังและตำแหน่งจัดเก็บที่นำสินค้าเข้า
                </label>
                <select
                  value={receiveLocationId}
                  onChange={(e) => setReceiveLocationId(e.target.value)}
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
                  หมายเหตุการตรวจรับ
                </label>
                <input
                  type="text"
                  value={receiveNote}
                  onChange={(e) => setReceiveNote(e.target.value)}
                  placeholder="เช่น ตรวจนับสินค้าครบถ้วน สภาพสมบูรณ์"
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReceiveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition"
                >
                  {loading ? "กำลังรับของเข้าสต็อก..." : "ยืนยันรับเข้าคลังและอัปเดตสต็อก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
