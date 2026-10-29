import { prisma } from "@/lib/prisma";
import { SalesClient } from "./sales-client";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const [salesOrders, customers, products, locations] = await Promise.all([
    prisma.salesOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: { include: { product: { include: { uom: true } } } },
        invoices: true,
      },
    }),
    prisma.partner.findMany({
      where: { partnerType: { in: ["CUSTOMER", "BOTH"] }, isActive: true },
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
    <SalesClient
      salesOrders={salesOrders}
      customers={customers}
      products={products}
      locations={locations}
    />
  );
}
