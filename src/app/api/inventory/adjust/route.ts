import { NextResponse } from "next/server";
import { StockService } from "@/lib/stock-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, locationId, quantity, moveType, note } = body;

    if (!productId || !locationId || !quantity || !moveType) {
      return NextResponse.json(
        { error: "กรุณาระบุข้อมูลให้ครบถ้วน (สินค้า, ตำแหน่งจัดเก็บ, จำนวน, ประเภทการปรับ)" },
        { status: 400 }
      );
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json(
        { error: "จำนวนสินค้าต้องเป็นตัวเลขมากกว่า 0" },
        { status: 400 }
      );
    }

    let result;
    if (moveType === "IN") {
      result = await StockService.recordMove({
        productId,
        destLocationId: locationId,
        quantity: qty,
        moveType: "ADJUSTMENT",
        referenceDoc: "STOCK-ADJUST-IN",
        note: note || "ปรับยอดสต็อกเข้าด้วยตนเอง",
      });
    } else {
      result = await StockService.recordMove({
        productId,
        sourceLocationId: locationId,
        quantity: qty,
        moveType: "ADJUSTMENT",
        referenceDoc: "STOCK-ADJUST-OUT",
        note: note || "ปรับลดยอดสต็อกด้วยตนเอง (ตัดชำรุด/สูญหาย)",
      });
    }

    return NextResponse.json({ success: true, move: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดในการบันทึกสต็อก" },
      { status: 500 }
    );
  }
}
