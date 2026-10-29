"use client";

import Link from "next/link";
import { Plus, Bell, Search, Shield, HelpCircle } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-20 px-8 flex items-center justify-between">
      {/* Search / Global Jump */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาเอกสาร (PO, SO, INV), SKU หรือชื่อสินค้า..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Quick Actions & System Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 mr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-slate-500 font-medium">Database Online (ACID Safe)</span>
        </div>

        <Link
          href="/purchasing"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          เปิด PO
        </Link>

        <Link
          href="/sales"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          เปิดใบสั่งขาย (SO)
        </Link>
      </div>
    </header>
  );
}
