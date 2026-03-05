import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ReportDocument } from "./pdf/report-document";
import type { KpiSnapshot } from "@/lib/types/report";
import type { OrganizationTransactionDocument } from "@/lib/types/transaction";

interface GeneratePdfInput {
    orgName: string;
    weekStart: string;
    weekEnd: string;
    weekLabel: string;
    timezone: string;
    generatedAt: string;
    kpi: KpiSnapshot;
    transactions: OrganizationTransactionDocument[];
}

export async function generateReportPdf(input: GeneratePdfInput): Promise<Buffer> {
    const element = React.createElement(ReportDocument, input);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uint8 = await renderToBuffer(element as any);
    return Buffer.from(uint8);
}
