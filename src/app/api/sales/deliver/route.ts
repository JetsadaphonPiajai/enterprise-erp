import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StockService } from "@/lib/stock-service";
import { getNextSequenceNumber } from "@/lib/sequence";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { salesOrderId, locationId, trackingNo, note } = body;

    if (!salesOrderId || !locationId) {
      return NextResponse.json(
        { error: "กรุณาระบุเลขที่ใบสั่งขายและคลังสินค้าที่ตัดจ่าย" },
        { status: 400 }
      );
    }

    const so = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    if (!so) {
      return NextResponse.json({ error: "ไม่พบข้อมูลใบสั่งขาย" }, { status: 404 });
    }

    const location = await prisma.stockLocation.findUnique({
      where: { id: locationId },
      include: { warehouse: true },
    });

    if (!location) {
      return NextResponse.json({ error: "ไม่พบตำแหน่งจัดเก็บในคลัง" }, { status: 404 });
    }

    // Check stock availability
    for (const item of so.items) {
      const quant = await prisma.stockQuant.findUnique({
        where: {
          productId_locationId: { productId: item.productId, locationId: location.id },
        },
      });

      const currentStock = quant?.quantity || 0;
      if (currentStock < item.quantity) {
        return NextResponse.json(
          {
            error: `สินค้า "${item.product.name}" ในคลัง "${location.warehouse.name}" มีคงเหลือ ${currentStock} ชิ้น ไม่เพียงพอต่อการส่งมอบ (${item.quantity} ชิ้น)`,
          },
          { status: 400 }
        );
      }
    }

    const deliveryNumber = await getNextSequenceNumber("DO");
    const invoiceNumber = await getNextSequenceNumber("INV");

    // Execute in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create Delivery Order
      await tx.deliveryOrder.create({
        data: {
          deliveryNumber,
          salesOrderId: so.id,
          warehouseId: location.warehouseId,
          status: "SHIPPED",
          trackingNo: trackingNo || null,
          note: note || `จัดส่งสินค้าตามใบสั่งขาย ${so.orderNumber}`,
          items: {
            create: so.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              locationId: location.id,
            })),
          },
        },
      });

      // 2. Auto-generate Tax Invoice
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (so.customer.creditTermDays || 30));

      await tx.taxInvoice.create({
        data: {
          invoiceNumber,
          salesOrderId: so.id,
          customerId: so.customerId,
          invoiceDate: new Date(),
          dueDate,
          subtotal: so.subtotal,
          taxRate: so.taxRate,
          taxAmount: so.taxAmount,
          totalAmount: so.totalAmount,
          status: "UNPAID",
          note: `ออกใบกำกับภาษีตามคำสั่งขาย ${so.orderNumber}`,
        },
      });

      // 3. Update SO status
      await tx.salesOrder.update({
        where: { id: so.id },
        data: { status: "DELIVERED" },
      });

      for (const item of so.items) {
        await tx.salesOrderItem.update({
          where: { id: item.id },
          data: { deliveredQty: item.quantity },
        });
      }
    });

    // 4. Record Stock Moves (Stock Out from warehouse to customer)
    for (const item of so.items) {
      await StockService.recordMove({
        productId: item.productId,
        sourceLocationId: location.id,
        quantity: item.quantity,
        unitCost: item.product.costPrice,
        moveType: "DELIVERY",
        referenceDoc: deliveryNumber,
        note: `จัดส่งสินค้าให้ลูกค้า ${so.customer.name} (${so.orderNumber} -> ${invoiceNumber})`,
      });
    }

    return NextResponse.json({
      success: true,
      deliveryNumber,
      invoiceNumber,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดในการจัดส่งสินค้า" },
      { status: 500 }
    );
  }
}
