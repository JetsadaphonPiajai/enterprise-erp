import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StockService } from "@/lib/stock-service";
import { getNextSequenceNumber } from "@/lib/sequence";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { purchaseOrderId, locationId, note } = body;

    if (!purchaseOrderId || !locationId) {
      return NextResponse.json(
        { error: "กรุณาระบุเลขที่ใบสั่งซื้อและตำแหน่งคลังสินค้าที่ต้องการรับเข้า" },
        { status: 400 }
      );
    }

    const po = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!po) {
      return NextResponse.json({ error: "ไม่พบข้อมูลใบสั่งซื้อ" }, { status: 404 });
    }

    const location = await prisma.stockLocation.findUnique({
      where: { id: locationId },
      include: { warehouse: true },
    });

    if (!location) {
      return NextResponse.json({ error: "ไม่พบตำแหน่งจัดเก็บในคลัง" }, { status: 404 });
    }

    const receiptNumber = await getNextSequenceNumber("GRN");

    // Process Receipt and Stock Moves in Transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create Goods Receipt
      const grn = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          purchaseOrderId: po.id,
          warehouseId: location.warehouseId,
          status: "COMPLETED",
          note: note || `รับสินค้าเข้าคลังตามใบสั่งซื้อ ${po.orderNumber}`,
          items: {
            create: po.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              locationId: location.id,
            })),
          },
        },
      });

      // 2. Mark PO items received and PO as completed
      for (const item of po.items) {
        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: { receivedQty: item.quantity },
        });
      }

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: "COMPLETED" },
      });
    });

    // 3. Record Stock Moves (Double-Entry Ledger) for each item
    for (const item of po.items) {
      await StockService.recordMove({
        productId: item.productId,
        destLocationId: location.id,
        quantity: item.quantity,
        unitCost: item.unitPrice,
        moveType: "RECEIPT",
        referenceDoc: receiptNumber,
        note: `รับเข้าคลัง ${location.warehouse.name} (${po.orderNumber})`,
      });
    }

    return NextResponse.json({ success: true, receiptNumber });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดในการรับสินค้าเข้าคลัง" },
      { status: 500 }
    );
  }
}
