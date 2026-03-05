import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { formatWeekRange } from "../week-utils";

interface CoverSectionProps {
    orgName: string;
    weekStart: string;
    weekEnd: string;
    weekLabel: string;
    generatedAt: string;
    timezone: string;
}

export function CoverSection({
    orgName,
    weekStart,
    weekEnd,
    weekLabel,
    generatedAt,
    timezone,
}: CoverSectionProps) {
    const weekRange = formatWeekRange(weekStart, weekEnd);
    const genDate = new Date(generatedAt).toUTCString().replace(" GMT", " UTC");

    return (
        <View style={styles.coverBand}>
            <Text style={styles.coverEyebrow}>SCOIM.IO  //  WEEKLY OPERATIONS REPORT</Text>
            <Text style={styles.coverTitle}>Mission Debrief</Text>
            <Text style={styles.coverOrgName}>{orgName}</Text>
            <View style={styles.coverMeta}>
                <Text style={styles.coverMetaItem}>
                    <Text style={styles.coverMetaLabel}>PERIOD  </Text>
                    {weekRange}
                </Text>
                <Text style={styles.coverMetaItem}>
                    <Text style={styles.coverMetaLabel}>ISO WEEK  </Text>
                    {weekLabel}
                </Text>
                <Text style={styles.coverMetaItem}>
                    <Text style={styles.coverMetaLabel}>TZ  </Text>
                    {timezone}
                </Text>
                <Text style={styles.coverMetaItem}>
                    <Text style={styles.coverMetaLabel}>GENERATED  </Text>
                    {genDate}
                </Text>
            </View>
        </View>
    );
}
