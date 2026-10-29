import { prisma } from "@/lib/prisma";
import { PartnersClient } from "./partners-client";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return <PartnersClient partners={partners} />;
}
