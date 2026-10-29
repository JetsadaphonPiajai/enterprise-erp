"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Search, Building2, Phone, Mail, X } from "lucide-react";

interface PartnersClientProps {
  partners: any[];
}

export function PartnersClient({ partners }: PartnersClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [partnerType, setPartnerType] = useState("CUSTOMER");
  const [taxId, setTaxId] = useState("");
  const [branchCode, setBranchCode] = useState("00000");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [creditTermDays, setCreditTermDays] = useState("30");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = partners.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.taxId && p.taxId.includes(searchTerm));

    if (typeFilter !== "ALL") {
      return matchSearch && (p.partnerType === typeFilter || p.partnerType === "BOTH");
    }
    return matchSearch;
  });

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          partnerType,
          taxId,
          branchCode,
          phone,
          email,
          address,
          creditTermDays,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

      setModalOpen(false);
      setName("");
      setTaxId("");
      setPhone("");
      setEmail("");
      setAddress("");
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
            ระบบบริหารคู่ค้า (Business Partners - CRM/SRM)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ข้อมูลลูกค้าและผู้ขาย เลขประจำตัวผู้เสียภาษี สำนักงานใหญ่/สาขา และเงื่อนไขเครดิตเทอม
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
          เพิ่มคู่ค้าใหม่ (New Partner)
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อคู่ค้า, รหัส หรือเลขผู้เสียภาษี..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "CUSTOMER", "VENDOR"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                typeFilter === type
                  ? "bg-blue-50 text-blue-700 border-blue-200 font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {type === "ALL" ? "ทั้งหมด" : type === "CUSTOMER" ? "ลูกค้า (Customers)" : "ผู้จำหน่าย (Vendors)"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">รหัสคู่ค้า</th>
                <th className="px-5 py-3.5">ชื่อบริษัท / นิติบุคคล / บุคคล</th>
                <th className="px-5 py-3.5">ประเภท</th>
                <th className="px-5 py-3.5">เลขประจำตัวผู้เสียภาษี</th>
                <th className="px-5 py-3.5">สาขา</th>
                <th className="px-5 py-3.5">การติดต่อ</th>
                <th className="px-5 py-3.5 text-center">เครดิตเทอม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-blue-600">{p.code}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-800">{p.name}</div>
                    {p.address && (
                      <div className="text-[11px] text-slate-400 truncate max-w-sm">{p.address}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.partnerType === "CUSTOMER"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : p.partnerType === "VENDOR"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {p.partnerType === "CUSTOMER" ? "ลูกค้า" : p.partnerType === "VENDOR" ? "ผู้จำหน่าย" : "คู่ค้าทั้งสองฝั่ง"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">{p.taxId || "-"}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {p.branchCode === "00000" ? "สำนักงานใหญ่" : `สาขา ${p.branchCode}`}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5 text-slate-600">
                      {p.phone && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" /> {p.phone}
                        </div>
                      )}
                      {p.email && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" /> {p.email}
                        </div>
                      )}
                      {!p.phone && !p.email && <span className="text-slate-400">-</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center font-semibold text-slate-800">
                    {p.creditTermDays} วัน
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Partner */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                เพิ่มข้อมูลคู่ค้าใหม่ (New Partner)
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ประเภทคู่ค้า *
                </label>
                <select
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="CUSTOMER">ลูกค้า (Customer - งานขาย)</option>
                  <option value="VENDOR">ผู้จัดจำหน่าย / ซัพพลายเออร์ (Vendor - งานจัดซื้อ)</option>
                  <option value="BOTH">ทั้งลูกค้าและผู้ขาย (Both)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ชื่อบริษัท / นิติบุคคล / บุคคล *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น บริษัท เอสซีจี เทรดดิ้ง จำกัด"
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    เลขประจำตัวผู้เสียภาษี (13 หลัก)
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="01055xxxxxxxx"
                    maxLength={13}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">รหัสสาขา</label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="00000 = สนง.ใหญ่"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="02-xxx-xxxx หรือ 08x-xxx-xxxx"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">อีเมลติดต่อ</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    เครดิตเทอม (วัน)
                  </label>
                  <input
                    type="number"
                    value={creditTermDays}
                    onChange={(e) => setCreditTermDays(e.target.value)}
                    placeholder="30"
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ที่อยู่จดทะเบียน / ที่อยู่ออกใบกำกับภาษี
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
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
                  {loading ? "กำลังบันทึก..." : "บันทึกคู่ค้า"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
