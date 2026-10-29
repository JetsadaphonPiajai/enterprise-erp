import { prisma } from "@/lib/prisma";
import { PurchasingClient } from "./purchasing-client";

export const dynamic = "force-dynamic";

export default async function PurchasingPage() {
  const [purchaseOrders, vendors, products, locations] = await Promise.all([
    prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vendor: true,
        items: { include: { product: { include: { uom: true } } } },
      },
    }),
    prisma.partner.findMany({
      where: { partnerType: { in: ["VENDOR", "BOTH"] }, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { uom: true },
      orderBy: { name: "asc" },
    }),
    prisma.stockLocation.findMany({
      include: { warehouse: true },
      orderBy: { warehouse: { code: "asc" } },
    }),
  ]);

  return (
    <PurchasingClient
      purchaseOrders={purchaseOrders}
      vendors={vendors}
      products={products}
      locations={locations}
    />
  );
}
