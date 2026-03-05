import { StyleSheet } from "@react-pdf/renderer";

export const COLORS = {
    bg:           "#040d15",
    panel:        "#071218",
    panelBorder:  "#0d2535",
    accent:       "#4FC3DC",
    accentDim:    "#0d3a4d",
    textPrimary:  "#d4eaf5",
    textSecondary:"#7aa8be",
    textMuted:    "#3d6070",
    positive:     "#4ade80",
    negative:     "#f87171",
    rowEven:      "#071e2a",
    rowOdd:       "#040d15",
    headerRow:    "#0a2535",
    white:        "#ffffff",
    divider:      "#0d2535",
};

/** Font families — using PDF built-ins for maximum compatibility. */
export const FONTS = {
    display:  "Helvetica-Bold",
    mono:     "Courier",
    monoBold: "Courier-Bold",
    body:     "Helvetica",
};

export const styles = StyleSheet.create({
    page: {
        backgroundColor: COLORS.bg,
        paddingTop: 0,
        paddingBottom: 36,
        paddingHorizontal: 0,
        fontFamily: "Helvetica",
        fontSize: 8,
        color: COLORS.textPrimary,
    },

    // ── Cover / header band ──────────────────────────────────────────────
    coverBand: {
        paddingHorizontal: 36,
        paddingTop: 28,
        paddingBottom: 24,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.accentDim,
    },
    coverEyebrow: {
        fontFamily: "Courier",
        fontSize: 7,
        color: COLORS.accent,
        letterSpacing: 3,
        textTransform: "uppercase",
        marginBottom: 6,
    },
    coverTitle: {
        fontFamily: "Helvetica-Bold",
        fontSize: 18,
        color: COLORS.accent,
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 4,
    },
    coverOrgName: {
        fontFamily: "Helvetica-Bold",
        fontSize: 11,
        color: COLORS.textPrimary,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 8,
    },
    coverMeta: {
        flexDirection: "row",
        gap: 16,
    },
    coverMetaItem: {
        fontFamily: "Courier",
        fontSize: 7,
        color: COLORS.textSecondary,
        letterSpacing: 1,
    },
    coverMetaLabel: {
        color: COLORS.textMuted,
        marginRight: 4,
    },
    accentLine: {
        height: 1,
        backgroundColor: COLORS.accentDim,
        marginBottom: 16,
        marginHorizontal: 36,
    },

    // ── Section wrapper ──────────────────────────────────────────────────
    section: {
        marginHorizontal: 36,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.accentDim,
    },
    sectionEyebrow: {
        fontFamily: "Courier",
        fontSize: 6.5,
        color: COLORS.accent,
        letterSpacing: 2.5,
        textTransform: "uppercase",
    },
    sectionTitle: {
        fontFamily: "Helvetica-Bold",
        fontSize: 9,
        color: COLORS.textPrimary,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },

    // ── KPI grid ─────────────────────────────────────────────────────────
    kpiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    kpiCard: {
        width: "30.5%",
        backgroundColor: COLORS.panel,
        borderWidth: 1,
        borderColor: COLORS.panelBorder,
        borderRadius: 3,
        padding: 10,
    },
    kpiLabel: {
        fontFamily: "Courier",
        fontSize: 6,
        color: COLORS.textMuted,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 4,
    },
    kpiValue: {
        fontFamily: "Helvetica-Bold",
        fontSize: 14,
        color: COLORS.accent,
        marginBottom: 3,
    },
    kpiSubvalue: {
        fontFamily: "Helvetica",
        fontSize: 7,
        color: COLORS.textSecondary,
    },
    kpiDeltaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    kpiDeltaPositive: {
        fontFamily: "Courier-Bold",
        fontSize: 7,
        color: "#4ade80",
    },
    kpiDeltaNegative: {
        fontFamily: "Courier-Bold",
        fontSize: 7,
        color: "#f87171",
    },
    kpiDeltaNeutral: {
        fontFamily: "Courier",
        fontSize: 7,
        color: COLORS.textMuted,
    },

    // ── Tables ────────────────────────────────────────────────────────────
    table: {
        width: "100%",
    },
    tableHeaderRow: {
        flexDirection: "row",
        backgroundColor: COLORS.headerRow,
        paddingVertical: 5,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.accent,
    },
    tableHeaderCell: {
        fontFamily: "Courier-Bold",
        fontSize: 6,
        color: COLORS.accent,
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    tableRowEven: {
        backgroundColor: COLORS.rowEven,
    },
    tableRowOdd: {
        backgroundColor: COLORS.rowOdd,
    },
    tableCell: {
        fontFamily: "Courier",
        fontSize: 7,
        color: COLORS.textPrimary,
    },
    tableCellMuted: {
        fontFamily: "Courier",
        fontSize: 7,
        color: COLORS.textSecondary,
    },
    tableCellBold: {
        fontFamily: "Courier-Bold",
        fontSize: 7,
        color: COLORS.textPrimary,
    },
    tableCellPositive: {
        fontFamily: "Courier",
        fontSize: 7,
        color: "#4ade80",
    },
    tableCellNegative: {
        fontFamily: "Courier",
        fontSize: 7,
        color: "#f87171",
    },

    // ── Footer ────────────────────────────────────────────────────────────
    footer: {
        position: "absolute",
        bottom: 16,
        left: 36,
        right: 36,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: COLORS.accentDim,
        paddingTop: 6,
    },
    footerText: {
        fontFamily: "Courier",
        fontSize: 6,
        color: COLORS.textMuted,
        letterSpacing: 0.8,
    },

    // ── Truncation warning ────────────────────────────────────────────────
    warningBox: {
        marginHorizontal: 36,
        marginBottom: 8,
        padding: 8,
        backgroundColor: "#1a1400",
        borderWidth: 1,
        borderColor: "#a0770040",
        borderRadius: 3,
    },
    warningText: {
        fontFamily: "Courier",
        fontSize: 7,
        color: "#fbbf24",
    },
});
