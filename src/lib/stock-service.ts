import { prisma } from "./prisma";
import { getNextSequenceNumber } from "./sequence";

export interface StockMoveInput {
  productId: string;
  sourceLocationId?: string | null;
  destLocationId?: string | null;
  quantity: number;
  unitCost?: number;
  moveType: "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT";
  referenceDoc?: string;
  note?: string;
  createdById?: string;
}

export class StockService {
  /**
   * บันทึกการเคลื่อนไหวสต็อก (Stock Move) และอัปเดตยอดคงเหลือสุทธิ (StockQuant) ใน Transaction เดียวกัน
   */
  static async recordMove(input: StockMoveInput) {
    if (input.quantity <= 0) {
      throw new Error("จำนวนสินค้าต้องมากกว่า 0");
    }

    const moveNumber = await getNextSequenceNumber("SM");

    return await prisma.$transaction(async (tx) => {
      // 1. บันทึก Stock Move (Immutable Log)
      const move = await tx.stockMove.create({
        data: {
          moveNumber,
          productId: input.productId,
          sourceLocationId: input.sourceLocationId || null,
          destLocationId: input.destLocationId || null,
          quantity: input.quantity,
          unitCost: input.unitCost ?? 0,
          moveType: input.moveType,
          referenceDoc: input.referenceDoc,
          note: input.note,
          createdById: input.createdById,
        },
      });

      // 2. ปรับลดยอดจากต้นทาง (ถ้ามี sourceLocationId)
      if (input.sourceLocationId) {
        const sourceQuant = await tx.stockQuant.findUnique({
          where: {
            productId_locationId: {
              productId: input.productId,
              locationId: input.sourceLocationId,
            },
          },
        });

        const currentQty = sourceQuant?.quantity ?? 0;
        const newQty = currentQty - input.quantity;

        await tx.stockQuant.upsert({
          where: {
            productId_locationId: {
              productId: input.productId,
              locationId: input.sourceLocationId,
            },
          },
          update: { quantity: newQty },
          create: {
            productId: input.productId,
            locationId: input.sourceLocationId,
            quantity: -input.quantity,
          },
        });
      }

      // 3. ปรับเพิ่มยอดเข้าปลายทาง (ถ้ามี destLocationId)
      if (input.destLocationId) {
        const destQuant = await tx.stockQuant.findUnique({
          where: {
            productId_locationId: {
              productId: input.productId,
              locationId: input.destLocationId,
            },
          },
        });

        const currentQty = destQuant?.quantity ?? 0;
        const newQty = currentQty + input.quantity;

        await tx.stockQuant.upsert({
          where: {
            productId_locationId: {
              productId: input.productId,
              locationId: input.destLocationId,
            },
          },
          update: { quantity: newQty },
          create: {
            productId: input.productId,
            locationId: input.destLocationId,
            quantity: input.quantity,
          },
        });
      }

      return move;
    });
  }

  /**
   * ดึงภาพรวมสต็อกคงเหลือปัจจุบัน พร้อมสถานะแจ้งเตือนสินค้าใกล้หมด
   */
  static async getProductStockSummary() {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        uom: true,
        category: true,
        stockQuants: {
          include: { location: { include: { warehouse: true } } },
        },
      },
      orderBy: { sku: "asc" },
    });

    return products.map((p) => {
      const totalOnHand = p.stockQuants.reduce((sum, q) => sum + q.quantity, 0);
      const isLowStock = p.minStockAlert > 0 && totalOnHand <= p.minStockAlert;

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category?.name || "-",
        uom: p.uom.code,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        totalOnHand,
        minStockAlert: p.minStockAlert,
        isLowStock,
        totalValue: totalOnHand * p.costPrice,
        locations: p.stockQuants.map((q) => ({
          locationName: `${q.location.warehouse.name} (${q.location.name})`,
          quantity: q.quantity,
        })),
      };
    });
  }
}
