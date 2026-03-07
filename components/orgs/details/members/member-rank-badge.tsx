type Props = {
    rankName: string;
    rankColor?: string;
};

export default function MemberRankBadge({ rankName, rankColor }: Props) {
    const color = rankColor ?? "#4fc3dc";
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
            {rankName}
        </span>
    );
}
