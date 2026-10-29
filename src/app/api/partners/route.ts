import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, partnerType, taxId, branchCode, phone, email, address, creditTermDays } = body;

    if (!name || !partnerType) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อคู่ค้าและประเภทคู่ค้า (ลูกค้า หรือ ผู้ขาย)" },
        { status: 400 }
      );
    }

    // Auto generate code if not provided
    let partnerCode = code;
    if (!partnerCode) {
      const count = await prisma.partner.count({ where: { partnerType } });
      const prefix = partnerType === "CUSTOMER" ? "CUST" : "VEND";
      partnerCode = `${prefix}-${(count + 1).toString().padStart(4, "0")}`;
    }

    const partner = await prisma.partner.create({
      data: {
        code: partnerCode,
        name,
        partnerType,
        taxId: taxId || null,
        branchCode: branchCode || "00000",
        phone: phone || null,
        email: email || null,
        address: address || null,
        creditTermDays: parseInt(creditTermDays) || 30,
      },
    });

    return NextResponse.json({ success: true, partner });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดในการเพิ่มคู่ค้า" },
      { status: 500 }
    );
  }
}
