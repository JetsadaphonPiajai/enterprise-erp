"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  AlertTriangle,
  Boxes,
  Check,
  X,
} from "lucide-react";

interface StockTableProps {
  products: any[];
  locations: any[];
}

export function StockTable({ products, locations }: StockTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id || "");
  const [adjustQty, setAdjustQty] = useState("");
  const [moveType, setMoveType] = useState<"IN" | "OUT">("IN");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm));
    if (filterLowStock) {
      return matchSearch && p.isLowStock;
    }
    return matchSearch;
  });

  const handleOpenAdjust = (product: any) => {
    setSelectedProduct(product);
    setAdjustQty("");
    setMoveType("IN");
    setNote("");
    setErrorMsg("");
    setAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedLocation || !adjustQty) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          locationId: selectedLocation,
          quantity: parseFloat(adjustQty),
          moveType,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setAdjustModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาด้วย SKU, Barcode หรือชื่อสินค้า..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
              filterLowStock
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            เฉพาะสินค้าใกล้หมด
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">รหัส SKU / บาร์โค้ด</th>
                <th className="px-5 py-3.5">ชื่อสินค้า</th>
                <th className="px-5 py-3.5">หมวดหมู่</th>
                <th className="px-5 py-3.5 text-right">ยอดคงเหลือรวม</th>
                <th className="px-5 py-3.5 text-right">เกณฑ์เตือน</th>
                <th className="px-5 py-3.5 text-right">ต้นทุน/หน่วย</th>
                <th className="px-5 py-3.5 text-right">มูลค่ารวม</th>
                <th className="px-5 py-3.5 text-center">จัดการสต็อก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    ไม่พบข้อมูลสินค้าที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-slate-900">{p.sku}</div>
                      {p.barcode && <div className="text-[11px] text-slate-400">Barcode: {p.barcode}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      {p.description && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className={`font-bold text-sm ${p.isLowStock ? "text-amber-600" : "text-slate-900"}`}>
                        {formatNumber(p.totalOnHand)} <span className="text-xs font-normal text-slate-500">{p.uom}</span>
                      </div>
                      {p.isLowStock && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          ต่ำกว่าเกณฑ์
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500">
                      {formatNumber(p.minStockAlert)} {p.uom}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(p.costPrice)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(p.totalValue)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleOpenAdjust(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        ปรับยอดสต็อก
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                ปรับยอดสต็อก (Stock Adjustment)
              </h3>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  สินค้าที่เลือก
                </label>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-mono font-bold text-blue-600">{selectedProduct.sku}</span> - {selectedProduct.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ประเภทการปรับ
                  </label>
                  <select
                    value={moveType}
                    onChange={(e: any) => setMoveType(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="IN">➕ รับเข้า / ปรับเพิ่ม</option>
                    <option value="OUT">➖ ตัดจ่าย / ปรับลด</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    คลัง / ตำแหน่ง
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.warehouse.name} ({loc.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  จำนวน ({selectedProduct.uom})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="เช่น 10"
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  หมายเหตุ / เหตุผลการปรับ
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น ตรวจนับสต็อกประจำเดือน, สินค้าชำรุด"
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
                >
                  {loading ? "กำลังบันทึก..." : "ยืนยันการบันทึกสต็อก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
