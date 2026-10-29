# NextERP Enterprise (Wholesale & Retail Edition)

ระบบบริหารจัดการทรัพยากรองค์กร (ERP) สถาปัตยกรรมระดับ Enterprise สำหรับ **ธุรกิจซื้อมาขายไป (Trading / Wholesale & Retail)** พัฒนาด้วย Next.js 14 App Router, TypeScript, Tailwind CSS, และ PostgreSQL / Prisma ORM

---

## 🌟 จุดเด่นของระบบ (Key Features)

### 1. ระบบคลังสินค้าแบบ Double-Entry Inventory Ledger (มาตรฐาน Odoo / SAP)
- **ไม่ใช้วิธีแก้ตัวเลข stock ตรงๆ**: ป้องกัน Race Condition และความผิดพลาดของสต็อกติดลบ
- ทุกการเพิ่ม ลด หรือโอนย้ายสต็อก จะถูกบันทึกเป็น **Stock Move (Immutable Ledger)**
- ยอดคงเหลือจริง (**On-hand**) คำนวณจากประวัติการเคลื่อนไหวจริง พร้อมระบบตรวจสอบย้อนกลับ (Audit Trail)
- **Reorder Point Alert**: แจ้งเตือนสินค้าที่มีสต็อกต่ำกว่าเกณฑ์ความปลอดภัยทันที

### 2. วงจรการจัดซื้อและรับของเข้าคลัง (Purchasing & GRN)
- **Purchase Order (PO)**: ออกใบสั่งซื้อสินค้า พร้อมคำนวณภาษีมูลค่าเพิ่ม (VAT 7%)
- **Goods Receipt (GRN)**: ตรวจรับสินค้าเข้าคลัง และเรียกใช้ `StockService` ตัดรับสินค้าเข้าตำแหน่งคลังที่กำหนดอัตโนมัติ

### 3. วงจรงานขายและการออกเอกสารภาษี (Sales & Invoicing)
- **Sales Order (SO)**: ออกใบสั่งขายสินค้า พร้อมตรวจสอบราคาและคำนวณภาษี
- **Delivery Order (DO)**: ระบบจัดส่งสินค้า ตัดสต็อกจริงออกจากคลังสินค้าต้นทาง
- **Tax Invoice / Receipt**: สร้างใบกำกับภาษีอัตโนมัติเมื่อจัดส่งสินค้า รองรับเลขนิติบุคคล 13 หลัก และรหัสสาขา (00000 = สนง.ใหญ่) ตามมาตรฐานสรรพากร

### 4. ระบบรันเลขที่เอกสารอัตโนมัติ (Document Sequencing Engine)
- รูปแบบมาตรฐานองค์กร: `{PREFIX}-{YYYY}{MM}-{0000}`
  - `PO-202610-0001` (ใบสั่งซื้อ)
  - `GRN-202610-0001` (ใบรับสินค้า)
  - `SO-202610-0001` (ใบสั่งขาย)
  - `DO-202610-0001` (ใบส่งของ)
  - `INV-202610-0001` (ใบกำกับภาษี)
  - `SM-202610-0001` (Stock Move)

---

## 🚀 วิธีการติดตั้งและรันระบบ (Quick Start)

### ข้อกำหนดพื้นฐาน
- Node.js version 18.x หรือใหม่กว่า (แนะนำ Node.js 20+)
- npm หรือ pnpm

### 1. รันระบบสำหรับ Local Development (พร้อมใช้งานทันทีด้วย SQLite)
```bash
# ติดตั้ง dependencies (หากยังไม่ได้ติดตั้ง)
npm install

# ซิงค์ฐานข้อมูลและสร้างตาราง
npx prisma db push

# โหลดข้อมูลตัวอย่างตั้งต้น (Admin, สินค้า, คลัง, คู่ค้า, สต็อก)
npm run db:seed

# รัน Server พัฒนา
npm run dev
```
เปิดบราวเซอร์ไปที่: `http://localhost:3000`

---

## 🐘 การเชื่อมต่อกับ PostgreSQL (สำหรับ Production หรือ Supabase/Neon)

หากต้องการเปลี่ยนจาก SQLite เป็น PostgreSQL ใน Production:

1. เปิดไฟล์ `prisma/schema.prisma` แล้วแก้ไขบรรทัดบนสุด:
```prisma
datasource db {
  provider = "postgresql" // เปลี่ยนจาก sqlite เป็น postgresql
  url      = env("DATABASE_URL")
}
```

2. แก้ไขไฟล์ `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/erp_db?schema=public"
```

3. รันคำสั่ง push schema เข้าสู่ PostgreSQL:
```bash
npx prisma db push
npm run db:seed
```

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
d:\ERP
├── prisma/
│   ├── schema.prisma         # โครงสร้างฐานข้อมูล Master Data, Inventory, Sales, Purchasing
│   └── seed.ts               # ตัวสคริปต์จำลองข้อมูลทดสอบ (Master Data & Initial Stock)
├── src/
│   ├── app/
│   │   ├── api/              # Backend API Routes
│   │   │   ├── inventory/    # ปรับยอดสต็อก (Stock Adjustments)
│   │   │   ├── purchasing/   # ออก PO และรับสินค้าเข้าคลัง (GRN)
│   │   │   ├── sales/        # ออก SO, จัดส่งสินค้า (DO) และออกใบกำกับภาษี
│   │   │   ├── products/     # Master Data สินค้า
│   │   │   └── partners/     # Master Data คู่ค้า
│   │   ├── inventory/        # หน้าสต็อกคงเหลือ & สมุดบันทึกการเคลื่อนไหว
│   │   ├── purchasing/       # หน้าบริหารงานจัดซื้อ
│   │   ├── sales/            # หน้าบริหารงานขายและใบกำกับภาษี
│   │   ├── products/         # หน้าจัดการสินค้าและราคา
│   │   ├── partners/         # หน้าจัดการคู่ค้า
│   │   ├── warehouses/       # หน้าผังคลังและตำแหน่งจัดเก็บ
│   │   ├── layout.tsx        # Enterprise Root Shell พร้อม Sidebar & Navigation
│   │   └── page.tsx          # ERP Dashboard สรุปภาพรวม KPIs
│   ├── components/layout/    # Sidebar, Header, Global Search
│   └── lib/
│       ├── prisma.ts         # Prisma Client Singleton
│       ├── stock-service.ts  # สถาปัตยกรรม Double-Entry Inventory Service
│       ├── sequence.ts       # Document Sequencing Engine
│       └── utils.ts          # ตัวจัดรูปแบบสกุลเงิน (THB), ตัวเลข และวันที่
```
