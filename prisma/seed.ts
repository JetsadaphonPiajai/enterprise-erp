import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 เริ่มต้นการ Seed ข้อมูลระบบ ERP...");

  // 1. ผู้ใช้งานเริ่มต้น
  const admin = await prisma.user.upsert({
    where: { email: "admin@erp.local" },
    update: {},
    create: {
      email: "admin@erp.local",
      name: "ผู้ดูแลระบบ (Admin)",
      role: "ADMIN",
    },
  });

  // 2. หน่วยนับสินค้า (Units of Measure)
  const uomPcs = await prisma.unitOfMeasure.upsert({
    where: { code: "PCS" },
    update: {},
    create: { code: "PCS", nameTh: "ชิ้น", nameEn: "Pieces" },
  });

  const uomBox = await prisma.unitOfMeasure.upsert({
    where: { code: "BOX" },
    update: {},
    create: { code: "BOX", nameTh: "กล่อง", nameEn: "Box" },
  });

  const uomPack = await prisma.unitOfMeasure.upsert({
    where: { code: "PACK" },
    update: {},
    create: { code: "PACK", nameTh: "แพ็ค", nameEn: "Pack" },
  });

  // 3. หมวดหมู่สินค้า
  const catElec = await prisma.productCategory.upsert({
    where: { code: "ELEC" },
    update: {},
    create: { code: "ELEC", name: "อุปกรณ์ไอทีและอิเล็กทรอนิกส์", description: "สินค้ากลุ่มอุปกรณ์ไอที" },
  });

  const catOffice = await prisma.productCategory.upsert({
    where: { code: "OFFICE" },
    update: {},
    create: { code: "OFFICE", name: "เครื่องใช้สำนักงาน", description: "อุปกรณ์และเครื่องเขียนสำนักงาน" },
  });

  // 4. คลังสินค้า และ ตำแหน่งจัดเก็บ
  const whMain = await prisma.warehouse.upsert({
    where: { code: "WH-MAIN" },
    update: {},
    create: {
      code: "WH-MAIN",
      name: "คลังสินค้าหลัก (ลาดกระบัง)",
      address: "123 นิคมอุตสาหกรรมลาดกระบัง กทม.",
    },
  });

  const whStore = await prisma.warehouse.upsert({
    where: { code: "WH-STORE" },
    update: {},
    create: {
      code: "WH-STORE",
      name: "คลังหน้าร้าน / Showroom",
      address: "88 ถนนสุขุมวิท กทม.",
    },
  });

  const locA01 = await prisma.stockLocation.upsert({
    where: {
      warehouseId_code: { warehouseId: whMain.id, code: "LOC-A01" },
    },
    update: {},
    create: {
      warehouseId: whMain.id,
      code: "LOC-A01",
      name: "โซน A ชั้นวางที่ 1 (Main Storage)",
    },
  });

  const locStoreFront = await prisma.stockLocation.upsert({
    where: {
      warehouseId_code: { warehouseId: whStore.id, code: "STORE-F01" },
    },
    update: {},
    create: {
      warehouseId: whStore.id,
      code: "STORE-F01",
      name: "หน้าร้าน ชั้นโชว์สินค้า",
    },
  });

  // 5. คู่ค้า (Vendor & Customer)
  const vendor1 = await prisma.partner.upsert({
    where: { code: "VEND-001" },
    update: {},
    create: {
      code: "VEND-001",
      name: "บริษัท สยาม ซัพพลาย เทคโนโลยี จำกัด",
      partnerType: "VENDOR",
      taxId: "0105558012345",
      branchCode: "00000",
      phone: "02-123-4567",
      email: "sale@siamsupply.co.th",
      address: "99 อาคารเทคโนโลยี ถนนพระราม 9 กทม.",
      creditTermDays: 30,
    },
  });

  const customer1 = await prisma.partner.upsert({
    where: { code: "CUST-001" },
    update: {},
    create: {
      code: "CUST-001",
      name: "บริษัท กรุงเทพ สมาร์ท โซลูชั่นส์ จำกัด",
      partnerType: "CUSTOMER",
      taxId: "0105561098765",
      branchCode: "00000",
      phone: "02-987-6543",
      email: "procurement@bkk-smart.com",
      address: "456 ถนนพหลโยธิน แขวงพญาไท เขตพญาไท กทม.",
      creditTermDays: 30,
    },
  });

  // 6. ข้อมูลสินค้าตัวอย่าง (Products)
  const productA = await prisma.product.upsert({
    where: { sku: "SKU-MONITOR-24" },
    update: {},
    create: {
      sku: "SKU-MONITOR-24",
      barcode: "8850001001",
      name: "จอมอนิเตอร์ IPS 24 นิ้ว 100Hz",
      description: "จอสำหรับทำงานถนอมสายตา สีสันแม่นยำ 99% sRGB",
      categoryId: catElec.id,
      uomId: uomPcs.id,
      costPrice: 2800.0,
      sellingPrice: 4200.0,
      minStockAlert: 10.0,
    },
  });

  const productB = await prisma.product.upsert({
    where: { sku: "SKU-KEYBOARD-MECH" },
    update: {},
    create: {
      sku: "SKU-KEYBOARD-MECH",
      barcode: "8850001002",
      name: "คีย์บอร์ดไร้สาย Mechanical Ergonomic",
      description: "คีย์บอร์ดบลูทูธ เชื่อมต่อ 3 อุปกรณ์ สวิตช์เงียบ",
      categoryId: catElec.id,
      uomId: uomPcs.id,
      costPrice: 1450.0,
      sellingPrice: 2490.0,
      minStockAlert: 15.0,
    },
  });

  const productC = await prisma.product.upsert({
    where: { sku: "SKU-PAPER-A4" },
    update: {},
    create: {
      sku: "SKU-PAPER-A4",
      barcode: "8850002001",
      name: "กระดาษถ่ายเอกสาร A4 80 แกรม (ลัง 5 รีม)",
      description: "กระดาษถ่ายเอกสารคุณภาพสูง เนื้อเนียน ขาวสว่าง",
      categoryId: catOffice.id,
      uomId: uomBox.id,
      costPrice: 450.0,
      sellingPrice: 620.0,
      minStockAlert: 20.0,
    },
  });

  // 7. สต็อกเริ่มต้น (Initial Stock Balances ผ่าน Stock Move เพื่อให้มีประวัติที่ถูกต้อง)
  // ให้จอมอนิเตอร์มี 50 ตัวในคลังหลัก
  await prisma.stockQuant.upsert({
    where: {
      productId_locationId: { productId: productA.id, locationId: locA01.id },
    },
    update: {},
    create: {
      productId: productA.id,
      locationId: locA01.id,
      quantity: 50,
      reservedQty: 0,
    },
  });

  await prisma.stockMove.upsert({
    where: { moveNumber: "SM-INIT-001" },
    update: {},
    create: {
      moveNumber: "SM-INIT-001",
      productId: productA.id,
      destLocationId: locA01.id,
      quantity: 50,
      unitCost: 2800.0,
      moveType: "ADJUSTMENT",
      referenceDoc: "INIT-INVENTORY",
      note: "ยอดยกมาเริ่มต้นระบบ",
      createdById: admin.id,
    },
  });

  // คีย์บอร์ด 8 ตัว (ต่ำกว่าเกณฑ์ 15 ตัว เพื่อทดสอบระบบ Alert แจ้งเตือนสินค้าใกล้หมด)
  await prisma.stockQuant.upsert({
    where: {
      productId_locationId: { productId: productB.id, locationId: locA01.id },
    },
    update: {},
    create: {
      productId: productB.id,
      locationId: locA01.id,
      quantity: 8,
      reservedQty: 0,
    },
  });

  await prisma.stockMove.upsert({
    where: { moveNumber: "SM-INIT-002" },
    update: {},
    create: {
      moveNumber: "SM-INIT-002",
      productId: productB.id,
      destLocationId: locA01.id,
      quantity: 8,
      unitCost: 1450.0,
      moveType: "ADJUSTMENT",
      referenceDoc: "INIT-INVENTORY",
      note: "ยอดยกมาเริ่มต้นระบบ (สต็อกเหลือน้อยเพื่อทดสอบ Alert)",
      createdById: admin.id,
    },
  });

  // กระดาษ A4 100 ลัง
  await prisma.stockQuant.upsert({
    where: {
      productId_locationId: { productId: productC.id, locationId: locA01.id },
    },
    update: {},
    create: {
      productId: productC.id,
      locationId: locA01.id,
      quantity: 100,
      reservedQty: 0,
    },
  });

  await prisma.stockMove.upsert({
    where: { moveNumber: "SM-INIT-003" },
    update: {},
    create: {
      moveNumber: "SM-INIT-003",
      productId: productC.id,
      destLocationId: locA01.id,
      quantity: 100,
      unitCost: 450.0,
      moveType: "ADJUSTMENT",
      referenceDoc: "INIT-INVENTORY",
      note: "ยอดยกมาเริ่มต้นระบบ",
      createdById: admin.id,
    },
  });

  // 8. Document Sequence เริ่มต้น
  const docTypes = ["PO", "GRN", "SO", "DO", "INV", "SM"];
  const now = new Date();
  for (const docType of docTypes) {
    await prisma.documentSequence.upsert({
      where: { docType },
      update: {},
      create: {
        docType,
        prefix: docType,
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth() + 1,
        currentSeq: docType === "SM" ? 3 : 0,
      },
    });
  }

  console.log("✅ Seed ข้อมูลระบบ ERP สำเร็จเรียบร้อย!");
}

main()
  .catch((e) => {
    console.error("❌ เกิดข้อผิดพลาดในการ seed ข้อมูล:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
