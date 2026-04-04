"use client";

import { useTranslations } from "next-intl";
import { QUALITY_GRADES, getQualityGrade, getQualityGradeDefault, type ItemQualityGrade } from "@/lib/utils/item-quality";

type Props = {
    value: number | undefined;
    onChange: (quality: number | undefined) => void;
    disabled?: boolean;
};

export default function QualityInput({ value, onChange, disabled }: Props) {
    const t = useTranslations("inventory");

    const currentGrade = value !== undefined ? getQualityGrade(value) : "";

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.trim();
        if (raw === "") {
            onChange(undefined);
            return;
        }
        const num = parseInt(raw, 10);
        if (!isNaN(num) && num >= 0 && num <= 1000) {
            onChange(num);
        }
    };

    const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === "") {
            onChange(undefined);
            return;
        }
        onChange(getQualityGradeDefault(val as ItemQualityGrade));
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            <div>
                <label
                    className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                >
                    {t("qualityValue")}
                </label>
                <input
                    type="number"
                    min={0}
                    max={1000}
                    step={1}
                    value={value ?? ""}
                    onChange={handleNumberChange}
                    placeholder="0–1000"
                    disabled={disabled}
                    className="sc-input w-full disabled:opacity-70"
                />
            </div>
            <div>
                <label
                    className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                >
                    {t("qualityGrade")}
                </label>
                <select
                    value={currentGrade}
                    onChange={handleGradeChange}
                    disabled={disabled}
                    className="sc-input w-full disabled:opacity-70"
                    style={{ fontFamily: "var(--font-mono)" }}
                >
                    <option value="">{t("qualityNone")}</option>
                    {QUALITY_GRADES.map((def) => (
                        <option key={def.grade} value={def.grade}>
                            {t(`quality_${def.grade}`)} ({def.min}–{def.max})
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
