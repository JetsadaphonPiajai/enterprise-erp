import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sku, barcode, name, description, categoryId, uomId, costPrice, sellingPrice, minStockAlert } = body;

    if (!sku || !name || !uomId) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัส SKU, ชื่อสินค้า และหน่วยนับ" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json(
        { error: `รหัส SKU "${sku}" มีอยู่ในระบบแล้ว` },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku,
        barcode: barcode || null,
        name,
        description: description || null,
        categoryId: categoryId || null,
        uomId,
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        minStockAlert: parseFloat(minStockAlert) || 0,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดในการเพิ่มสินค้า" },
      { status: 500 }
    );
  }
}
