import { getTranslations } from "next-intl/server";
import AuecSettingsPanel from "@/components/orgs/details/auec/auec-settings-panel";
import AuecTransactionForm from "@/components/orgs/details/auec/auec-transaction-form";
import AuecTransactionList from "@/components/orgs/details/auec/auec-transaction-list";
import type { AuecTransactionView } from "@/lib/types/auec-transaction";

type Props = {
    organizationSlug: string;
    currentUserId: string;
    isAdminOrOwner: boolean;
    auecBalance?: number;
    auecBuyPriceDkp?: number;
    auecBuyPriceAuec?: number;
    auecSellPriceDkp?: number;
    auecSellPriceAuec?: number;
    transactions: AuecTransactionView[];
    currentDkp?: number | null;
};

export default async function AuecCashDesk({
    organizationSlug,
    currentUserId,
    isAdminOrOwner,
    auecBalance,
    auecBuyPriceDkp,
    auecBuyPriceAuec,
    auecSellPriceDkp,
    auecSellPriceAuec,
    transactions,
    currentDkp,
}: Props) {
    const t = await getTranslations("auec");

    const ratesConfigured = auecBuyPriceDkp && auecBuyPriceAuec && auecSellPriceDkp && auecSellPriceAuec;

    return (
        <div className="space-y-4">
            {/* Org balance display */}
            <div
                className="rounded-lg border px-4 py-3"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.28)",
                }}
            >
                <p
                    className="text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("balanceLabel")}
                </p>
                <p
                    className="mt-1 text-2xl font-semibold"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}
                >
                    {auecBalance != null ? auecBalance.toLocaleString() : "—"}
                    <span className="ml-2 text-sm font-normal" style={{ color: "rgba(200,220,232,0.5)" }}>
                        aUEC
                    </span>
                </p>
            </div>

            {/* Not configured warning for members */}
            {!isAdminOrOwner && !ratesConfigured && (
                <div
                    className="rounded-lg border p-4"
                    style={{
                        borderColor: "rgba(240,165,0,0.2)",
                        background: "rgba(240,165,0,0.04)",
                    }}
                >
                    <p
                        className="text-sm font-semibold"
                        style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("notConfigured")}
                    </p>
                    <p
                        className="mt-1 text-xs"
                        style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("notConfiguredDesc")}
                    </p>
                </div>
            )}

            {/* Admin settings panel */}
            {isAdminOrOwner && (
                <AuecSettingsPanel
                    organizationSlug={organizationSlug}
                    auecBalance={auecBalance}
                    auecBuyPriceDkp={auecBuyPriceDkp}
                    auecBuyPriceAuec={auecBuyPriceAuec}
                    auecSellPriceDkp={auecSellPriceDkp}
                    auecSellPriceAuec={auecSellPriceAuec}
                />
            )}

            {/* Transaction form (visible to all when rates are configured) */}
            {ratesConfigured && (
                <AuecTransactionForm
                    organizationSlug={organizationSlug}
                    auecBuyPriceDkp={auecBuyPriceDkp}
                    auecBuyPriceAuec={auecBuyPriceAuec}
                    auecSellPriceDkp={auecSellPriceDkp}
                    auecSellPriceAuec={auecSellPriceAuec}
                    currentDkp={currentDkp}
                />
            )}

            {/* Transaction list */}
            <div>
                <p
                    className="mb-2 text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("transactionsLabel")}
                </p>
                <AuecTransactionList
                    transactions={transactions}
                    currentUserId={currentUserId}
                    isAdminOrOwner={isAdminOrOwner}
                />
            </div>
        </div>
    );
}
