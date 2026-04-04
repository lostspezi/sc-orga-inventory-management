import { getQualityGrade, getQualityGradeColor } from "@/lib/utils/item-quality";
import { useTranslations } from "next-intl";

type Props = {
    quality: number;
};

export default function QualityBadge({ quality }: Props) {
    const t = useTranslations("inventory");
    const grade = getQualityGrade(quality);
    const color = getQualityGradeColor(grade);

    return (
        <span
            className="rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]"
            style={{
                borderColor: `${color}44`,
                background: `${color}22`,
                color,
                fontFamily: "var(--font-mono)",
            }}
        >
            {t(`quality_${grade}`)}
        </span>
    );
}
