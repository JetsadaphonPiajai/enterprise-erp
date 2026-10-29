"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Plus, Package, Search, X } from "lucide-react";

interface ProductsClientProps {
  products: any[];
  categories: any[];
  uoms: any[];
}

export function ProductsClient({ products, categories, uoms }: ProductsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [uomId, setUomId] = useState(uoms[0]?.id || "");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [minStockAlert, setMinStockAlert] = useState("10");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm))
  );

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          barcode,
          name,
          description,
          categoryId,
          uomId,
          costPrice,
          sellingPrice,
          minStockAlert,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setModalOpen(false);
      setSku("");
      setBarcode("");
      setName("");
      setDescription("");
      setCostPrice("");
      setSellingPrice("");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ฐานข้อมูลสินค้าและราคา (Products Master Data)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            จัดการรหัส SKU, บาร์โค้ด, หน่วยนับ, ต้นทุน และราคาขายมาตรฐาน
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg("");
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          เพิ่มสินค้าใหม่ (New SKU)
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหา SKU หรือชื่อสินค้า..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">รหัส SKU</th>
                <th className="px-5 py-3.5">ชื่อสินค้า</th>
                <th className="px-5 py-3.5">หมวดหมู่</th>
                <th className="px-5 py-3.5 text-center">หน่วยนับ</th>
                <th className="px-5 py-3.5 text-right">ต้นทุนมาตรฐาน</th>
                <th className="px-5 py-3.5 text-right">ราคาขาย</th>
                <th className="px-5 py-3.5 text-right">มาร์จิ้นกำไร (%)</th>
                <th className="px-5 py-3.5 text-right">จุดเตือนสั่งซื้อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const margin =
                  p.sellingPrice > 0
                    ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1)
                    : "0.0";

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-blue-600">{p.sku}</div>
                      {p.barcode && <div className="text-[11px] text-slate-400">Barcode: {p.barcode}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      {p.description && (
                        <div className="text-[11px] text-slate-400 truncate max-w-sm">{p.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px]">
                        {p.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-medium text-slate-700">
                      {p.uom.nameTh} ({p.uom.code})
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(p.costPrice)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">
                      {margin}%
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500">
                      {formatNumber(p.minStockAlert)} {p.uom.code}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                เพิ่มข้อมูลสินค้าใหม่ (New Product)
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">รหัส SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="เช่น SKU-SSD-1TB"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">บาร์โค้ด</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="เช่น 8850001003"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น SSD NVMe 1TB PCIe 4.0"
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">หมวดหมู่</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">หน่วยนับ *</label>
                  <select
                    value={uomId}
                    onChange={(e) => setUomId(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    {uoms.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nameTh} ({u.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ต้นทุน (บาท)</label>
                  <input
                    type="number"
                    step="any"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ราคาขาย (บาท)</label>
                  <input
                    type="number"
                    step="any"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เกณฑ์เตือนสต็อก</label>
                  <input
                    type="number"
                    step="any"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    placeholder="10"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">คำอธิบาย</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="รายละเอียดสินค้า สเปก หรือเงื่อนไขการรับประกัน"
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
                >
                  {loading ? "กำลังบันทึก..." : "บันทึกสินค้าใหม่"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
