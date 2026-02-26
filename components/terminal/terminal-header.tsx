import Link from "next/link";
import { signOutAction } from "@/lib/actions";

type Props = {
    userName: string;
};

export default function TerminalHeader({ userName }: Props) {
    return (
        <header
            className="sticky top-0 z-40 border-b px-4 py-3 sm:px-6"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(6,12,18,0.92)",
                backdropFilter: "blur(10px)",
            }}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                <div className="min-w-0">
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        UEE Terminal
                    </p>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/terminal"
                            className="text-sm font-semibold uppercase tracking-[0.08em]"
                            style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                        >
                            Command Hub
                        </Link>
                        <span
                            className="hidden text-xs sm:inline"
                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                        >
              {userName}
            </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/terminal" className="sc-btn sc-btn-outline">
                        Terminal
                    </Link>

                    <form action={signOutAction}>
                        <button type="submit" className="sc-btn">
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}