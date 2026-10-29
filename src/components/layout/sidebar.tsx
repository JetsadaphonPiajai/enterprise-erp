"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Warehouse,
  Boxes,
  ArrowLeftRight,
  ShoppingCart,
  Truck,
  Receipt,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "ภาพรวม",
    items: [
      { title: "แดชบอร์ดหลัก", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "คลังสินค้า & สต็อก",
    items: [
      { title: "สต็อกคงเหลือ (Stock)", href: "/inventory", icon: Boxes },
      { title: "ประวัติการเคลื่อนไหว", href: "/inventory/moves", icon: ArrowLeftRight },
      { title: "คลัง & ตำแหน่งจัดเก็บ", href: "/warehouses", icon: Warehouse },
    ],
  },
  {
    title: "จัดซื้อ (Purchasing)",
    items: [
      { title: "ใบสั่งซื้อ (PO)", href: "/purchasing", icon: ShoppingCart },
      { title: "รับสินค้าเข้าคลัง (GRN)", href: "/purchasing/receipts", icon: Truck },
    ],
  },
  {
    title: "งานขาย & ภาษี (Sales)",
    items: [
      { title: "ใบสั่งขาย (SO)", href: "/sales", icon: FileSpreadsheet },
      { title: "ใบส่งของ (DO)", href: "/sales/deliveries", icon: Truck },
      { title: "ใบกำกับภาษี (Invoice)", href: "/sales/invoices", icon: Receipt },
    ],
  },
  {
    title: "ข้อมูลหลัก (Master Data)",
    items: [
      { title: "สินค้าและราคา", href: "/products", icon: Package },
      { title: "คู่ค้า (ลูกค้า/ผู้ขาย)", href: "/partners", icon: Users },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand / Logo */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100 bg-slate-900 text-white">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg shadow-sm">
          E
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight leading-none text-white">NextERP Enterprise</h1>
          <span className="text-[11px] text-blue-300 font-medium">Wholesale & Retail Edition</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {section.title}
            </h2>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    <span className="flex-1">{item.title}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-500" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">Admin Supervisor</p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> สิทธิ์ผู้ดูแลระบบสูงสุด
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
