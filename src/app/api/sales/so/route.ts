import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextSequenceNumber } from "@/lib/sequence";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, dueDate, note, items } = body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "กรุณาระบุลูกค้าและรายการสินค้าอย่างน้อย 1 รายการ" },
        { status: 400 }
      );
    }

    const orderNumber = await getNextSequenceNumber("SO");

    let subtotal = 0;
    const soItemsData = items.map((item: any) => {
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

    const so = await prisma.salesOrder.create({
      data: {
        orderNumber,
        customerId,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "CONFIRMED",
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        note,
        items: {
          create: soItemsData,
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json({ success: true, so });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดในการสร้างใบสั่งขาย" },
      { status: 500 }
    );
  }
}
