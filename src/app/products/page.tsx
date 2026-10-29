import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories, uoms] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, uom: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.productCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.unitOfMeasure.findMany({ orderBy: { code: "asc" } }),
  ]);

  return <ProductsClient products={products} categories={categories} uoms={uoms} />;
}
