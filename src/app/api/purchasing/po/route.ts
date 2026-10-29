import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextSequenceNumber } from "@/lib/sequence";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vendorId, expectedDate, note, items } = body;

    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "กรุณาระบุผู้ขายและรายการสินค้าอย่างน้อย 1 รายการ" },
        { status: 400 }
      );
    }

    const orderNumber = await getNextSequenceNumber("PO");

    let subtotal = 0;
    const poItemsData = items.map((item: any) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const amount = qty * price;
      subtotal += amount;

      return {
        productId: item.productId,
        quantity: qty,
        unitPrice: price,
        amount: amount,
      };
    });

    const taxRate = 7.0;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        vendorId,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        status: "CONFIRMED",
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        note,
        items: {
          create: poItemsData,
        },
      },
      include: {
        vendor: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json({ success: true, po });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ" },
      { status: 500 }
    );
  }
}
