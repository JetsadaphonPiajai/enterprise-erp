import { prisma } from "./prisma";

export type DocType = "PO" | "GRN" | "SO" | "DO" | "INV" | "SM";

export async function getNextSequenceNumber(docType: DocType): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Prefix defaults
  const prefixMap: Record<DocType, string> = {
    PO: "PO",
    GRN: "GRN",
    SO: "SO",
    DO: "DO",
    INV: "INV",
    SM: "SM",
  };

  const prefix = prefixMap[docType] || docType;

  // Use a transaction to safely increment running sequence
  const result = await prisma.$transaction(async (tx) => {
    let seqRecord = await tx.documentSequence.findUnique({
      where: { docType },
    });

    if (!seqRecord) {
      seqRecord = await tx.documentSequence.create({
        data: {
          docType,
          prefix,
          currentYear: year,
          currentMonth: month,
          currentSeq: 1,
        },
      });
      return formatDocNumber(prefix, year, month, 1);
    }

    let nextSeq = seqRecord.currentSeq + 1;
    // Reset sequence if year or month changed
    if (seqRecord.currentYear !== year || seqRecord.currentMonth !== month) {
      nextSeq = 1;
    }

    await tx.documentSequence.update({
      where: { docType },
      data: {
        currentYear: year,
        currentMonth: month,
        currentSeq: nextSeq,
      },
    });

    return formatDocNumber(prefix, year, month, nextSeq);
  });

  return result;
}

function formatDocNumber(prefix: string, year: number, month: number, seq: number): string {
  const yyyy = year.toString();
  const mm = month.toString().padStart(2, "0");
  const ssss = seq.toString().padStart(4, "0");
  return `${prefix}-${yyyy}${mm}-${ssss}`;
}
